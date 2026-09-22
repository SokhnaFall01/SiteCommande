"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { slugify } from "@/lib/format";
import { getPaymentProvider } from "@/lib/payment";
import { publicationPaidEmail, sendMail } from "@/lib/mailer";

export type FormState = { error?: string; success?: string } | undefined;

const productSchema = z.object({
  title: z.string().min(2, "Titre trop court"),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0, "Prix invalide"),
  images: z.string().optional(),
});

function parseImageList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s))
    .slice(0, 6);
}

async function uniqueProductSlug(
  shopId: string,
  base: string,
  ignoreId?: string
): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { shopId_slug: { shopId, slug } },
    });
    if (!existing || existing.id === ignoreId) return slug;
    i += 1;
    slug = `${slugify(base)}-${i}`;
  }
}

async function requireShop() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  return { user, shop };
}

export async function createProductAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { shop } = await requireShop();
  if (!shop) {
    return { error: "Créez d'abord votre boutique." };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    images: formData.get("images") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = await uniqueProductSlug(shop.id, parsed.data.title);
  const product = await prisma.product.create({
    data: {
      shopId: shop.id,
      title: parsed.data.title.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      price: parsed.data.price,
      images: JSON.stringify(parseImageList(parsed.data.images)),
      status: "DRAFT",
    },
  });

  revalidatePath("/dashboard/articles");
  redirect(`/dashboard/articles/${product.id}`);
}

export async function updateProductAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { shop } = await requireShop();
  if (!shop) return { error: "Boutique introuvable." };

  const id = String(formData.get("id") || "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.shopId !== shop.id) {
    return { error: "Article introuvable." };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    images: formData.get("images") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.update({
    where: { id },
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      price: parsed.data.price,
      images: JSON.stringify(parseImageList(parsed.data.images)),
    },
  });

  revalidatePath(`/dashboard/articles/${id}`);
  revalidatePath("/dashboard/articles");
  return { success: "Article enregistré." };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const { shop } = await requireShop();
  if (!shop) return;
  const id = String(formData.get("id") || "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (product && product.shopId === shop.id) {
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/dashboard/articles");
  redirect("/dashboard/articles");
}

// Publie un article : gratuit si le crédit gratuit n'a pas été utilisé,
// sinon lance un paiement mobile money de 300 F.
export async function publishProductAction(formData: FormData): Promise<void> {
  const { user, shop } = await requireShop();
  if (!shop) redirect("/dashboard/boutique");

  const id = String(formData.get("id") || "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.shopId !== shop.id) {
    redirect("/dashboard/articles");
  }
  if (product.status === "PUBLISHED") {
    redirect(`/dashboard/articles/${id}`);
  }

  // Le crédit gratuit est-il encore disponible ?
  const freeUsed = await prisma.product.count({
    where: { shopId: shop.id, isFreeSlot: true },
  });

  if (freeUsed === 0) {
    await prisma.product.update({
      where: { id },
      data: { status: "PUBLISHED", isFreeSlot: true },
    });
    revalidatePath("/dashboard/articles");
    redirect(`/dashboard/articles/${id}?published=free`);
  }

  // Sinon : paiement requis.
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      productId: product.id,
      amount: config.prixPublication,
      currency: config.devise,
      provider: config.paymentProvider,
      status: "PENDING",
    },
  });

  const provider = getPaymentProvider();
  const checkout = await provider.createCheckout({
    paymentId: payment.id,
    amount: config.prixPublication,
    description: `Publication de l'article "${product.title}"`,
    customerName: user.name,
    customerEmail: user.email,
    returnUrl: `${config.appUrl}/dashboard/articles/${product.id}?paiement=retour`,
    cancelUrl: `${config.appUrl}/dashboard/articles/${product.id}?paiement=annule`,
    callbackUrl: `${config.appUrl}/api/paiement/webhook`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerRef: checkout.providerRef,
      checkoutUrl: checkout.checkoutUrl,
    },
  });
  await prisma.product.update({
    where: { id: product.id },
    data: { status: "PENDING_PAYMENT" },
  });

  redirect(checkout.checkoutUrl);
}

// Confirme un paiement (appelé par le webhook et par le mode mock).
// Idempotent : ne republie pas deux fois.
export async function confirmPayment(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { product: { include: { shop: true } }, user: true },
  });
  if (!payment || payment.status === "PAID") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  await prisma.product.update({
    where: { id: payment.productId },
    data: { status: "PUBLISHED" },
  });

  const publicUrl = `${config.appUrl}/b/${payment.product.shop.slug}/${payment.product.slug}`;
  const mail = publicationPaidEmail({
    productTitle: payment.product.title,
    amount: payment.amount,
    publicUrl,
  });
  await sendMail({ to: payment.user.email, ...mail });
}

export async function markPaymentFailed(
  paymentId: string,
  status: "FAILED" | "CANCELLED"
): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === "PAID") return;
  await prisma.payment.update({ where: { id: payment.id }, data: { status } });
  // On remet l'article en brouillon pour permettre une nouvelle tentative.
  await prisma.product.update({
    where: { id: payment.productId },
    data: { status: "DRAFT" },
  });
}
