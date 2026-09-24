# Déploiement de SamaBoutik (serveur dédié)

SamaBoutik se déploie de façon **autonome** : un conteneur pour l'application
(base **SQLite** sur volume) + son **propre Caddy** qui gère le domaine et le
**HTTPS automatique**. Aucune dépendance à un autre projet.

---

## A. Déployer sur un serveur neuf

### 1. Prérequis sur le serveur
- Docker + Docker Compose installés.
- Les ports **80** et **443** libres (aucun autre reverse proxy).

Installer Docker (Ubuntu) si besoin :
```bash
curl -fsSL https://get.docker.com | sh
```

### 2. DNS
Crée un enregistrement **A** : `ton-domaine.com → IP_DU_NOUVEAU_SERVEUR`.
Vérifie : `dig +short ton-domaine.com` doit renvoyer l'IP du serveur.

### 3. Récupérer le code
```bash
cd /opt
git clone https://github.com/SokhnaFall01/SiteCommande.git samaboutik
cd samaboutik
git checkout claude/cool-knuth-2jtmu2
```

### 4. Configurer `.env`
```bash
cp .env.example .env
nano .env
```
À renseigner :
```bash
DOMAIN="ton-domaine.com"
APP_URL="https://ton-domaine.com"
SESSION_SECRET="<openssl rand -hex 32>"
ADMIN_EMAIL="admin@tondomaine.com"
ADMIN_PASSWORD="<mot de passe fort>"

# Gmail
SMTP_USER="tonadresse@gmail.com"
SMTP_PASSWORD="<mot de passe d'application Google>"

# PayDunya (live)
PAYMENT_PROVIDER="paydunya"
PAYDUNYA_MODE="live"
PAYDUNYA_MASTER_KEY="..."
PAYDUNYA_PRIVATE_KEY="..."
PAYDUNYA_PUBLIC_KEY="..."
PAYDUNYA_TOKEN="..."
```

### 5. Lancer
```bash
docker compose up -d --build
```
Caddy obtient le certificat HTTPS tout seul (quelques secondes). Vérifie :
```bash
docker compose ps
curl -I https://ton-domaine.com
```

### 6. Webhook PayDunya
Dans ton compte PayDunya, mets l'URL IPN :
`https://ton-domaine.com/api/paiement/webhook`

---

## B. (Optionnel) Migrer les données depuis l'ancien serveur

Si tu as déjà des boutiques/articles/commandes à conserver, copie la base et
les photos **avant** de supprimer l'ancien.

Sur l'**ancien** serveur :
```bash
cd /opt/samaboutik
docker compose cp app:/app/data/prod.db ./prod.db
docker run --rm -v samaboutik_uploads_data:/d -v $PWD:/b alpine \
  tar czf /b/uploads.tar.gz -C /d .
# récupère prod.db et uploads.tar.gz (scp vers le nouveau serveur)
scp prod.db uploads.tar.gz root@NOUVEAU_SERVEUR:/opt/samaboutik/
```

Sur le **nouveau** serveur (après `docker compose up -d` au moins une fois) :
```bash
cd /opt/samaboutik
docker compose cp ./prod.db app:/app/data/prod.db
docker run --rm -v samaboutik_uploads_data:/d -v $PWD:/b alpine \
  sh -c "tar xzf /b/uploads.tar.gz -C /d"
docker compose restart app
```

---

## C. Retirer SamaBoutik de l'ANCIEN serveur (sans casser radia-glam)

Sur l'**ancien** serveur :

1. **Arrêter et supprimer** le conteneur + ses volumes SamaBoutik :
   ```bash
   cd /opt/samaboutik
   docker compose down -v      # -v supprime AUSSI la base et les photos locales
   ```
   > ⚠️ Ne fais `-v` qu'après avoir migré les données (section B) si tu veux les garder.

2. **Retirer le bloc SamaBoutik du Caddyfile de radia-glam** :
   ```bash
   nano /root/radia-glam/Caddyfile
   ```
   Supprime le bloc :
   ```
   samaboutik.hubconnect.click {
       ...
   }
   ```
   Puis recharge Caddy :
   ```bash
   docker exec radia-glam-caddy-1 caddy reload --config /etc/caddy/Caddyfile
   ```

3. **Supprimer le dossier** (et l'image Docker devenue inutile) :
   ```bash
   cd /opt && rm -rf samaboutik
   docker image rm samaboutik-app 2>/dev/null || true
   docker network rm samaboutik_default 2>/dev/null || true
   ```

radia-glam et mnscapital ne sont pas touchés (on n'a modifié que le bloc
SamaBoutik du Caddyfile).

---

## Mettre à jour / sauvegarder (serveur dédié)

- **Mise à jour** :
  ```bash
  cd /opt/samaboutik && git pull && docker compose up -d --build
  ```
- **Sauvegarde base** :
  ```bash
  docker compose cp app:/app/data/prod.db ./backup-$(date +%F).db
  ```

## Dépannage

- **Certificat HTTPS qui n'arrive pas** : le DNS doit pointer vers le serveur
  AVANT le démarrage de Caddy, et les ports 80/443 doivent être libres.
- **502 Bad Gateway** : `docker compose logs -f app` pour voir l'erreur de l'app.
- **Paiement bloqué en attente** : sur la page de l'article, clique
  « J'ai payé — vérifier maintenant », et configure l'IPN PayDunya (section A.6).
