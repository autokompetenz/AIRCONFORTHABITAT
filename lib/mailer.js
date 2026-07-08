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
  pool: true,
  maxConnections: 1,
  maxMessages: Infinity,
  tls: { rejectUnauthorized: false },
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 60000,
});

const DOMAIN = (process.env.SMTP_USER || '').split('@')[1] || 'gmail.com';
const FROM   = `"${process.env.FROM_NAME || 'AIRCONFORTHABITAT'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

function getPublicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return 'https://animalconceptsrl.com';
}

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapHtml(title, content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#fff;border-radius:8px;overflow:hidden;">
<tr><td style="padding:24px 28px 0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td><span style="font-size:17px;font-weight:800;color:#0F1A2E;">AIRCONFORTHABITAT</span><br><span style="font-size:9px;letter-spacing:0.25em;color:#2E86C1;text-transform:uppercase;">Liège · Belgique</span></td>
<td align="right"><span style="display:inline-block;width:36px;height:36px;background:#2E86C1;border-radius:6px;line-height:36px;text-align:center;font-size:16px;">❄</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:6px 28px 0;"><div style="height:1px;background:rgba(15,26,46,0.07);"></div></td></tr>
<tr><td style="padding:14px 28px 10px;font-size:14px;color:#0F1A2E;line-height:1.5;">${content}</td></tr>
<tr><td style="padding:12px 28px 18px;background:#f7fafc;border-top:1px solid rgba(15,26,46,0.07);"><span style="font-size:11px;color:#3D4F66;line-height:1.5;">
<strong style="color:#0F1A2E;">AIRCONFORTHABITAT</strong><br>Liège, Belgique</span></td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

const L = (k, v) => `<div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8A9BAE;margin:6px 0 1px;">${esc(k)}</div><div style="font-size:14px;color:#0F1A2E;margin:0 0 2px;">${esc(v)}</div>`;
const SEP = () => '<div style="height:1px;background:rgba(15,26,46,0.06);margin:8px 0;"></div>';

async function sendMail({ to, subject, html, text }) {
  const messageId = `<${crypto.randomUUID()}@${DOMAIN}>`;
  return transporter.sendMail({
    from: FROM, to, subject, html, text,
    headers: {
      'Message-ID': messageId,
      'X-Mailer': 'AIRCONFORTHABITAT Mailer v1',
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

function formatItems(items) {
  if (!items || items.length === 0) return '';
  return items.map((item, i) =>
    `<div style="font-size:14px;color:#0F1A2E;margin:4px 0;">${esc(item.product?.name || item.productName || 'Produit')} × ${item.quantity || 1} — ${formatEuro(item.price)}</div>`
  ).join('');
}

async function sendOrderConfirmation({ email, name, order, items }) {
  const html = wrapHtml('Commande reçue',
    '<div style="font-size:18px;font-weight:800;color:#2E86C1;margin-bottom:8px;">Demande reçue !</div>' +
    '<div style="margin-bottom:10px;">Merci pour votre confiance, ' + esc(name) + '.</div>' +
    SEP() +
    L('N° Commande', order.orderNumber) +
    (items ? SEP() + '<div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8A9BAE;margin:6px 0 1px;">Produits</div>' + formatItems(items) : '') +
    SEP() +
    L('Total', formatEuro(order.totalAmount || 0)) +
    L('Téléphone', esc(order.customerPhone || '—')) +
    L('Adresse', esc(order.customerAddress || order.deliveryAddress || '—')) +
    (order.notes ? SEP() + L('Message', esc(order.notes)) : '') +
    '<div style="text-align:center;margin:14px 0 6px;"><a href="' + esc(getPublicSiteUrl() + '/track/' + order.orderNumber) + '" style="display:inline-block;background:#2E86C1;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:10px 22px;border-radius:5px;">Suivre ma commande</a></div>'
  );

  await sendMail({
    to: email,
    subject: `Commande ${order.orderNumber} — AIRCONFORTHABITAT`,
    html,
    text: [
      `Commande confirmée — AIRCONFORTHABITAT`,
      ``,
      `Bonjour ${name},`,
      `Votre commande ${order.orderNumber} a bien été enregistrée.`,
      ``,
      `Total : ${formatEuro(order.totalAmount || 0)}`,
      ``,
      `Téléphone : ${order.customerPhone || '—'}`,
      `Adresse : ${order.customerAddress || order.deliveryAddress || '—'}`,
      `${order.notes ? 'Message : ' + order.notes : ''}`,
      ``,
      `Suivi : ${getPublicSiteUrl()}/track/${order.orderNumber}`,
      ``,
      `-- AIRCONFORTHABITAT`,
      `Liège, Belgique`,
    ].join('\n'),
  });
}

async function sendAdminNotification({ order, items }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return;

  const s = (v) => v || '—';
  const dm = order.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait sur place';

  const html = wrapHtml('Nouvelle commande',
    '<div style="font-size:18px;font-weight:800;color:#2E86C1;margin-bottom:8px;">Nouvelle commande !</div>' +
    SEP() +
    L('N° Commande', order.orderNumber) +
    L('Client', esc(s(order.customerName))) +
    L('Email', esc(s(order.customerEmail))) +
    L('Téléphone', esc(s(order.customerPhone))) +
    L('Adresse', esc(s(order.customerAddress))) +
    L('Livraison', dm) +
    (items ? SEP() + '<div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8A9BAE;margin:6px 0 1px;">Produits</div>' + formatItems(items) : '') +
    SEP() +
    L('Total', formatEuro(order.totalAmount || 0)) +
    (order.notes ? SEP() + L('Notes', esc(order.notes)) : '') +
    '<div style="text-align:center;margin:14px 0 6px;"><a href="' + esc(getPublicSiteUrl() + '/admin/orders/' + order.id) + '" style="display:inline-block;background:#2E86C1;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:10px 22px;border-radius:5px;">Voir détails</a></div>'
  );

  await sendMail({
    to: adminEmail,
    subject: `Nouvelle commande ${order.orderNumber} — ${s(order.customerName)}`,
    html,
    text: [
      `Nouvelle commande !`,
      ``,
      `N° Commande : ${order.orderNumber}`,
      `Client : ${s(order.customerName)}`,
      `Email : ${s(order.customerEmail)}`,
      `Téléphone : ${s(order.customerPhone)}`,
      `Adresse : ${s(order.customerAddress)}`,
      `Livraison : ${dm}`,
      ``,
      `Total : ${formatEuro(order.totalAmount || 0)}`,
      `${order.notes ? 'Notes : ' + order.notes : ''}`,
      ``,
      `Admin : ${getPublicSiteUrl()}/admin/orders/${order.id}`,
    ].join('\n'),
  });
}

async function sendStatusNotification({ email, name, orderNumber, status }) {
  const statusLabels = {
    pending: 'Demande reçue',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  const label = statusLabels[status] || status;

  const html = wrapHtml('Mise à jour',
    '<div style="font-size:18px;font-weight:800;color:#2E86C1;margin-bottom:6px;">Mise à jour de votre commande</div>' +
    '<div style="margin-bottom:10px;">Bonjour ' + esc(name) + ',</div>' +
    SEP() +
    L('Nouveau statut', label) +
    L('Commande n°', orderNumber)
  );

  await sendMail({
    to: email,
    subject: `Commande ${orderNumber} — ${label}`,
    html,
    text: [
      `Mise à jour de votre commande`,
      ``,
      `Bonjour ${name},`,
      `Le statut de votre commande ${orderNumber} est passé à : ${label}`,
      ``,
      `-- AIRCONFORTHABITAT`,
      `Liège, Belgique`,
    ].join('\n'),
  });
}

async function sendReplyToCustomer({ email, name, subject, message }) {
  const html = wrapHtml('Message',
    '<div style="font-size:18px;font-weight:800;color:#2E86C1;margin-bottom:6px;">Message de AIRCONFORTHABITAT</div>' +
    '<div style="margin-bottom:10px;">Bonjour ' + esc(name) + ',</div>' +
    '<div style="background:rgba(46,134,193,0.06);border:1px solid rgba(46,134,193,0.15);border-radius:6px;padding:12px 14px;margin:8px 0;font-size:14px;color:#0F1A2E;line-height:1.5;white-space:pre-wrap;">' + esc(message) + '</div>'
  );

  await sendMail({
    to: email,
    subject: subject || 'AIRCONFORTHABITAT — Message de notre équipe',
    html,
    text: [
      `Message de AIRCONFORTHABITAT`,
      ``,
      `Bonjour ${name},`,
      ``,
      message,
      ``,
      `-- AIRCONFORTHABITAT`,
      `Liège, Belgique`,
    ].join('\n'),
  });
}

module.exports = { sendOrderConfirmation, sendAdminNotification, sendStatusNotification, sendReplyToCustomer };
