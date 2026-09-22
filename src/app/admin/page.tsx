import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFCFA, formatDate } from "@/lib/format";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    userCount,
    shopCount,
    publishedCount,
    orderCount,
    paidAgg,
    recentShops,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.shop.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.order.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true, _count: { select: { products: true } } },
    }),
  ]);

  const revenue = paidAgg._sum.amount || 0;

  const stats = [
    { label: "Comptes vendeurs", value: userCount },
    { label: "Boutiques", value: shopCount },
    { label: "Articles publiés", value: publishedCount },
    { label: "Commandes", value: orderCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <p className="text-sm text-brand-800">Revenus (publications payées)</p>
        <p className="mt-1 text-3xl font-extrabold text-brand-800">
          {formatFCFA(revenue)}
        </p>
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Dernières boutiques</h2>
        {recentShops.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Aucune boutique.</p>
        ) : (
          <div className="mt-3 divide-y divide-gray-100">
            {recentShops.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-gray-500">
                    {s.user.email} · {s._count.products} article(s) ·{" "}
                    {formatDate(s.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
