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

> 📘 **Guide de déploiement pas à pas** (serveur avec reverse proxy + sous-domaine) :
> voir [`docs/DEPLOIEMENT.md`](./docs/DEPLOIEMENT.md).

1. **Base de données** : SQLite par défaut (fichier sur un volume) — simple et
   suffisant pour démarrer, un seul conteneur. Pour passer à PostgreSQL plus tard,
   mettez `provider = "postgresql"` dans `prisma/schema.prisma` et renseignez
   `DATABASE_URL`, puis `npm run db:push`.
2. **Paiement réel** : créez un compte marchand [PayDunya](https://paydunya.com),
   mettez `PAYMENT_PROVIDER=paydunya`, `PAYDUNYA_MODE=live` et remplissez les clés
   API dans `.env`.
3. **Emails (Gmail)** : les notifications de commande partent par Gmail.
   - Activez la **validation en 2 étapes** sur le compte Google.
   - Créez un **mot de passe d'application** : https://myaccount.google.com/apppasswords
   - Dans `.env` : `SMTP_USER` = votre adresse Gmail, `SMTP_PASSWORD` = le mot
     de passe d'application (16 caractères). `SMTP_HOST` et `SMTP_PORT` sont déjà
     réglés sur `smtp.gmail.com` / `587`.
   - Tant que ces variables sont vides, les emails s'affichent dans la console
     (pratique en développement).
4. **APP_URL** : mettez l'URL publique réelle (pour les liens et le webhook).
5. **Build** : `npm run build && npm run start`.

### Avec Docker (recommandé)

Un seul conteneur (SQLite + volumes pour la base et les photos), exposé en local
sur `127.0.0.1:${APP_PORT:-3001}` pour être placé derrière votre reverse proxy.

```bash
cp .env.example .env   # puis éditez (APP_URL, APP_PORT, secrets…)
docker compose up -d --build
```

La base et le compte admin sont créés automatiquement au démarrage.
Détails (DNS, Nginx/Caddy/Traefik, HTTPS, sauvegardes) : [`docs/DEPLOIEMENT.md`](./docs/DEPLOIEMENT.md).

## Structure

```
prisma/schema.prisma      # modèle de données
src/lib/                  # config, prisma, auth, mailer, paiement
src/actions/              # server actions (auth, boutique, articles, commandes…)
src/app/                  # pages (public, dashboard vendeur, admin, api)
src/components/           # composants UI partagés
```
