import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatDate } from "@/lib/format";
import { ProductStatusBadge } from "@/components/badges";

export default async function AdminArticles() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      shop: true,
      _count: { select: { orders: true } },
    },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Articles ({products.length})</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Boutique</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Commandes</th>
              <th className="px-4 py-3 font-medium">Créé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">
                  {p.title}
                  {p.isFreeSlot && (
                    <span className="ml-2 badge bg-brand-50 text-brand-700">
                      gratuit
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{p.shop.name}</td>
                <td className="px-4 py-3">{formatFCFA(p.price)}</td>
                <td className="px-4 py-3">
                  <ProductStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">{p._count.orders}</td>
                <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
