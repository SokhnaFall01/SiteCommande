import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { ProductStatusBadge } from "@/components/badges";

export default async function ArticlesPage() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });

  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Mes articles</h1>
        <div className="card mt-6">
          <p className="text-sm text-gray-600">
            Vous devez d&apos;abord créer votre boutique.
          </p>
          <Link href="/dashboard/boutique" className="btn-primary mt-4">
            Créer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes articles</h1>
        <Link href="/dashboard/articles/nouveau" className="btn-primary">
          + Nouvel article
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card mt-6">
          <p className="text-sm text-gray-600">
            Aucun article. Créez votre premier article (gratuit) !
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Commandes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{formatFCFA(p.price)}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">{p._count.orders}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/articles/${p.id}`}
                      className="font-medium text-brand-700"
                    >
                      Gérer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
