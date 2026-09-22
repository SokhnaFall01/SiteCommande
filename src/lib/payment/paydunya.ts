import { config } from "../config";
import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  PaymentStatus,
  WebhookResult,
} from "./types";

// Intégration PayDunya (https://paydunya.com) — Checkout Invoice API.
// Supporte Wave, Orange Money, Free Money au Sénégal.
export class PayDunyaProvider implements PaymentProvider {
  readonly name = "paydunya";

  private get baseUrl(): string {
    return config.paydunya.mode === "live"
      ? "https://app.paydunya.com/api/v1"
      : "https://app.paydunya.com/sandbox-api/v1";
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": config.paydunya.masterKey,
      "PAYDUNYA-PRIVATE-KEY": config.paydunya.privateKey,
      "PAYDUNYA-TOKEN": config.paydunya.token,
    };
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const payload = {
      invoice: {
        total_amount: params.amount,
        description: params.description,
      },
      store: { name: "SamaBoutik" },
      custom_data: { paymentId: params.paymentId },
      actions: {
        cancel_url: params.cancelUrl,
        return_url: params.returnUrl,
        callback_url: params.callbackUrl,
      },
    };

    const res = await fetch(`${this.baseUrl}/checkout-invoice/create`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as {
      response_code?: string;
      response_text?: string;
      token?: string;
    };

    if (data.response_code !== "00" || !data.token) {
      throw new Error(
        `PayDunya: échec de création du paiement (${data.response_text || "erreur inconnue"})`
      );
    }

    const checkoutUrl =
      data.response_text && data.response_text.startsWith("http")
        ? data.response_text
        : `https://paydunya.com/checkout/invoice/${data.token}`;

    return { checkoutUrl, providerRef: data.token };
  }

  async verifyPayment(token: string): Promise<PaymentStatus> {
    if (!token) return "PENDING";
    try {
      const res = await fetch(`${this.baseUrl}/checkout-invoice/confirm/${token}`, {
        method: "GET",
        headers: this.headers,
      });
      const data = (await res.json()) as {
        status?: string;
        invoice?: { status?: string };
      };
      const status = data.status || data.invoice?.status || "";
      return status === "completed"
        ? "PAID"
        : status === "cancelled"
          ? "CANCELLED"
          : status === "failed"
            ? "FAILED"
            : "PENDING";
    } catch {
      return "PENDING";
    }
  }

  async parseWebhook(body: unknown): Promise<WebhookResult | null> {
    // PayDunya envoie un champ "data" (objet ou JSON encodé selon le format).
    const raw = (body || {}) as Record<string, unknown>;
    let data: Record<string, unknown> = raw;
    if (raw.data) {
      data =
        typeof raw.data === "string"
          ? (JSON.parse(raw.data) as Record<string, unknown>)
          : (raw.data as Record<string, unknown>);
    }

    const status =
      (data.status as string) ||
      ((data.invoice as Record<string, unknown>)?.status as string) ||
      "";
    const token =
      (data.token as string) ||
      ((data.invoice as Record<string, unknown>)?.token as string) ||
      "";
    const custom = (data.custom_data as Record<string, unknown>) || {};
    const paymentId =
      typeof custom.paymentId === "string" ? custom.paymentId : null;

    const normalized: WebhookResult["status"] =
      status === "completed"
        ? "PAID"
        : status === "cancelled"
          ? "CANCELLED"
          : status === "failed"
            ? "FAILED"
            : "PENDING";

    return { providerRef: token, paymentId, status: normalized };
  }
}
