// Configuration centralisée, lue depuis les variables d'environnement.

export const config = {
  appUrl: process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000",
  sessionSecret:
    process.env.SESSION_SECRET || "dev-secret-change-me-please-32-chars-min!!",
  devise: process.env.DEVISE || "XOF",
  prixPublication: parseInt(process.env.PRIX_PUBLICATION || "300", 10),
  paymentProvider: (process.env.PAYMENT_PROVIDER || "mock").toLowerCase(),
  uploads: {
    maxPhotos: 3, // nombre maximum de photos par article
    maxFileMb: parseInt(process.env.MAX_UPLOAD_MB || "3", 10), // taille max par fichier
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@sitecommande.sn",
    password: process.env.ADMIN_PASSWORD || "changeMoi123",
  },
  paydunya: {
    mode: process.env.PAYDUNYA_MODE || "test",
    masterKey: process.env.PAYDUNYA_MASTER_KEY || "",
    privateKey: process.env.PAYDUNYA_PRIVATE_KEY || "",
    publicKey: process.env.PAYDUNYA_PUBLIC_KEY || "",
    token: process.env.PAYDUNYA_TOKEN || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "SiteCommande <no-reply@sitecommande.sn>",
  },
};
