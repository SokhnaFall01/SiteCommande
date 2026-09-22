"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingLabel,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} style={style}>
      {pending ? pendingLabel || "Veuillez patienter…" : children}
    </button>
  );
}
