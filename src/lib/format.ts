// Utilitaires de formatage et de slug.

export function formatFCFA(amount: number): string {
  const n = Math.round(amount || 0);
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} F CFA`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "boutique";
}

export function parseImages(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Une source d'image valide est soit une URL http(s), soit un fichier uploadé
// servi sous /uploads/.
export function isValidImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src) || /^\/uploads\/[\w.\-]+$/.test(src);
}

// Pourcentage de réduction entre l'ancien prix et le prix actuel.
export function discountPercent(oldPrice: number, price: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Moyenne des notes d'une liste d'avis (arrondie à 1 décimale).
export function averageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
