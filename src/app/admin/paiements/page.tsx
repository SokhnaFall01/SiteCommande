import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatDate } from "@/lib/format";
import { PaymentStatusBadge } from "@/components/badges";

export default async function AdminPaiements() {
  await requireAdmin();
  const [payments, paidAgg] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, product: true },
      take: 200,
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Paiements ({payments.length})</h1>
      <p className="mt-1 text-sm text-gray-600">
        Revenus confirmés : <strong>{formatFCFA(paidAgg._sum.amount || 0)}</strong>
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Vendeur</th>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Fournisseur</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">{p.user.email}</td>
                <td className="px-4 py-3">{p.product.title}</td>
                <td className="px-4 py-3">{formatFCFA(p.amount)}</td>
                <td className="px-4 py-3">{p.provider}</td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
