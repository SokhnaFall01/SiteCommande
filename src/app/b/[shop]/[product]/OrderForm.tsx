"use client";

import { useFormState } from "react-dom";
import { createOrderAction } from "@/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";

export function OrderForm({ productId }: { productId: string }) {
  const [state, formAction] = useFormState(createOrderAction, undefined);

  if (state?.success) {
    return (
      <div className="card border-brand-200 bg-brand-50">
        <h3 className="font-semibold text-brand-900">Commande envoyée ✅</h3>
        <p className="mt-1 text-sm text-brand-800">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-4">
      <h3 className="font-semibold">Passer commande</h3>
      <input type="hidden" name="productId" value={productId} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className="label" htmlFor="customerName">
          Votre nom
        </label>
        <input id="customerName" name="customerName" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="customerPhone">
          Téléphone
        </label>
        <input
          id="customerPhone"
          name="customerPhone"
          required
          className="input"
          placeholder="77 000 00 00"
        />
      </div>
      <div>
        <label className="label" htmlFor="quantity">
          Quantité
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="customerAddress">
          Adresse <span className="text-gray-400">(facultatif)</span>
        </label>
        <input id="customerAddress" name="customerAddress" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="note">
          Note <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea id="note" name="note" rows={2} className="input" />
      </div>

      <SubmitButton className="btn-primary w-full">Envoyer la commande</SubmitButton>
      <p className="text-center text-xs text-gray-500">
        Aucun paiement en ligne — le vendeur vous contactera.
      </p>
    </form>
  );
}
