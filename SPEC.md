# SiteCommande — Plan / Spécification du projet

> Plateforme SaaS « boutique en un clic » : un vendeur crée un compte, ouvre sa
> boutique, publie ses articles (le 1er gratuit, les suivants à **300 F CFA**),
> reçoit un **lien de commande partageable**, et est **notifié par email** quand
> un client passe commande. Le client **ne paie pas en ligne** : il laisse ses
> infos, le vendeur le contacte.

Statut : **plan validé, en attente de développement**
Dernière mise à jour : 2026-09-22

---

## 1. Décisions validées

| Sujet | Choix retenu |
|---|---|
| Paiement des 300 F par le vendeur | **Mobile money direct** (Wave / Orange Money / Free Money) via un agrégateur |
| Notification d'une nouvelle commande | **Email** (+ visible dans le dashboard) |
| Paiement du client final | **Hors-ligne** — le client laisse ses infos, le vendeur le contacte |
| Modèle économique | Freemium à l'article : **1 article gratuit**, puis **300 F / article** |

---

## 2. Principe de fonctionnement (parcours)

### Côté vendeur
1. Le vendeur **crée un compte** (email + mot de passe).
2. Il **ouvre sa boutique** (nom, description, logo, téléphone/WhatsApp de contact).
3. Il **crée un article** (titre, description, photos, prix affiché au client).
4. **Publication :**
   - **1er article → gratuit**, publié immédiatement.
   - **Articles suivants → 300 F**. Il paie par mobile money ; une fois le
     paiement confirmé, l'article passe en **Publié**.
5. Chaque article publié a un **lien public unique** à partager
   (WhatsApp, Instagram, etc.) : `sitecommande.xx/b/{boutique}/{article}`.
6. Quand un client commande, le vendeur reçoit un **email** et voit la commande
   dans son **tableau de bord**.
7. Il **contacte le client** (téléphone/WhatsApp) et met la commande à jour
   (Nouvelle → Contactée → Confirmée / Annulée).

### Côté client (public, pas de compte)
1. Il ouvre le lien partagé → voit l'article (photos, description, prix).
2. Il remplit le **formulaire de commande** : nom, téléphone, adresse,
   quantité, note éventuelle.
3. Il valide → message de confirmation. (Aucun paiement en ligne.)

### Côté admin (toi)
- Console pour **suivre les boutiques, les comptes créés, les articles publiés,
  les commandes, les paiements**, et les **statistiques** de la plateforme.

---

## 3. Rôles & permissions

- **Visiteur** (non connecté) : voit uniquement les pages publiques d'articles
  et passe commande.
- **Vendeur** : gère sa boutique, ses articles, ses commandes.
- **Admin** : accès à tout (lecture + modération), tableau de bord global.

---

## 4. Modèle de données (aperçu)

```
User (vendeur / admin)
  id, email (unique), passwordHash, name, phone,
  role [VENDOR | ADMIN], createdAt

Shop (boutique)          — 1 par vendeur au départ
  id, userId, name, slug (unique), description, logoUrl,
  contactPhone, whatsapp, isActive, createdAt

Product (article)
  id, shopId, title, slug, description, price (prix affiché client),
  images[], status [DRAFT | PENDING_PAYMENT | PUBLISHED],
  isFreeSlot (bool — occupe le crédit gratuit), createdAt

Order (commande)
  id, productId, customerName, customerPhone, customerAddress,
  quantity, note, status [NEW | CONTACTED | CONFIRMED | CANCELLED],
  createdAt

Payment (paiement de publication)
  id, userId, productId, amount (300), currency (XOF),
  provider [PAYDUNYA | CINETPAY | ...], providerRef, checkoutUrl,
  status [PENDING | PAID | FAILED | CANCELLED], createdAt, paidAt
```

**Règle « 1 gratuit » :** à la publication d'un article, on vérifie si le vendeur
a déjà utilisé son crédit gratuit (`isFreeSlot`). Sinon → publication directe et
on marque ce crédit comme utilisé. Sinon → il faut un `Payment` au statut `PAID`
avant de passer l'article en `PUBLISHED`.

---

## 5. Écrans / pages

**Public**
- `/` — page d'accueil (présentation + « Créer ma boutique »)
- `/signup`, `/login` — inscription / connexion vendeur
- `/b/{shop}/{product}` — **page publique de commande** d'un article

**Espace vendeur** (`/dashboard`)
- Vue d'ensemble (nb d'articles, commandes récentes, crédit gratuit restant)
- Ma boutique (créer / modifier)
- Mes articles (liste, créer, publier → paiement)
- Mes commandes (liste + changement de statut)
- Historique des paiements

**Console admin** (`/admin`)
- Tableau de bord (nb boutiques, comptes, articles publiés, commandes, revenus)
- Boutiques (liste, activer/désactiver)
- Comptes (liste des vendeurs)
- Articles (tous, avec statut)
- Commandes (toutes)
- Paiements (tous, avec statut)

---

## 6. Flux de paiement mobile money (vendeur)

1. Le vendeur clique **« Publier »** sur un article payant.
2. Le serveur crée un `Payment` (statut `PENDING`) et appelle l'API de
   l'agrégateur pour obtenir une **URL de paiement** (checkout mobile money).
3. Le vendeur paie (Wave / Orange Money / Free Money).
4. L'agrégateur appelle notre **webhook (IPN)** → on vérifie et on passe le
   `Payment` en `PAID`, puis l'article en `PUBLISHED`.
5. On envoie un **email de confirmation** au vendeur.

**Agrégateur recommandé : PayDunya** (bien implanté au Sénégal, supporte Wave /
Orange Money / Free Money). Alternative : **CinetPay**. Le code isolera le
paiement derrière une interface `PaymentProvider` pour pouvoir changer
d'agrégateur sans tout réécrire.

> ⚠️ À prévoir de ton côté : un **compte marchand** chez l'agrégateur (PayDunya
> ou CinetPay) pour obtenir les clés API. Tant qu'on ne les a pas, on pourra
> tester avec le **mode bac à sable (sandbox)** de l'agrégateur.

---

## 7. Notifications email

- À chaque **nouvelle commande** → email au vendeur (infos client + article).
- À chaque **paiement confirmé** → email de confirmation au vendeur.
- (Plus tard) email de bienvenue à l'inscription.

Fournisseur d'envoi : **Brevo** (ex-Sendinblue) ou SMTP classique — offre
gratuite suffisante au démarrage. Isolé derrière un petit module `mailer`.

---

## 8. Stack technique proposée

- **Framework** : Next.js (App Router) + TypeScript — front + back dans un seul
  projet, facile à déployer sur ton serveur.
- **Base de données** : PostgreSQL (ou SQLite pour démarrer très vite).
- **ORM** : Prisma.
- **Authentification** : email + mot de passe (hash bcrypt), sessions sécurisées.
- **UI** : Tailwind CSS (design simple, mobile-first — la majorité des vendeurs
  et clients seront sur téléphone).
- **Emails** : Brevo / SMTP.
- **Paiement** : PayDunya (interface abstraite `PaymentProvider`).
- **Déploiement** : Docker + `docker-compose` sur ton serveur (app + PostgreSQL),
  ou build Node classique. Variables sensibles dans un `.env` (jamais commité).

---

## 9. Découpage en étapes (roadmap)

**MVP (cœur du produit)**
1. Mise en place du projet (Next.js, Prisma, Tailwind, base de données).
2. Auth vendeur (inscription / connexion).
3. Création & édition de la boutique.
4. CRUD des articles + règle « 1 gratuit ».
5. Page publique de commande + formulaire.
6. Réception des commandes dans le dashboard + email au vendeur.
7. Console admin (suivi boutiques / comptes / articles / commandes).

**V1 (monétisation)**
8. Intégration paiement mobile money (PayDunya, sandbox puis réel).
9. Flux « payer 300 F → publier » complet avec webhook.
10. Statistiques admin (revenus, croissance).

**Plus tard (améliorations)**
- Notifications WhatsApp / SMS.
- Plusieurs boutiques par compte.
- Paiement en ligne par le client (optionnel).
- Thèmes / personnalisation de la boutique.
- Statistiques vendeur (vues, taux de commande).

---

## 10. Points ouverts / à confirmer

- Nom de domaine et hébergement (serveur) : lesquels ?
- Devise et pays : uniquement XOF / Sénégal, ou plus large ?
- Le prix affiché de l'article est-il obligatoire, ou « prix sur demande »
  possible ?
- Un vendeur = une seule boutique au départ (proposé), ou plusieurs ?
- Faut-il une validation manuelle admin avant qu'une boutique soit visible ?
