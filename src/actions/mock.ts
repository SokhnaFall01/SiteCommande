"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { confirmPayment, markPaymentFailed } from "./products";

// Simulation de paiement (mode mock uniquement, pour tester sans argent réel).
export async function mockPaymentDecision(formData: FormData): Promise<void> {
  const user = await requireUser();
  const paymentId = String(formData.get("paymentId") || "");
  const decision = String(formData.get("decision") || "");

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { product: true },
  });
  if (!payment || payment.userId !== user.id) {
    redirect("/dashboard/articles");
  }

  if (decision === "pay") {
    await confirmPayment(paymentId);
    redirect(`/dashboard/articles/${payment.productId}?paiement=retour`);
  } else {
    await markPaymentFailed(paymentId, "CANCELLED");
    redirect(`/dashboard/articles/${payment.productId}?paiement=annule`);
  }
}
