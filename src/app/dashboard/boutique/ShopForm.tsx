"use client";

import { useFormState } from "react-dom";
import { saveShopAction } from "@/actions/shop";
import { SubmitButton } from "@/components/SubmitButton";

type ShopData = {
  name: string;
  description: string | null;
  contactPhone: string;
  whatsapp: string | null;
  logoUrl: string | null;
} | null;

export function ShopForm({ shop }: { shop: ShopData }) {
  const [state, formAction] = useFormState(saveShopAction, undefined);

  return (
    <form action={formAction} className="card mt-6 space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          {state.success}
        </p>
      )}

      <div>
        <label className="label" htmlFor="name">
          Nom de la boutique
        </label>
        <input
          id="name"
          name="name"
          required
          className="input"
          defaultValue={shop?.name || ""}
          placeholder="Ex : Chez Awa"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          defaultValue={shop?.description || ""}
          placeholder="Décrivez votre activité en quelques mots"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contactPhone">
            Téléphone de contact
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            required
            className="input"
            defaultValue={shop?.contactPhone || ""}
            placeholder="77 000 00 00"
          />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">
            WhatsApp <span className="text-gray-400">(facultatif)</span>
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            className="input"
            defaultValue={shop?.whatsapp || ""}
            placeholder="221 77 000 00 00"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="logoUrl">
          Logo (lien d&apos;image) <span className="text-gray-400">(facultatif)</span>
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          className="input"
          defaultValue={shop?.logoUrl || ""}
          placeholder="https://…"
        />
      </div>

      <SubmitButton className="btn-primary">
        {shop ? "Enregistrer les modifications" : "Créer ma boutique"}
      </SubmitButton>
    </form>
  );
}
