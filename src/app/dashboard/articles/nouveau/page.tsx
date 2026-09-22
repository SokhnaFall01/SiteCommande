import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export default async function NouvelArticlePage() {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });

  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Nouvel article</h1>
        <div className="card mt-6">
          <p className="text-sm text-gray-600">
            Créez d&apos;abord votre boutique.
          </p>
          <Link href="/dashboard/boutique" className="btn-primary mt-4">
            Créer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/articles" className="text-sm text-brand-700">
        ← Retour aux articles
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Nouvel article</h1>
      <p className="mt-1 text-sm text-gray-600">
        Enregistrez votre article, puis publiez-le pour obtenir son lien de
        commande.
      </p>
      <ProductForm />
    </div>
  );
}
