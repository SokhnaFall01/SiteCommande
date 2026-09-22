import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatFCFA, parseImages } from "@/lib/format";
import { OrderForm } from "./OrderForm";

async function getProduct(shopSlug: string, productSlug: string) {
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop || !shop.isActive) return null;
  const product = await prisma.product.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug: productSlug } },
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
            <p className="mt-2 text-2xl font-extrabold" style={{ color }}>
              {formatFCFA(product.price)}
            </p>
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
