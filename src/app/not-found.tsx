import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-2 text-xl font-bold">Page introuvable</h1>
      <p className="mt-1 text-sm text-gray-600">
        Ce lien n&apos;existe pas ou n&apos;est plus disponible.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
