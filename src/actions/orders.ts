"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { newOrderEmail, sendMail } from "@/lib/mailer";

export type OrderFormState =
  | { error?: string; success?: string }
  | undefined;

const orderSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2, "Votre nom est requis"),
  customerPhone: z.string().min(6, "Un numéro de téléphone valide est requis"),
  customerAddress: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
  note: z.string().optional(),
});

// Création d'une commande depuis la page publique (client, sans compte).
export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const parsed = orderSchema.safeParse({
    productId: formData.get("productId"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerAddress: formData.get("customerAddress") || undefined,
    quantity: formData.get("quantity") || 1,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { shop: { include: { user: true } } },
  });
  if (!product || product.status !== "PUBLISHED" || !product.shop.isActive) {
    return { error: "Cet article n'est plus disponible." };
  }

  await prisma.order.create({
    data: {
      productId: product.id,
      customerName: parsed.data.customerName.trim(),
      customerPhone: parsed.data.customerPhone.trim(),
      customerAddress: parsed.data.customerAddress?.trim() || null,
      quantity: parsed.data.quantity,
      note: parsed.data.note?.trim() || null,
      status: "NEW",
    },
  });

  const mail = newOrderEmail({
    shopName: product.shop.name,
    productTitle: product.title,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerAddress: parsed.data.customerAddress,
    quantity: parsed.data.quantity,
    note: parsed.data.note,
    dashboardUrl: `${config.appUrl}/dashboard/commandes`,
  });
  await sendMail({ to: product.shop.user.email, ...mail });

  return { success: "Votre commande a bien été envoyée. Le vendeur va vous contacter." };
}

const ALLOWED_STATUS = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"] as const;

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) return;

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) return;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!order || order.product.shopId !== shop.id) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/commandes");
}
