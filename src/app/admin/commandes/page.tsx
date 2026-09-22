import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/badges";

export default async function AdminCommandes() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { include: { shop: true } } },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Commandes ({orders.length})</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Boutique</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Qté</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 font-medium">{o.product.title}</td>
                <td className="px-4 py-3">{o.product.shop.name}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3">{o.customerPhone}</td>
                <td className="px-4 py-3">{o.quantity}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
