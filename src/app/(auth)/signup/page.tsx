"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signupAction } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { BrandLogo } from "@/components/BrandLogo";

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, undefined);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <Link href="/">
          <BrandLogo className="text-xl" />
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Créer ma boutique</h1>
        <p className="mt-1 text-sm text-gray-600">
          Inscription gratuite — 1<sup>er</sup> article offert.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <div>
            <label className="label" htmlFor="name">
              Nom complet
            </label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Téléphone <span className="text-gray-400">(facultatif)</span>
            </label>
            <input id="phone" name="phone" className="input" placeholder="77 000 00 00" />
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
              minLength={6}
              className="input"
            />
          </div>
          <SubmitButton className="btn-primary w-full">
            Créer mon compte
          </SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-brand-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
