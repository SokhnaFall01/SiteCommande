import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteCommande — Ouvrez votre boutique en ligne",
  description:
    "Créez votre compte, ouvrez votre boutique, publiez vos articles et recevez vos commandes par un simple lien à partager.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
