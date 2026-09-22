"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";

export type FormState = { error?: string; success?: string } | undefined;

const shopSchema = z.object({
  name: z.string().min(2, "Nom de la boutique trop court"),
  description: z.string().optional(),
  contactPhone: z.string().min(6, "Téléphone de contact requis"),
  whatsapp: z.string().optional(),
  logoUrl: z.string().url("Lien de logo invalide").optional().or(z.literal("")),
});

async function uniqueShopSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  while (true) {
    const existing = await prisma.shop.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    i += 1;
    slug = `${slugify(base)}-${i}`;
  }
}

export async function saveShopAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = shopSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    contactPhone: formData.get("contactPhone"),
    whatsapp: formData.get("whatsapp") || undefined,
    logoUrl: formData.get("logoUrl") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const existing = await prisma.shop.findUnique({ where: { userId: user.id } });

  if (existing) {
    await prisma.shop.update({
      where: { id: existing.id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        contactPhone: data.contactPhone.trim(),
        whatsapp: data.whatsapp?.trim() || null,
        logoUrl: data.logoUrl || null,
      },
    });
  } else {
    const slug = await uniqueShopSlug(data.name);
    await prisma.shop.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        contactPhone: data.contactPhone.trim(),
        whatsapp: data.whatsapp?.trim() || null,
        logoUrl: data.logoUrl || null,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/boutique");
  return { success: "Boutique enregistrée." };
}
