import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AdminComptes() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { shop: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Comptes ({users.length})</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Boutique</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone || "—"}</td>
                <td className="px-4 py-3">{u.shop?.name || "—"}</td>
                <td className="px-4 py-3">
                  {u.role === "ADMIN" ? (
                    <span className="badge bg-gray-900 text-white">Admin</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-700">Vendeur</span>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
