"use client";

import { useFormState } from "react-dom";
import { createCustomerReviewAction } from "@/actions/reviews";
import { SubmitButton } from "@/components/SubmitButton";
import { StarPicker } from "@/components/StarPicker";

export function CustomerReviewForm({
  productId,
  color = "#0c9051",
}: {
  productId: string;
  color?: string;
}) {
  const [state, formAction] = useFormState(createCustomerReviewAction, undefined);

  if (state?.success) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <p className="font-medium">Laisser un avis</p>
      <input type="hidden" name="productId" value={productId} />

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="label" htmlFor="authorName">
          Votre nom
        </label>
        <input id="authorName" name="authorName" required className="input" />
      </div>
      <div>
        <label className="label">Votre note</label>
        <StarPicker defaultValue={5} />
      </div>
      <div>
        <label className="label" htmlFor="comment">
          Commentaire <span className="text-gray-400">(facultatif)</span>
        </label>
        <textarea id="comment" name="comment" rows={2} className="input" />
      </div>
      <SubmitButton
        className="btn text-white hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        Envoyer mon avis
      </SubmitButton>
    </form>
  );
}
