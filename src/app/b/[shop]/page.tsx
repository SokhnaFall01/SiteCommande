import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatFCFA, parseImages } from "@/lib/format";

async function getShop(slug: string) {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!shop || !shop.isActive) return null;
  return shop;
}

export async function generateMetadata({
  params,
}: {
  params: { shop: string };
}): Promise<Metadata> {
  const shop = await getShop(params.shop);
  if (!shop) return { title: "Boutique introuvable" };
  return { title: shop.name, description: shop.description || undefined };
}

export default async function PublicShopPage({
  params,
}: {
  params: { shop: string };
}) {
  const shop = await getShop(params.shop);
  if (!shop) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-4">
            {shop.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="h-14 w-14 rounded-full border border-gray-200 object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              {shop.description && (
                <p className="text-sm text-gray-600">{shop.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {shop.products.length === 0 ? (
          <p className="text-center text-gray-500">
            Cette boutique n&apos;a pas encore d&apos;article publié.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shop.products.map((p) => {
              const img = parseImages(p.images)[0];
              return (
                <Link
                  key={p.id}
                  href={`/b/${shop.slug}/${p.slug}`}
                  className="card transition hover:shadow-md"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.title}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      Pas de photo
                    </div>
                  )}
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 font-bold text-brand-700">
                    {formatFCFA(p.price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
