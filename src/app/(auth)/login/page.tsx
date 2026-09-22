"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Wordmark } from "@/components/Wordmark";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <Link href="/">
          <Wordmark className="text-xl" />
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Connexion</h1>
        <p className="mt-1 text-sm text-gray-600">
          Accédez à votre tableau de bord.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
            />
          </div>
          <SubmitButton className="btn-primary w-full">Se connecter</SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-brand-700">
            Créer ma boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
