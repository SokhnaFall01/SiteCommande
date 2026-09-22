"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ReviewFormState = { error?: string; success?: string } | undefined;

const reviewSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(2, "Nom requis"),
  rating: z.coerce.number().int().min(1, "Note requise").max(5),
  comment: z.string().max(1000).optional(),
});

// Le vendeur ajoute lui-même un avis sur son article (publié directement).
export async function addVendorReviewAction(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) return { error: "Boutique introuvable." };

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.shopId !== shop.id) {
    return { error: "Article introuvable." };
  }

  await prisma.review.create({
    data: {
      productId: product.id,
      authorName: parsed.data.authorName.trim(),
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
      source: "VENDOR",
      status: "APPROVED",
    },
  });

  revalidatePath(`/dashboard/articles/${product.id}`);
  return { success: "Avis ajouté." };
}

// Un client laisse un avis depuis la page publique (en attente de modération).
export async function createCustomerReviewAction(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.status !== "PUBLISHED") {
    return { error: "Article indisponible." };
  }

  await prisma.review.create({
    data: {
      productId: product.id,
      authorName: parsed.data.authorName.trim(),
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
      source: "CUSTOMER",
      status: "PENDING",
    },
  });

  return {
    success: "Merci ! Votre avis sera publié après validation par le vendeur.",
  };
}

const MODERATION = ["APPROVED", "REJECTED", "DELETE"] as const;

// Le vendeur modère un avis : approuver, rejeter, ou supprimer.
export async function moderateReviewAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) return;

  const id = String(formData.get("id") || "");
  const action = String(formData.get("action") || "");
  if (!MODERATION.includes(action as (typeof MODERATION)[number])) return;

  const review = await prisma.review.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!review || review.product.shopId !== shop.id) return;

  if (action === "DELETE") {
    await prisma.review.delete({ where: { id } });
  } else {
    await prisma.review.update({ where: { id }, data: { status: action } });
  }
  revalidatePath(`/dashboard/articles/${review.productId}`);
}
