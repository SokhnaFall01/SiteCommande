"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function toggleShopActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const shop = await prisma.shop.findUnique({ where: { id } });
  if (!shop) return;
  await prisma.shop.update({
    where: { id },
    data: { isActive: !shop.isActive },
  });
  revalidatePath("/admin/boutiques");
}
