import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { toggleShopActiveAction } from "@/actions/admin";

export default async function AdminBoutiques() {
  await requireAdmin();
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Boutiques ({shops.length})</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Boutique</th>
              <th className="px-4 py-3 font-medium">Propriétaire</th>
              <th className="px-4 py-3 font-medium">Articles</th>
              <th className="px-4 py-3 font-medium">Créée le</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/b/${s.slug}`}
                    target="_blank"
                    className="font-medium text-brand-700"
                  >
                    {s.name}
                  </Link>
                  <p className="text-xs text-gray-400">/{s.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {s.user.name}
                  <p className="text-xs text-gray-400">{s.user.email}</p>
                </td>
                <td className="px-4 py-3">{s._count.products}</td>
                <td className="px-4 py-3">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  {s.isActive ? (
                    <span className="badge bg-brand-100 text-brand-800">Active</span>
                  ) : (
                    <span className="badge bg-red-100 text-red-700">Désactivée</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleShopActiveAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className={s.isActive ? "btn-danger" : "btn-outline"}
                    >
                      {s.isActive ? "Désactiver" : "Réactiver"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
