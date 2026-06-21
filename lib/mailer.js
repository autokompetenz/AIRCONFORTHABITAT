const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  rateLimit: 5,
  tls: { rejectUnauthorized: true },
});

const DOMAIN = (process.env.SMTP_USER || '').split('@')[1] || 'gmail.com';
const FROM   = `"${process.env.FROM_NAME || 'Sweet Puppies'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

function getPublicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return 'https://sweetpuppies.vercel.app';
}

async function sendMail({ to, subject, html, text }) {
  const messageId = `<${crypto.randomUUID()}@${DOMAIN}>`;
  return transporter.sendMail({
    from: FROM, to, subject, html, text,
    headers: {
      'Message-ID': messageId,
      'X-Mailer': 'Sweet Puppies Mailer v1',
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

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sweet Puppies</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#111113;border-radius:12px 12px 0 0;padding:32px 40px;border-bottom:2px solid #C9762E;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">SWEET PUPPIES</div>
                  <div style="font-size:9px;letter-spacing:0.4em;color:#C9762E;text-transform:uppercase;margin-top:3px;">Élevage familial · Bastogne</div>
                </td>
                <td align="right">
                  <div style="width:48px;height:48px;background:#C9762E;border-radius:8px;display:inline-block;line-height:48px;text-align:center;font-size:22px;">🐶</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#18181A;padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#111113;border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:rgba(255,255,255,0.3);line-height:1.8;">
                  <strong style="color:rgba(255,255,255,0.5);">Sweet Puppies</strong><br/>
                  Rue de l'Orneau 30 · 6687 Bastogne, Belgique<br/>
                  📞 +32 4 78 00 00 00 · 📧 info@sweetpuppies.be<br/>
                  TVA BE0800.443.307
                </td>
                <td align="right" style="font-size:11px;color:rgba(255,255,255,0.15);">
                  © ${new Date().getFullYear()} Sweet Puppies
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendReservationConfirmation({ email, name, reservation, puppy }) {
  const statusLabels = {
    pending: 'Demande reçue',
    deposit_confirmed: 'Acompte confirmé',
    preparing: 'En préparation',
    ready: 'Prêt à partir',
    delivered: 'Remis à la famille',
    cancelled: 'Annulée',
  };

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:72px;height:72px;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);border-radius:50%;display:inline-block;line-height:72px;font-size:32px;margin-bottom:18px;">🐶</div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Demande reçue !</h1>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);">Merci pour votre confiance, ${name}.</p>
    </div>
    <div style="background:rgba(201,118,46,0.06);border:1px solid rgba(201,118,46,0.2);border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Numéro de réservation</div>
      <div style="font-size:32px;font-weight:900;color:#C9762E;letter-spacing:0.08em;font-family:monospace;">${reservation.reservationNumber}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.3);margin-top:6px;">Passée le ${formatDate(reservation.createdAt)}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width:70px;">
                <img src="${puppy.imageUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=70'}"
                     alt="${puppy.name}" width="70" height="50"
                     style="object-fit:cover;border-radius:6px;display:block;"/>
              </td>
              <td style="padding-left:14px;">
                <div style="font-size:15px;font-weight:700;color:#fff;">${puppy.name}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:3px;">${puppy.breed} · ${puppy.sex === 'Male' ? 'Mâle' : 'Femelle'}</div>
              </td>
              <td align="right" style="font-size:17px;font-weight:900;color:#C9762E;white-space:nowrap;">
                ${reservation.paymentMethod === 'full' ? 'Payé intégralement' : `${formatEuro(reservation.depositAmount)}`}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding-right:8px;">
          <a href="${getPublicSiteUrl()}/track/${reservation.reservationNumber}"
             style="display:block;background:#C9762E;color:#fff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 20px;border-radius:6px;text-align:center;">
            📍 Suivre ma réservation
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:4px;">Profession</div>
          <div style="font-size:14px;color:#fff;">${reservation.guestProfession || '—'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:4px;">Adresse domicile</div>
          <div style="font-size:14px;color:#fff;">${reservation.guestHomeAddress || '—'}</div>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:rgba(255,255,255,0.25);text-align:center;margin:0;">
      Une question ? Répondez à cet email ou contactez-nous.<br/>
      📞 +32 4 78 00 00 00 · ✉️ info@sweetpuppies.be
    </p>
  `;

  await sendMail({
    to: email,
    subject: `Réservation ${reservation.reservationNumber} — Sweet Puppies`,
    html: baseTemplate(content),
    text: [
      `Réservation confirmée - Sweet Puppies`,
      ``,
      `Bonjour ${name},`,
      `Votre réservation ${reservation.reservationNumber} a bien été enregistrée.`,
      ``,
      `Chiot : ${puppy.name} (${puppy.breed})`,
       `Profession : ${reservation.guestProfession || '—'}`,
       `Adresse : ${reservation.guestHomeAddress || '—'}`,
       `Paiement : ${reservation.paymentLabel || (reservation.paymentMethod === 'full' ? 'Intégral (-15%)' : 'Acompte 50% + solde livraison')}`,
      `Montant : ${formatEuro(reservation.depositAmount || 0)}${reservation.balanceAmount > 0 ? ` + ${formatEuro(reservation.balanceAmount)}` : ''}`,
      `Total : ${formatEuro(reservation.totalPrice || puppy.price)}`,
      ``,
      `Suivi : ${getPublicSiteUrl()}/track/${reservation.reservationNumber}`,
      ``,
      `-- Sweet Puppies`,
      `Rue de l'Orneau 30 · 6687 Bastogne, Belgique`,
      `TVA BE0800.443.307`,
    ].join('\n'),
  });
}

module.exports = { sendReservationConfirmation };
