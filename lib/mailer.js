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

async function sendReservationConfirmation({ email, name, reservation, puppy }) {
  await sendMail({
    to: email,
    subject: `Réservation ${reservation.reservationNumber} — ANIMAL CONCEPT SRL`,
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

  await sendMail({
    to: adminEmail,
    subject: `Nouvelle réservation ${reservation.reservationNumber} — ${reservation.guestName}`,
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
  await sendMail({
    to: email,
    subject: `Réservation ${reservationNumber} — ${label}`,
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
  await sendMail({
    to: email,
    subject: subject || 'ANIMAL CONCEPT SRL — Message de votre éleveur',
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
