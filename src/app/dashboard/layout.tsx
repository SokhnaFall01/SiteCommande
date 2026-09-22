import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { NavLink } from "@/components/NavLink";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <aside className="border-b border-gray-200 bg-white p-4 md:w-64 md:border-b-0 md:border-r">
        <Link href="/" className="text-lg font-bold text-brand-700">
          SiteCommande
        </Link>
        <p className="mt-1 truncate text-xs text-gray-500">{user.email}</p>

        <nav className="mt-6 space-y-1">
          <NavLink href="/dashboard" exact>
            Vue d&apos;ensemble
          </NavLink>
          <NavLink href="/dashboard/boutique">Ma boutique</NavLink>
          <NavLink href="/dashboard/articles">Mes articles</NavLink>
          <NavLink href="/dashboard/commandes">Mes commandes</NavLink>
          <NavLink href="/dashboard/paiements">Paiements</NavLink>
          {user.role === "ADMIN" && (
            <NavLink href="/admin">Console admin</NavLink>
          )}
        </nav>

        <form action={logoutAction} className="mt-6">
          <button type="submit" className="btn-outline w-full">
            Se déconnecter
          </button>
        </form>
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
