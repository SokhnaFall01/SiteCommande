import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";
import { confirmPayment, markPaymentFailed } from "@/actions/products";

// Transforme des clés de formulaire "a[b][c]" en objet imbriqué { a: { b: { c } } }.
function expandBracketKeys(form: FormData): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    const parts = key
      .replace(/\]/g, "")
      .split("[")
      .filter(Boolean);
    let node: Record<string, unknown> = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        node[part] = typeof value === "string" ? value : String(value);
      } else {
        if (typeof node[part] !== "object" || node[part] === null) {
          node[part] = {};
        }
        node = node[part] as Record<string, unknown>;
      }
    });
  }
  return root;
}

// Webhook (IPN) appelé par le fournisseur de paiement (PayDunya).
export async function POST(req: NextRequest) {
  const provider = getPaymentProvider();

  // Le corps peut être du JSON ou du form-urlencoded selon le fournisseur.
  // PayDunya envoie des clés imbriquées façon data[status], data[custom_data][paymentId]…
  let body: unknown = {};
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = expandBracketKeys(form);
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
