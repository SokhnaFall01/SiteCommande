import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { formatFCFA, parseImages } from "@/lib/format";
import {
  deleteProductAction,
  publishProductAction,
} from "@/actions/products";
import { ProductForm } from "../ProductForm";
import { ProductStatusBadge } from "@/components/badges";
import { CopyLink } from "@/components/CopyLink";

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { published?: string; paiement?: string };
}) {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) notFound();

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!product || product.shopId !== shop.id) notFound();

  const freeUsed = await prisma.product.count({
    where: { shopId: shop.id, isFreeSlot: true },
  });
  const willBeFree = freeUsed === 0;
  const publicUrl = `${config.appUrl}/b/${shop.slug}/${product.slug}`;

  return (
    <div>
      <Link href="/dashboard/articles" className="text-sm text-brand-700">
        ← Retour aux articles
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <ProductStatusBadge status={product.status} />
      </div>

      {searchParams.published === "free" && (
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          🎉 Article publié gratuitement ! Partagez le lien ci-dessous.
        </p>
      )}
      {searchParams.paiement === "retour" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Merci ! Dès que le paiement est confirmé, votre article passe en
          « Publié » (rafraîchissez la page dans un instant).
        </p>
      )}
      {searchParams.paiement === "annule" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Paiement annulé. Vous pouvez réessayer de publier l&apos;article.
        </p>
      )}

      {/* Publication / lien public */}
      <div className="card mt-6">
        {product.status === "PUBLISHED" ? (
          <>
            <h2 className="font-semibold">Lien de commande à partager</h2>
            <p className="mt-1 text-sm text-gray-600">
              Envoyez ce lien à vos clients (WhatsApp, Instagram…).
            </p>
            <div className="mt-3">
              <CopyLink url={publicUrl} />
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-brand-700"
            >
              Ouvrir la page publique ↗
            </a>
          </>
        ) : (
          <>
            <h2 className="font-semibold">Publier cet article</h2>
            <p className="mt-1 text-sm text-gray-600">
              {willBeFree ? (
                <>
                  Cet article sera publié{" "}
                  <strong>gratuitement</strong> (crédit offert).
                </>
              ) : (
                <>
                  La publication coûte{" "}
                  <strong>{formatFCFA(config.prixPublication)}</strong>. Vous
                  serez redirigé vers le paiement mobile money.
                </>
              )}
            </p>
            <form action={publishProductAction} className="mt-4">
              <input type="hidden" name="id" value={product.id} />
              <button type="submit" className="btn-primary">
                {willBeFree
                  ? "Publier gratuitement"
                  : `Publier — ${formatFCFA(config.prixPublication)}`}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Aperçu images */}
      {parseImages(product.images).length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {parseImages(product.images).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
            />
          ))}
        </div>
      )}

      {/* Édition */}
      <h2 className="mt-8 text-lg font-semibold">Modifier l&apos;article</h2>
      <ProductForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          images: parseImages(product.images),
        }}
      />

      {/* Suppression */}
      <form action={deleteProductAction} className="mt-6">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="btn-danger">
          Supprimer cet article
        </button>
      </form>
    </div>
  );
}
