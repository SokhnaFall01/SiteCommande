import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { ShopForm } from "./ShopForm";

export default async function BoutiquePage() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Ma boutique</h1>
      <p className="mt-1 text-sm text-gray-600">
        Ces informations apparaissent sur vos pages de commande.
      </p>

      {shop && (
        <p className="mt-3 text-sm text-gray-600">
          Adresse publique :{" "}
          <span className="font-mono text-brand-700">
            {config.appUrl}/b/{shop.slug}
          </span>
        </p>
      )}

      <ShopForm shop={shop} />
    </div>
  );
}
