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
import { Stars } from "@/components/Stars";
import { AddReviewForm } from "./AddReviewForm";
import { VerifyPaymentButton } from "./VerifyPaymentButton";
import { moderateReviewAction } from "@/actions/reviews";
import { formatDate } from "@/lib/format";

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
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });
  if (!product || product.shopId !== shop.id) notFound();

  const pendingReviews = product.reviews.filter((r) => r.status === "PENDING");
  const approvedReviews = product.reviews.filter((r) => r.status === "APPROVED");

  const freeUsed = await prisma.product.count({
    where: { shopId: shop.id, isFreeSlot: true },
  });
  const willBeFree = freeUsed === 0;
  const publicUrl = `${config.appUrl}/b/${shop.slug}/${product.slug}`;

  // Paiement en attente pour cet article (pour la vérification manuelle/auto)
  const pendingPayment =
    product.status === "PENDING_PAYMENT"
      ? await prisma.payment.findFirst({
          where: { productId: product.id, status: "PENDING" },
          orderBy: { createdAt: "desc" },
        })
      : null;

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
        ) : product.status === "PENDING_PAYMENT" ? (
          <>
            <h2 className="font-semibold">Paiement en attente de confirmation</h2>
            <p className="mt-1 text-sm text-gray-600">
              Si vous venez de payer, cliquez pour confirmer et publier
              l&apos;article. La confirmation peut prendre quelques secondes.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {pendingPayment && (
                <VerifyPaymentButton
                  paymentId={pendingPayment.id}
                  auto={searchParams.paiement === "retour"}
                />
              )}
              <form action={publishProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <button type="submit" className="btn-outline">
                  Relancer le paiement
                </button>
              </form>
            </div>
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
          oldPrice: product.oldPrice,
          lowStock: product.lowStock,
          images: parseImages(product.images),
        }}
      />

      {/* Avis */}
      <h2 className="mt-8 text-lg font-semibold">
        Avis clients ({approvedReviews.length} publié
        {approvedReviews.length > 1 ? "s" : ""})
      </h2>

      {pendingReviews.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            {pendingReviews.length} avis en attente de validation
          </p>
          <div className="mt-3 space-y-3">
            {pendingReviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-amber-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.authorName}</span>
                    <Stars rating={r.rating} className="text-sm" />
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-gray-700">{r.comment}</p>}
                <div className="mt-2 flex gap-2">
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="APPROVED" />
                    <button className="btn-primary py-1 text-xs">Publier</button>
                  </form>
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="DELETE" />
                    <button className="btn-danger py-1 text-xs">Rejeter</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedReviews.length > 0 && (
        <div className="mt-3 space-y-3">
          {approvedReviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.authorName}</span>
                  <Stars rating={r.rating} className="text-sm" />
                  {r.source === "VENDOR" && (
                    <span className="badge bg-gray-100 text-gray-600">ajouté par vous</span>
                  )}
                </div>
                <form action={moderateReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="action" value="DELETE" />
                  <button className="text-xs text-red-600 hover:underline">Supprimer</button>
                </form>
              </div>
              {r.comment && <p className="mt-1 text-sm text-gray-700">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <AddReviewForm productId={product.id} />

      {/* Suppression */}
      <form action={deleteProductAction} className="mt-8">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="btn-danger">
          Supprimer cet article
        </button>
      </form>
    </div>
  );
}
