import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { formatFCFA, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/badges";

export default async function DashboardHome() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });

  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Bienvenue, {user.name} 👋</h1>
        <div className="card mt-6">
          <h2 className="font-semibold">Ouvrez votre boutique</h2>
          <p className="mt-1 text-sm text-gray-600">
            Pour commencer à vendre, créez votre boutique. C&apos;est rapide et
            gratuit.
          </p>
          <Link href="/dashboard/boutique" className="btn-primary mt-4">
            Créer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  const [productCount, publishedCount, freeUsed, orderCount, newOrders, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { shopId: shop.id } }),
      prisma.product.count({ where: { shopId: shop.id, status: "PUBLISHED" } }),
      prisma.product.count({ where: { shopId: shop.id, isFreeSlot: true } }),
      prisma.order.count({ where: { product: { shopId: shop.id } } }),
      prisma.order.count({
        where: { product: { shopId: shop.id }, status: "NEW" },
      }),
      prisma.order.findMany({
        where: { product: { shopId: shop.id } },
        include: { product: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Articles publiés", value: publishedCount },
    { label: "Articles au total", value: productCount },
    { label: "Commandes reçues", value: orderCount },
    { label: "Nouvelles commandes", value: newOrders },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
        <Link href="/dashboard/articles/nouveau" className="btn-primary">
          + Nouvel article
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        {freeUsed === 0 ? (
          <>
            🎁 Votre <strong>1<sup>er</sup> article est gratuit</strong>. Les
            suivants coûtent {formatFCFA(config.prixPublication)} chacun.
          </>
        ) : (
          <>
            Crédit gratuit utilisé. Chaque nouvel article publié coûte{" "}
            {formatFCFA(config.prixPublication)}.
          </>
        )}
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Dernières commandes</h2>
          <Link href="/dashboard/commandes" className="text-sm text-brand-700">
            Tout voir
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-gray-100">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{o.product.title}</p>
                  <p className="text-gray-500">
                    {o.customerName} · {o.customerPhone} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
