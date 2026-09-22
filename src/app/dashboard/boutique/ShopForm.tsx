"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { saveShopAction } from "@/actions/shop";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";

type ShopData = {
  name: string;
  description: string | null;
  contactPhone: string;
  whatsapp: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
} | null;

const PRESET_COLORS = [
  "#0c9051",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#111827",
];

export function ShopForm({ shop }: { shop: ShopData }) {
  const [state, formAction] = useFormState(saveShopAction, undefined);
  const [color, setColor] = useState(shop?.primaryColor || "#0c9051");

  return (
    <form action={formAction} className="card mt-6 space-y-5">
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

      {/* Personnalisation */}
      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold">Personnalisation</h3>
        <p className="mt-1 text-sm text-gray-600">
          Ces éléments apparaissent sur votre page publique.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Logo</label>
            <ImageUploader
              name="logoUrl"
              max={1}
              initial={shop?.logoUrl ? [shop.logoUrl] : []}
              maxDim={400}
              aspect="square"
            />
          </div>
          <div>
            <label className="label">Bannière</label>
            <ImageUploader
              name="bannerUrl"
              max={1}
              initial={shop?.bannerUrl ? [shop.bannerUrl] : []}
              maxDim={1600}
              aspect="banner"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="primaryColor">
            Couleur principale
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="primaryColor"
              name="primaryColor"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300"
            />
            <span className="font-mono text-sm text-gray-600">{color}</span>
            <div className="flex flex-wrap gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border border-white shadow ring-1 ring-gray-200"
                  style={{ backgroundColor: c }}
                  aria-label={`Choisir ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <SubmitButton className="btn-primary">
        {shop ? "Enregistrer les modifications" : "Créer ma boutique"}
      </SubmitButton>
    </form>
  );
}
