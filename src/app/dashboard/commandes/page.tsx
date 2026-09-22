import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { updateOrderStatusAction } from "@/actions/orders";
import { OrderStatusBadge } from "@/components/badges";

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nouvelle" },
  { value: "CONTACTED", label: "Contactée" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "CANCELLED", label: "Annulée" },
];

export default async function CommandesPage() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });

  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <div className="card mt-6">
          <p className="text-sm text-gray-600">Créez d&apos;abord votre boutique.</p>
          <Link href="/dashboard/boutique" className="btn-primary mt-4">
            Créer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { product: { shopId: shop.id } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Mes commandes</h1>
      <p className="mt-1 text-sm text-gray-600">
        {orders.length} commande{orders.length > 1 ? "s" : ""} au total.
      </p>

      {orders.length === 0 ? (
        <div className="card mt-6">
          <p className="text-sm text-gray-600">
            Aucune commande pour l&apos;instant. Partagez vos liens d&apos;articles !
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{o.product.title}</h3>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(o.createdAt)} · Quantité : {o.quantity}
                  </p>
                </div>
                <a
                  href={`tel:${o.customerPhone}`}
                  className="btn-outline whitespace-nowrap"
                >
                  Appeler
                </a>
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Client</dt>
                  <dd className="font-medium">{o.customerName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Téléphone</dt>
                  <dd className="font-medium">{o.customerPhone}</dd>
                </div>
                {o.customerAddress && (
                  <div>
                    <dt className="text-gray-500">Adresse</dt>
                    <dd className="font-medium">{o.customerAddress}</dd>
                  </div>
                )}
                {o.note && (
                  <div>
                    <dt className="text-gray-500">Note</dt>
                    <dd className="font-medium">{o.note}</dd>
                  </div>
                )}
              </dl>

              <form
                action={updateOrderStatusAction}
                className="mt-4 flex items-center gap-2"
              >
                <input type="hidden" name="id" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="input max-w-[200px]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-outline">
                  Mettre à jour
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
