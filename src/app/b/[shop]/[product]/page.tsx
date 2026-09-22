import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatFCFA, parseImages, discountPercent, averageRating } from "@/lib/format";
import { Stars } from "@/components/Stars";
import { OrderForm } from "./OrderForm";
import { CustomerReviewForm } from "./CustomerReviewForm";

async function getProduct(shopSlug: string, productSlug: string) {
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) return null;
  const product = await prisma.product.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug: productSlug } },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product || product.status !== "PUBLISHED") return null;
  return { shop, product };
}

export async function generateMetadata({
  params,
}: {
  params: { shop: string; product: string };
}): Promise<Metadata> {
  const data = await getProduct(params.shop, params.product);
  if (!data) return { title: "Article introuvable" };
  return {
    title: `${data.product.title} — ${data.shop.name}`,
    description: data.product.description || undefined,
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: { shop: string; product: string };
}) {
  const data = await getProduct(params.shop, params.product);
  if (!data) notFound();
  const { shop, product } = data;
  const images = parseImages(product.images);
  const color = shop.primaryColor || "#0c9051";
  const reviews = product.reviews;
  const avg = averageRating(reviews);
  const discount = product.oldPrice ? discountPercent(product.oldPrice, product.price) : 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href={`/b/${shop.slug}`} className="font-bold" style={{ color }}>
            {shop.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Détails de l'article */}
          <div>
            {images.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0]}
                  alt={product.title}
                  className="w-full rounded-xl border border-gray-200 object-cover"
                />
                {images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {images.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-gray-400">
                Pas de photo
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold">{product.title}</h1>

            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Stars rating={avg} />
                <span>
                  {avg.toString().replace(".", ",")} · {reviews.length} avis
                </span>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold" style={{ color }}>
                {formatFCFA(product.price)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatFCFA(product.oldPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="badge bg-red-600 text-white">-{discount} %</span>
                  )}
                </>
              )}
            </div>

            {product.lowStock && (
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                <p className="text-sm font-semibold text-orange-800">
                  ⚡ Stock limité — commandez vite avant rupture
                </p>
              </div>
            )}

            {product.description && (
              <p className="mt-4 whitespace-pre-line text-gray-600">
                {product.description}
              </p>
            )}
          </div>

          {/* Formulaire de commande */}
          <div>
            <OrderForm productId={product.id} color={color} />
          </div>
        </div>

        {/* Avis clients */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold">Avis clients</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Stars rating={avg} />
                <span>
                  {avg.toString().replace(".", ",")} / 5 · {reviews.length} avis
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article key={r.id} className="card">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {r.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.authorName}</p>
                      <p className="text-xs" style={{ color }}>
                        ✓ Avis vérifié
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Stars rating={r.rating} className="text-sm" />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Aucun avis pour le moment. Soyez le premier à en laisser un !
            </p>
          )}

          <div className="mt-6 max-w-md">
            <CustomerReviewForm productId={product.id} color={color} />
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-500">
          Propulsé par{" "}
          <Link href="/" className="font-medium text-brand-700">
            SiteCommande
          </Link>
        </div>
      </footer>
    </div>
  );
}
