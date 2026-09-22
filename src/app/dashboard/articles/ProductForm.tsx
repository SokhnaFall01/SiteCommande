"use client";

import { useFormState } from "react-dom";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/products";
import { SubmitButton } from "@/components/SubmitButton";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
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
        <label className="label" htmlFor="images">
          Photos <span className="text-gray-400">(liens, un par ligne)</span>
        </label>
        <textarea
          id="images"
          name="images"
          rows={3}
          className="input"
          defaultValue={(product?.images || []).join("\n")}
          placeholder="https://exemple.com/photo1.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Collez les liens de vos images (jusqu&apos;à 6).
        </p>
      </div>

      <SubmitButton className="btn-primary">
        {isEdit ? "Enregistrer" : "Créer l'article"}
      </SubmitButton>
    </form>
  );
}
