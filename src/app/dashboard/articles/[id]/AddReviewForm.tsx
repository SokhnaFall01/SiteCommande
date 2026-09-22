"use client";

import { useFormState } from "react-dom";
import { addVendorReviewAction } from "@/actions/reviews";
import { SubmitButton } from "@/components/SubmitButton";
import { StarPicker } from "@/components/StarPicker";

export function AddReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useFormState(addVendorReviewAction, undefined);

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium">Ajouter un avis</p>
      <input type="hidden" name="productId" value={productId} />

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded bg-brand-50 px-3 py-2 text-sm text-brand-800">{state.success}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="authorName">
            Nom du client
          </label>
          <input id="authorName" name="authorName" required className="input" />
        </div>
        <div>
          <label className="label">Note</label>
          <StarPicker defaultValue={5} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="comment">
          Commentaire <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea id="comment" name="comment" rows={2} className="input" />
      </div>
      <SubmitButton className="btn-outline">Ajouter l&apos;avis</SubmitButton>
    </form>
  );
}
