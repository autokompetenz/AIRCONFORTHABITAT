const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: false,
  rateLimit: 2,
  tls: { rejectUnauthorized: false },
  connectionTimeout: 45000,
  greetingTimeout: 20000,
  socketTimeout: 90000,
});

const DOMAIN = (process.env.SMTP_USER || '').split('@')[1] || 'gmail.com';
const FROM   = `"${process.env.FROM_NAME || 'ANIMAL CONCEPT SRL'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

function getPublicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return 'https://animalconceptsrl.com';
}

async function sendMail({ to, subject, html, text }) {
  const messageId = `<${crypto.randomUUID()}@${DOMAIN}>`;
  return transporter.sendMail({
    from: FROM, to, subject, html, text,
    headers: {
      'Message-ID': messageId,
      'X-Mailer': 'ANIMAL CONCEPT SRL Mailer v1',
      'X-Entity-Ref-ID': crypto.randomUUID(),
      'Precedence': 'bulk',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

function formatEuro(amount) {
  if (!amount && amount !== 0) return '—';
  return '€' + new Intl.NumberFormat('en-US').format(Math.round(amount));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatBool(val) {
  if (val === true || val === 'true') return '✅ Oui';
  if (val === false || val === 'false') return '❌ Non';
  return '—';
}

function wrapHtml(content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 16px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="padding:28px 32px 0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td><div style="font-size:18px;font-weight:900;color:#2C1810;letter-spacing:0.04em;">ANIMAL CONCEPT SRL</div><div style="font-size:9px;letter-spacing:0.3em;color:#C9762E;text-transform:uppercase;margin-top:2px;">Oupeye · Belgique</div></td>
<td align="right"><div style="width:40px;height:40px;background:#C9762E;border-radius:6px;display:inline-block;line-height:40px;text-align:center;font-size:18px;">🐶</div></td>
</tr></table>
</td></tr>
<tr><td style="padding:20px 32px 16px;border-top:1px solid rgba(44,24,16,0.06);">${content}</td></tr>
<tr><td style="padding:16px 32px 20px;background:#f8f5f0;font-size:12px;color:#6B5B4F;line-height:1.6;border-top:1px solid rgba(44,24,16,0.06);">
<strong style="color:#2C1810;">ANIMAL CONCEPT SRL</strong><br>Rue Fût Voie 216 · 6687 Oupeye, Belgique<br>📧 contact@animalconceptsrl.com<br>TVA BE0871.492.738
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function h1(text) { return `<h1 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#2C1810;">${text}</h1>`; }
function p(text) { return `<p style="margin:0 0 8px;font-size:15px;color:#6B5B4F;line-height:1.5;">${text}</p>`; }
function label(text) { return `<div style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#8B7D70;margin-bottom:2px;">${text}</div>`; }
function val(text) { return `<div style="font-size:16px;font-weight:700;color:#2C1810;margin-bottom:10px;">${text}</div>`; }
function sep() { return `<hr style="border:none;border-top:1px solid rgba(44,24,16,0.06);margin:8px 0 12px;">`; }
function btn(url, label) {
  return `<table cellpadding="0" cellspacing="0" style="margin:16px 0;"><tr><td style="background:#C9762E;border-radius:6px;text-align:center;padding:0;">
<a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:800;color:#fff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;">${label}</a>
</td></tr></table>`;
}

async function sendReservationConfirmation({ email, name, reservation, puppy }) {
  const htmlContent = h1('🐶 Demande reçue !') + p('Merci pour votre confiance, ' + name + '.')
    + sep() + label('Numéro de réservation') + val(reservation.reservationNumber)
    + label('Chiot') + val(puppy.name + ' · ' + puppy.breed)
    + label('Prix') + val(wrapHtml ? formatEuro(puppy.price) : '')
    + sep() + label('Profession') + val(reservation.guestProfession || '—')
    + label('Adresse domicile') + val(reservation.guestHomeAddress || '—')
    + label('Téléphone') + val(reservation.guestPhone || '—')
    + label('Animal à la maison') + val(formatBool(reservation.hasPet))
    + label('Déjà perdu un animal') + val(formatBool(reservation.hasLostPet))
    + label('Livraison') + val(reservation.deliveryMethod === 'delivery' ? '🚚 Livraison' : '🏠 Retrait sur place')
    + sep() + label('Acompte versé') + val(formatEuro(reservation.depositAmount || 0))
    + (reservation.notes ? sep() + label('Message') + val(reservation.notes) : '')
    + btn(getPublicSiteUrl() + '/track/' + reservation.reservationNumber, '📍 Suivre ma réservation');

  await sendMail({
    to: email,
    subject: `Réservation ${reservation.reservationNumber} — ANIMAL CONCEPT SRL`,
    html: wrapHtml(htmlContent),
    text: [
      `Réservation confirmée - ANIMAL CONCEPT SRL`,
      ``,
      `Bonjour ${name},`,
      `Votre réservation ${reservation.reservationNumber} a bien été enregistrée.`,
      ``,
      `Chiot : ${puppy.name} (${puppy.breed})`,
       `Profession : ${reservation.guestProfession || '—'}`,
       `Adresse : ${reservation.guestHomeAddress || '—'}`,
       `Téléphone : ${reservation.guestPhone || '—'}`,
       `Animal à la maison : ${formatBool(reservation.hasPet)}`,
       `Déjà perdu un animal : ${formatBool(reservation.hasLostPet)}`,
       `Livraison : ${reservation.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait sur place'}${reservation.deliveryMethod === 'delivery' && reservation.deliveryAddress ? ` (${reservation.deliveryAddress})` : ''}`,
       `Prix du chiot : ${formatEuro(puppy.price)}`,
       `Paiement : ${reservation.paymentLabel || (reservation.paymentMethod === 'full' ? 'Intégral (-15%)' : 'Acompte 50% + solde livraison')}`,
      `Acompte versé : ${formatEuro(reservation.depositAmount || 0)}`,
      `${reservation.balanceAmount > 0 ? `Solde restant : ${formatEuro(reservation.balanceAmount)}` : ''}`,
      `Total : ${formatEuro(reservation.totalPrice || puppy.price)}`,
      `${reservation.notes ? `Message : ${reservation.notes}` : ''}`,
      ``,
      `Suivi : ${getPublicSiteUrl()}/track/${reservation.reservationNumber}`,
      ``,
      `-- ANIMAL CONCEPT SRL`,
      `Rue Fût Voie 216 · 6687 Oupeye, Belgique`,
      `TVA BE0871.492.738`,
    ].join('\n'),
  });
}

async function sendAdminNotification({ reservation, puppy }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return;

  const s = (v) => v || '—';
  const htmlContent = h1('🔔 Nouvelle réservation')
    + sep() + label('N° Réservation') + val(reservation.reservationNumber)
    + label('Client') + val(reservation.guestName)
    + label('Email') + val(reservation.guestEmail)
    + label('Téléphone') + val(reservation.guestPhone)
    + label('Profession') + val(s(reservation.guestProfession))
    + label('Adresse domicile') + val(s(reservation.guestHomeAddress))
    + label('Animal à la maison') + val(formatBool(reservation.hasPet))
    + label('Déjà perdu un animal') + val(formatBool(reservation.hasLostPet))
    + label('Livraison') + val(reservation.deliveryMethod === 'delivery' ? '🚚 Livraison' : '🏠 Retrait sur place')
    + label('Chiot') + val(puppy.name + ' (' + puppy.breed + ')')
    + label('Prix') + val(formatEuro(puppy.price))
    + (reservation.notes ? sep() + label('Notes client') + val(reservation.notes) : '')
    + btn(getPublicSiteUrl() + '/admin/reservations/' + reservation.id, '📋 Voir détails');

  await sendMail({
    to: adminEmail,
    subject: `🔔 Nouvelle réservation ${reservation.reservationNumber} — ${reservation.guestName}`,
    html: wrapHtml(htmlContent),
    text: [
      `Nouvelle réservation !`,
      ``,
      `Client : ${reservation.guestName}`,
      `Email : ${reservation.guestEmail}`,
      `Téléphone : ${reservation.guestPhone}`,
      `Profession : ${reservation.guestProfession || '—'}`,
      `Adresse domicile : ${reservation.guestHomeAddress || '—'}`,
      `Animal à la maison : ${formatBool(reservation.hasPet)}`,
      `Déjà perdu un animal : ${formatBool(reservation.hasLostPet)}`,
      `Livraison : ${reservation.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait sur place'}${reservation.deliveryMethod === 'delivery' && reservation.deliveryAddress ? ` (${reservation.deliveryAddress})` : ''}`,
      `Chiot : ${puppy.name} (${puppy.breed})`,
      `Prix : ${formatEuro(puppy.price)}`,
      `Paiement : ${reservation.paymentLabel || (reservation.paymentMethod === 'full' ? 'Intégral' : 'Acompte 50%')}`,
      `${reservation.notes ? `Notes : ${reservation.notes}` : ''}`,
      ``,
      `Admin : ${getPublicSiteUrl()}/admin/reservations/${reservation.id}`,
    ].join('\n'),
  });
}

async function sendStatusNotification({ email, name, reservationNumber, status, puppy }) {
  const statusLabels = {
    pending: 'Demande reçue',
    deposit_confirmed: 'Acompte confirmé',
    preparing: 'En préparation',
    ready: 'Prêt à partir',
    delivered: 'Remis à la famille',
    cancelled: 'Annulée',
  };
  const label = statusLabels[status] || status;
  const emoji = status === 'cancelled' ? '❌' : status === 'delivered' ? '🎉' : '📋';

  const htmlContent = h1(emoji + ' Mise à jour de votre réservation')
    + sep() + label('Nouveau statut') + val(label)
    + label('Réservation n°') + val(reservationNumber)
    + (puppy ? p('Concernant ' + puppy.name + ' (' + puppy.breed + ')') : '');

  await sendMail({
    to: email,
    subject: `Réservation ${reservationNumber} — ${label}`,
    html: wrapHtml(htmlContent),
    text: [
      `Mise à jour de votre réservation`,
      ``,
      `Bonjour ${name},`,
      `Le statut de votre réservation ${reservationNumber} est passé à : ${label}`,
      ...(puppy ? [`Concernant : ${puppy.name} (${puppy.breed})`] : []),
      ``,
      `-- ANIMAL CONCEPT SRL`,
      `Rue Fût Voie 216 · 6687 Oupeye, Belgique`,
      `TVA BE0871.492.738`,
    ].join('\n'),
  });
}

async function sendReplyToCustomer({ email, name, subject, message }) {
  const htmlContent = h1('✉️ Message de ANIMAL CONCEPT SRL')
    + p('Bonjour ' + name + ',')
    + '<div style="background:rgba(44,24,16,0.03);border:1px solid rgba(44,24,16,0.08);border-radius:8px;padding:16px 20px;margin:8px 0 12px;font-size:15px;color:#2C1810;line-height:1.6;white-space:pre-wrap;">' + message + '</div>';

  await sendMail({
    to: email,
    subject: subject || 'ANIMAL CONCEPT SRL — Message de votre éleveur',
    html: wrapHtml(htmlContent),
    text: [
      `Message de ANIMAL CONCEPT SRL`,
      ``,
      `Bonjour ${name},`,
      ``,
      message,
      ``,
      `-- ANIMAL CONCEPT SRL`,
      `Rue Fût Voie 216 · 6687 Oupeye, Belgique`,
      `TVA BE0871.492.738`,
    ].join('\n'),
  });
}

module.exports = { sendReservationConfirmation, sendAdminNotification, sendStatusNotification, sendReplyToCustomer };
