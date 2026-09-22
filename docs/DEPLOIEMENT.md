# Déploiement de SamaBoutik sur ton serveur

Ce guide part de ta configuration : un serveur Linux avec **déjà 2 conteneurs
Docker** et un **reverse proxy en fichier** (Nginx / Traefik / Caddy), et tu veux
publier SamaBoutik sur un **sous-domaine** (ex : `app.mondomaine.com`).

SamaBoutik tourne dans **un seul conteneur** (base **SQLite** sur un volume) et
n'est exposé **qu'en local** (`127.0.0.1:3001`) : c'est ton reverse proxy qui
gère le domaine et le HTTPS. Aucun conflit avec tes conteneurs existants.

---

## 1. Pointer le sous-domaine vers le serveur (DNS)

Chez ton registrar / hébergeur DNS, ajoute un enregistrement :

```
Type : A
Nom  : app            (donne app.mondomaine.com)
Valeur : <IP publique de ton serveur>
TTL  : automatique / 300
```

Vérifie la propagation (ça peut prendre quelques minutes) :

```bash
dig +short app.mondomaine.com
# doit renvoyer l'IP de ton serveur
```

---

## 2. Récupérer le code sur le serveur

```bash
cd /opt   # ou l'endroit où tu gardes tes projets
git clone https://github.com/SokhnaFall01/SiteCommande.git samaboutik
cd samaboutik
git checkout claude/cool-knuth-2jtmu2
```

---

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

À renseigner :

```bash
APP_URL="https://app.mondomaine.com"      # ton vrai sous-domaine (https)
APP_PORT="3001"                            # change si 3001 est déjà pris
SESSION_SECRET="<longue chaîne aléatoire>" # ex: openssl rand -hex 32

# Compte admin (change le mot de passe !)
ADMIN_EMAIL="admin@samaboutik.sn"
ADMIN_PASSWORD="<mot de passe fort>"

# Emails Gmail (voir README)
SMTP_USER="tonadresse@gmail.com"
SMTP_PASSWORD="<mot de passe d'application Google>"

# Paiement PayDunya (quand ton compte marchand est prêt)
PAYMENT_PROVIDER="paydunya"     # ou "mock" pour tester sans argent
PAYDUNYA_MODE="live"
PAYDUNYA_MASTER_KEY="..."
PAYDUNYA_PRIVATE_KEY="..."
PAYDUNYA_PUBLIC_KEY="..."
PAYDUNYA_TOKEN="..."
```

Astuce pour générer le secret : `openssl rand -hex 32`

> `APP_PORT` doit être un port **libre** sur ton serveur. Pour vérifier :
> `sudo ss -ltnp | grep 3001` (s'il ne renvoie rien, le port est libre).

---

## 4. Construire et lancer le conteneur

```bash
docker compose up -d --build
```

Au premier démarrage, le conteneur crée automatiquement la base (tables) et le
compte admin, puis lance l'application. Vérifie :

```bash
docker compose ps           # le service "app" doit être "running"
docker compose logs -f app  # doit afficher "Ready" ; Ctrl+C pour quitter
curl -I http://127.0.0.1:3001   # doit répondre 200/307
```

À ce stade l'app tourne en local sur le port 3001, pas encore accessible depuis
Internet : c'est le rôle du reverse proxy (étape suivante).

---

## 5. Router le sous-domaine (reverse proxy)

Choisis la section qui correspond à ton proxy.

### 5.a — Nginx (fichier)

Crée `/etc/nginx/sites-available/samaboutik.conf` :

```nginx
server {
    listen 80;
    server_name app.mondomaine.com;

    # Autorise l'upload des photos (jusqu'à ~3 Mo par image)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
    }
}
```

Active le site et recharge Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/samaboutik.conf /etc/nginx/sites-enabled/
sudo nginx -t          # vérifie la syntaxe
sudo systemctl reload nginx
```

**HTTPS gratuit avec Let's Encrypt (certbot)** :

```bash
sudo certbot --nginx -d app.mondomaine.com
```

Certbot ajoute tout seul le bloc `listen 443 ssl` et la redirection HTTP→HTTPS,
et renouvelle le certificat automatiquement.

### 5.b — Caddy (fichier)

Ajoute dans ton `Caddyfile` :

```caddy
app.mondomaine.com {
    reverse_proxy 127.0.0.1:3001
    request_body {
        max_size 10MB
    }
}
```

Puis : `sudo systemctl reload caddy`
(Caddy gère le HTTPS automatiquement, rien d'autre à faire.)

### 5.c — Traefik (fichier / labels)

Si ton Traefik lit les labels Docker, ajoute au service `app` dans
`docker-compose.yml` (et connecte l'app au réseau de Traefik) :

```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.samaboutik.rule=Host(`app.mondomaine.com`)"
      - "traefik.http.routers.samaboutik.entrypoints=websecure"
      - "traefik.http.routers.samaboutik.tls.certresolver=letsencrypt"
      - "traefik.http.services.samaboutik.loadbalancer.server.port=3000"
```

> Avec Traefik par labels, l'app doit être sur le **même réseau Docker** que
> Traefik, et tu peux alors retirer la section `ports` (Traefik joint le
> conteneur par le réseau, port interne 3000). Dis-le moi si tu es dans ce cas,
> je t'adapte le fichier.

---

## 6. Vérifier

Ouvre `https://app.mondomaine.com` :
- la page d'accueil SamaBoutik s'affiche ;
- connecte-toi à `/login` avec l'admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) ;
- crée un compte vendeur, une boutique, un article, teste une commande.

Pense à mettre le **webhook PayDunya** sur `https://app.mondomaine.com/api/paiement/webhook`
si l'interface PayDunya te le demande (sinon `APP_URL` suffit, l'app le construit).

---

## 7. Mettre à jour le site plus tard

```bash
cd /opt/samaboutik
git pull
docker compose up -d --build
```

Les tables sont mises à jour automatiquement au démarrage (`prisma db push`).
La base et les photos sont sur des volumes : elles sont **conservées**.

---

## 8. Sauvegardes

- **Base de données** (volume `db_data`) :
  ```bash
  docker compose cp app:/app/data/prod.db ./backup-$(date +%F).db
  ```
- **Photos** (volume `uploads_data`) : sauvegarde le volume Docker
  `samaboutik_uploads_data` (ex. avec `docker run --rm -v samaboutik_uploads_data:/d -v $PWD:/b alpine tar czf /b/uploads-$(date +%F).tar.gz -C /d .`).

---

## Dépannage rapide

- **502 Bad Gateway** : l'app n'est pas up ou `APP_PORT` ≠ port du `proxy_pass`.
  `docker compose logs -f app` et vérifie le port.
- **Port déjà utilisé** au `docker compose up` : change `APP_PORT` dans `.env`
  et adapte le `proxy_pass` du proxy en conséquence.
- **Les emails ne partent pas** : vérifie `SMTP_USER` / `SMTP_PASSWORD`
  (mot de passe d'application Google, pas le mot de passe habituel).
- **Le paiement ne se confirme pas** : `APP_URL` doit être l'URL publique en
  `https` pour que PayDunya puisse appeler le webhook.
