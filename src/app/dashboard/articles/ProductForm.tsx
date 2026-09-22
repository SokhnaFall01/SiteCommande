"use client";

import { useFormState } from "react-dom";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/products";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  lowStock: boolean;
  images: string[];
};

export function ProductForm({ product }: { product?: Product }) {
  const isEdit = !!product;
  const action = isEdit ? updateProductAction : createProductAction;
  const [state, formAction] = useFormState(action, undefined);

  return (
    <form action={formAction} className="card mt-6 space-y-4">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

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
        <label className="label" htmlFor="title">
          Titre de l&apos;article
        </label>
        <input
          id="title"
          name="title"
          required
          className="input"
          defaultValue={product?.title || ""}
          placeholder="Ex : Sac en cuir fait main"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="input"
          defaultValue={product?.description || ""}
          placeholder="Détails, tailles, couleurs, etc."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="price">
            Prix (F CFA)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            className="input"
            defaultValue={product?.price ?? ""}
            placeholder="15000"
          />
        </div>
        <div>
          <label className="label" htmlFor="oldPrice">
            Ancien prix <span className="text-gray-400">(facultatif)</span>
          </label>
          <input
            id="oldPrice"
            name="oldPrice"
            type="number"
            min={0}
            className="input"
            defaultValue={product?.oldPrice ?? ""}
            placeholder="20000"
          />
          <p className="mt-1 text-xs text-gray-500">
            S&apos;il est supérieur au prix, il s&apos;affiche barré avec la réduction.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="lowStock"
          defaultChecked={product?.lowStock ?? false}
          className="h-4 w-4 rounded border-gray-300"
        />
        Afficher le bandeau <strong>« Stock limité »</strong> sur la page
      </label>

      <div>
        <label className="label">
          Photos <span className="text-gray-400">(3 maximum)</span>
        </label>
        <ImageUploader
          name="images"
          max={3}
          initial={product?.images || []}
          maxDim={1280}
          aspect="square"
        />
      </div>

      <SubmitButton className="btn-primary">
        {isEdit ? "Enregistrer" : "Créer l'article"}
      </SubmitButton>
    </form>
  );
}
