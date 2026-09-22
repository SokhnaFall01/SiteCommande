import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatDate } from "@/lib/format";
import { PaymentStatusBadge } from "@/components/badges";

export default async function PaiementsPage() {
  const user = await requireUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Paiements</h1>
      <p className="mt-1 text-sm text-gray-600">
        Total payé : <strong>{formatFCFA(totalPaid)}</strong>
      </p>

      {payments.length === 0 ? (
        <div className="card mt-6">
          <p className="text-sm text-gray-600">
            Aucun paiement. Votre 1<sup>er</sup> article est gratuit.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">{p.product.title}</td>
                  <td className="px-4 py-3">{formatFCFA(p.amount)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
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
