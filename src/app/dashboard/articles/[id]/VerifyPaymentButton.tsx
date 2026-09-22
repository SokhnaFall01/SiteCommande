"use client";

import { useEffect, useRef } from "react";
import { verifyPaymentAction } from "@/actions/products";
import { SubmitButton } from "@/components/SubmitButton";

// Bouton "vérifier le paiement". Si `auto` est vrai (retour de PayDunya),
// il se soumet automatiquement une fois au chargement.
export function VerifyPaymentButton({
  paymentId,
  auto = false,
}: {
  paymentId: string;
  auto?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => formRef.current?.requestSubmit(), 1200);
      return () => clearTimeout(t);
    }
  }, [auto]);

  return (
    <form action={verifyPaymentAction} ref={formRef}>
      <input type="hidden" name="paymentId" value={paymentId} />
      <SubmitButton className="btn-primary" pendingLabel="Vérification…">
        J&apos;ai payé — vérifier maintenant
      </SubmitButton>
    </form>
  );
}
