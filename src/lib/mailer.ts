import "server-only";
import nodemailer from "nodemailer";
import { config } from "./config";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  // Tant qu'aucun compte (identifiant + mot de passe) n'est configuré,
  // on reste en mode console (repli de développement).
  if (!config.smtp.host || !config.smtp.user || !config.smtp.password) {
    return null;
  }
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // 465 = SSL, 587 = STARTTLS (Gmail)
    auth: { user: config.smtp.user, pass: config.smtp.password },
  });
  return transporter;
}

// Envoie un email. Si aucun SMTP n'est configuré (dev), on affiche dans la console.
export async function sendMail({ to, subject, html, text }: MailInput): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log("\n===== EMAIL (SMTP non configuré) =====");
    console.log("À      :", to);
    console.log("Sujet  :", subject);
    console.log("Contenu:", text || html.replace(/<[^>]+>/g, " ").trim());
    console.log("======================================\n");
    return;
  }
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, html, text });
  } catch (err) {
    console.error("Échec d'envoi d'email:", err);
  }
}

export function newOrderEmail(params: {
  shopName: string;
  productTitle: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  quantity: number;
  note?: string | null;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const {
    shopName,
    productTitle,
    customerName,
    customerPhone,
    customerAddress,
    quantity,
    note,
    dashboardUrl,
  } = params;

  const subject = `Nouvelle commande — ${productTitle}`;
  const text = [
    `Nouvelle commande sur votre boutique ${shopName}.`,
    ``,
    `Article : ${productTitle}`,
    `Quantité : ${quantity}`,
    `Client : ${customerName}`,
    `Téléphone : ${customerPhone}`,
    customerAddress ? `Adresse : ${customerAddress}` : ``,
    note ? `Note : ${note}` : ``,
    ``,
    `Voir dans votre tableau de bord : ${dashboardUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#0c9051">Nouvelle commande 🎉</h2>
    <p>Vous avez reçu une commande sur votre boutique <strong>${shopName}</strong>.</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#666">Article</td><td style="padding:6px 0"><strong>${productTitle}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#666">Quantité</td><td style="padding:6px 0">${quantity}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Client</td><td style="padding:6px 0">${customerName}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Téléphone</td><td style="padding:6px 0">${customerPhone}</td></tr>
      ${customerAddress ? `<tr><td style="padding:6px 0;color:#666">Adresse</td><td style="padding:6px 0">${customerAddress}</td></tr>` : ""}
      ${note ? `<tr><td style="padding:6px 0;color:#666">Note</td><td style="padding:6px 0">${note}</td></tr>` : ""}
    </table>
    <p style="margin-top:20px">
      <a href="${dashboardUrl}" style="background:#0c9051;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Voir la commande</a>
    </p>
  </div>`;

  return { subject, html, text };
}

export function publicationPaidEmail(params: {
  productTitle: string;
  amount: number;
  publicUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Article publié — ${params.productTitle}`;
  const text = `Votre paiement a été confirmé. L'article "${params.productTitle}" est maintenant publié.\nLien à partager : ${params.publicUrl}`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
    <h2 style="color:#0c9051">Article publié ✅</h2>
    <p>Votre paiement a été confirmé. L'article <strong>${params.productTitle}</strong> est maintenant en ligne.</p>
    <p>Voici le lien à partager avec vos clients :</p>
    <p><a href="${params.publicUrl}">${params.publicUrl}</a></p>
  </div>`;
  return { subject, html, text };
}
