import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { formatFCFA } from "@/lib/format";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-brand-700">
            SiteCommande
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="btn-primary"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-outline">
                  Connexion
                </Link>
                <Link href="/signup" className="btn-primary">
                  Créer ma boutique
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <span className="badge bg-brand-100 text-brand-800">
            Simple · Rapide · Sénégal 🇸🇳
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ouvrez votre boutique
            <br />
            et vendez avec un simple lien
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            Créez votre compte, publiez vos articles et partagez le lien de
            commande sur WhatsApp ou Instagram. Vous recevez les commandes par
            email et contactez directement vos clients.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Créer ma boutique gratuitement
            </Link>
            <Link href="/login" className="btn-outline px-6 py-3 text-base">
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            1<sup>er</sup> article gratuit, puis{" "}
            {formatFCFA(config.prixPublication)} par article.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Créez votre boutique",
                d: "Inscrivez-vous en quelques secondes et donnez un nom à votre boutique.",
              },
              {
                n: "2",
                t: "Publiez vos articles",
                d: "Le premier est gratuit. Chaque article génère un lien à partager.",
              },
              {
                n: "3",
                t: "Recevez vos commandes",
                d: "Le client laisse ses infos, vous êtes notifié et vous le contactez.",
              },
            ].map((s) => (
              <div key={s.n} className="card">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SiteCommande
        </div>
      </footer>
    </div>
  );
}
