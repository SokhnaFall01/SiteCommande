import { config } from "../config";
import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  PaymentStatus,
  WebhookResult,
} from "./types";

// Fournisseur de test : aucune vraie transaction.
// Le "checkout" est une page interne qui simule le paiement mobile money
// et confirme automatiquement via le webhook.
export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const ref = `mock_${params.paymentId}`;
    const url = `${config.appUrl}/paiement/mock?ref=${encodeURIComponent(
      ref
    )}&pid=${encodeURIComponent(params.paymentId)}`;
    return { checkoutUrl: url, providerRef: ref };
  }

  async verifyPayment(): Promise<PaymentStatus> {
    // En mode test, on considère le paiement comme réussi.
    return "PAID";
  }

  async parseWebhook(body: unknown): Promise<WebhookResult | null> {
    const data = (body || {}) as Record<string, unknown>;
    const paymentId = typeof data.pid === "string" ? data.pid : null;
    const providerRef =
      typeof data.ref === "string" ? data.ref : `mock_${paymentId}`;
    const decision = data.decision === "cancel" ? "CANCELLED" : "PAID";
    return { providerRef, paymentId, status: decision };
  }
}
