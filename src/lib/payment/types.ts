// Interface commune à tous les fournisseurs de paiement mobile money.

export type CheckoutParams = {
  paymentId: string; // notre identifiant interne (Payment.id)
  amount: number; // en F CFA
  description: string;
  customerName?: string;
  customerEmail?: string;
  returnUrl: string; // où renvoyer le vendeur après paiement
  cancelUrl: string;
  callbackUrl: string; // webhook (IPN) appelé par le fournisseur
};

export type CheckoutResult = {
  checkoutUrl: string; // URL vers laquelle rediriger le vendeur
  providerRef: string; // référence du fournisseur (token, invoice id...)
};

export type WebhookResult = {
  providerRef: string;
  paymentId: string | null; // notre Payment.id si retrouvable
  status: "PAID" | "FAILED" | "CANCELLED" | "PENDING";
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  parseWebhook(body: unknown, headers: Headers): Promise<WebhookResult | null>;
}
