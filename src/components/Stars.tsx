// Affichage d'une note en étoiles (composant serveur, non interactif).
export function Stars({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className={className}
      style={{ color: "#f59e0b", letterSpacing: "1px" }}
      aria-label={`${rating} sur 5`}
    >
      {"★".repeat(full)}
      <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}
