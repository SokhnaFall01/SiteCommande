import { Wordmark } from "./Wordmark";

// Icône du logo + nom de la marque, pour les en-têtes et barres latérales.
export function BrandLogo({
  onDark = false,
  className = "text-xl",
  markSize = 36,
}: {
  onDark?: boolean;
  className?: string;
  markSize?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="SamaBoutik"
        width={markSize}
        height={markSize}
        className="rounded-lg"
        style={{ width: markSize, height: markSize }}
      />
      <Wordmark className={className} onDark={onDark} />
    </span>
  );
}
