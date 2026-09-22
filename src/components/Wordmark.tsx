// Nom de la marque en deux couleurs, comme le logo : "Sama" (vert) + "Boutik" (or).
export function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`font-extrabold ${className}`}>
      <span className={onDark ? "text-white" : "text-brand-700"}>Sama</span>
      <span className="text-gold-500">Boutik</span>
    </span>
  );
}
