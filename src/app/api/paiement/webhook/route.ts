import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";
import { confirmPayment, markPaymentFailed } from "@/actions/products";

// Webhook (IPN) appelé par le fournisseur de paiement (PayDunya).
export async function POST(req: NextRequest) {
  const provider = getPaymentProvider();

  // Le corps peut être du JSON ou du form-urlencoded selon le fournisseur.
  let body: unknown = {};
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }
  } catch {
    body = {};
  }

  const result = await provider.parseWebhook(body, req.headers);
  if (!result) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Retrouver le paiement : via notre id, sinon via la référence fournisseur.
  let paymentId = result.paymentId;
  if (!paymentId && result.providerRef) {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: result.providerRef },
    });
    paymentId = payment?.id || null;
  }

  if (!paymentId) {
    return NextResponse.json({ ok: false, reason: "paiement introuvable" }, { status: 404 });
  }

  if (result.status === "PAID") {
    await confirmPayment(paymentId);
  } else if (result.status === "FAILED" || result.status === "CANCELLED") {
    await markPaymentFailed(paymentId, result.status);
  }

  return NextResponse.json({ ok: true });
}
