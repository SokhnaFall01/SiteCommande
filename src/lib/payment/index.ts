import { config } from "../config";
import { MockProvider } from "./mock";
import { PayDunyaProvider } from "./paydunya";
import type { PaymentProvider } from "./types";

let instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;
  switch (config.paymentProvider) {
    case "paydunya":
      instance = new PayDunyaProvider();
      break;
    case "mock":
    default:
      instance = new MockProvider();
      break;
  }
  return instance;
}

export * from "./types";
