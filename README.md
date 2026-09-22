# SiteCommande

Plateforme SaaS « boutique en un clic » pour le Sénégal 🇸🇳.
Un vendeur crée son compte, ouvre sa boutique, publie ses articles (le 1ᵉʳ
gratuit, puis **300 F CFA** par article), et reçoit un **lien de commande** à
partager. Quand un client commande, le vendeur est **notifié par email** et
contacte la personne. Une **console admin** permet de suivre les boutiques,
les comptes et les paiements.

Voir [`SPEC.md`](./SPEC.md) pour la spécification détaillée.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + SQLite (dev) / PostgreSQL (prod)
- **Tailwind CSS**
- Authentification maison (bcrypt + session JWT en cookie)
- Emails via **SMTP** (Nodemailer) — s'affichent dans la console si non configuré
- Paiement mobile money via **PayDunya** (Wave / Orange Money / Free Money),
  avec un mode **mock** pour tester sans argent réel
- **Upload de photos** (jusqu'à 3 par article, redimensionnées côté client et
  limitées en taille), stockées dans `public/uploads/`
- **Personnalisation de la boutique** : logo, bannière et couleur principale

## Démarrage rapide (développement)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# (éditez .env : SESSION_SECRET, etc. Le mode mock est activé par défaut.)

# 3. Créer la base de données et le compte admin
npm run db:push
npm run db:seed

# 4. Lancer le serveur
npm run dev
```

Le site est disponible sur http://localhost:3000

- Espace vendeur : créez un compte via « Créer ma boutique ».
- Console admin : connectez-vous avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` (voir `.env`).

### Tester le paiement en mode mock

Avec `PAYMENT_PROVIDER=mock`, publier un 2ᵉ article ouvre une page de
simulation où vous pouvez « Simuler un paiement réussi ». L'article passe alors
en **Publié** sans transaction réelle.

## Passer en production

1. **Base de données** : dans `prisma/schema.prisma`, mettez
   `provider = "postgresql"` et renseignez `DATABASE_URL`. Puis `npm run db:push`.
2. **Paiement réel** : créez un compte marchand [PayDunya](https://paydunya.com),
   mettez `PAYMENT_PROVIDER=paydunya`, `PAYDUNYA_MODE=live` et remplissez les clés
   API dans `.env`.
3. **Emails** : renseignez les variables `SMTP_*` (ex. Brevo).
4. **APP_URL** : mettez l'URL publique réelle (pour les liens et le webhook).
5. **Build** : `npm run build && npm run start`.

### Avec Docker

```bash
cp .env.example .env   # puis éditez
docker compose up -d --build
```

## Structure

```
prisma/schema.prisma      # modèle de données
src/lib/                  # config, prisma, auth, mailer, paiement
src/actions/              # server actions (auth, boutique, articles, commandes…)
src/app/                  # pages (public, dashboard vendeur, admin, api)
src/components/           # composants UI partagés
```
