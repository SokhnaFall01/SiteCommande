import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { NavLink } from "@/components/NavLink";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
      <aside className="border-b border-gray-200 bg-gray-900 p-4 text-gray-100 md:w-64 md:border-b-0">
        <Link href="/admin" className="text-lg font-bold text-white">
          SiteCommande <span className="text-brand-400">admin</span>
        </Link>
        <p className="mt-1 truncate text-xs text-gray-400">{user.email}</p>

        <nav className="mt-6 space-y-1">
          <AdminNavLink href="/admin" exact>
            Tableau de bord
          </AdminNavLink>
          <AdminNavLink href="/admin/boutiques">Boutiques</AdminNavLink>
          <AdminNavLink href="/admin/comptes">Comptes</AdminNavLink>
          <AdminNavLink href="/admin/articles">Articles</AdminNavLink>
          <AdminNavLink href="/admin/commandes">Commandes</AdminNavLink>
          <AdminNavLink href="/admin/paiements">Paiements</AdminNavLink>
          <AdminNavLink href="/dashboard">← Espace vendeur</AdminNavLink>
        </nav>

        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="btn w-full border border-gray-700 text-gray-200 hover:bg-gray-800"
          >
            Se déconnecter
          </button>
        </form>
      </aside>

      <main className="flex-1 bg-gray-50 p-4 md:p-8">{children}</main>
    </div>
  );
}

function AdminNavLink({
  href,
  children,
  exact,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  return (
    <div className="[&_a]:text-gray-300 [&_a:hover]:bg-gray-800 [&_a:hover]:text-white">
      <NavLink href={href} exact={exact}>
        {children}
      </NavLink>
    </div>
  );
}
