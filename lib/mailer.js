const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
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

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ANIMAL CONCEPT SRL</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#ffffff;border-radius:12px 12px 0 0;padding:32px 40px;border-bottom:2px solid #C9762E;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:22px;font-weight:900;color:#2C1810;letter-spacing:0.04em;">ANIMAL CONCEPT SRL</div>
                  <div style="font-size:10px;letter-spacing:0.4em;color:#C9762E;text-transform:uppercase;margin-top:3px;">Élevage familial · Oupeye</div>
                </td>
                <td align="right">
                  <div style="width:48px;height:48px;background:#C9762E;border-radius:8px;display:inline-block;line-height:48px;text-align:center;font-size:22px;">🐶</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f8f5f0;border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid rgba(44,24,16,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:15px;color:#6B5B4F;line-height:1.8;">
                  <strong style="color:#2C1810;">ANIMAL CONCEPT SRL</strong><br/>
                  Rue Fût Voie 216 · 6687 Oupeye, Belgique<br/>
                  📧 contact@animalconceptsrl.com<br/>
                  TVA BE0871.492.738
                </td>
                <td align="right" style="font-size:14px;color:#A8998B;">
                  © ${new Date().getFullYear()} ANIMAL CONCEPT SRL
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
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#2C1810;letter-spacing:-0.02em;">Demande reçue !</h1>
      <p style="margin:0;font-size:15px;color:#6B5B4F;">Merci pour votre confiance, ${name}.</p>
    </div>
    <div style="background:rgba(201,118,46,0.06);border:1px solid rgba(201,118,46,0.2);border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:14px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#8B7D70;margin-bottom:8px;">Numéro de réservation</div>
      <div style="font-size:32px;font-weight:900;color:#C9762E;letter-spacing:0.08em;font-family:monospace;">${reservation.reservationNumber}</div>
      <div style="font-size:15px;color:#8B7D70;margin-top:6px;">Passée le ${formatDate(reservation.createdAt)}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width:70px;">
                <img src="${puppy.imageUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=70'}"
                     alt="${puppy.name}" width="70" height="50"
                     style="object-fit:cover;border-radius:6px;display:block;"/>
              </td>
              <td style="padding-left:14px;">
                <div style="font-size:15px;font-weight:700;color:#2C1810;">${puppy.name}</div>
                <div style="font-size:14px;color:#8B7D70;margin-top:4px;">${puppy.breed} · ${puppy.sex === 'Male' ? 'Mâle' : 'Femelle'}</div>
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
             style="display:block;background:#C9762E;color:#fff;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:16px 24px;border-radius:6px;text-align:center;">
            📍 Suivre ma réservation
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Profession</div>
          <div style="font-size:14px;color:#2C1810;">${reservation.guestProfession || '—'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Adresse domicile</div>
          <div style="font-size:14px;color:#2C1810;">${reservation.guestHomeAddress || '—'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Téléphone</div>
          <div style="font-size:14px;color:#2C1810;">${reservation.guestPhone || '—'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Animal à la maison</div>
          <div style="font-size:14px;color:#2C1810;">${formatBool(reservation.hasPet)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Déjà perdu un animal</div>
          <div style="font-size:14px;color:#2C1810;">${formatBool(reservation.hasLostPet)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Livraison</div>
          <div style="font-size:14px;color:#2C1810;">${reservation.deliveryMethod === 'delivery' ? '🚚 Livraison' : '🏠 Retrait sur place'}</div>
        </td>
      </tr>
      ${reservation.deliveryMethod === 'delivery' ? `<tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Adresse livraison</div>
          <div style="font-size:14px;color:#2C1810;">${reservation.deliveryAddress || '—'}</div>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Prix du chiot</div>
          <div style="font-size:14px;color:#2C1810;">${formatEuro(puppy.price)}</div>
        </td>
      </tr>
      ${reservation.discountPercent > 0 ? `<tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Réduction (-${reservation.discountPercent}%)</div>
          <div style="font-size:14px;color:#22c55e;">– ${formatEuro(reservation.discountAmount)}</div>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(44,24,16,0.07);">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Acompte versé</div>
          <div style="font-size:14px;color:#C9762E;font-weight:700;">${formatEuro(reservation.depositAmount || 0)}</div>
        </td>
      </tr>
      ${reservation.balanceAmount > 0 ? `<tr>
        <td style="padding:14px 0;">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Solde à payer (à la remise)</div>
          <div style="font-size:14px;color:#2C1810;">${formatEuro(reservation.balanceAmount)}</div>
        </td>
      </tr>` : ''}
      ${reservation.notes ? `<tr>
        <td style="padding:14px 0;">
          <div style="font-size:14px;color:#8B7D70;margin-bottom:6px;">Message</div>
          <div style="font-size:14px;color:#2C1810;white-space:pre-wrap;">${reservation.notes}</div>
        </td>
      </tr>` : ''}
    </table>
    <p style="font-size:15px;color:#A8998B;text-align:center;margin:0;">
      Une question ? Répondez à cet email ou contactez-nous.<br/>
      ✉️ contact@animalconceptsrl.com
    </p>
  `;

  await sendMail({
    to: email,
    subject: `Réservation ${reservation.reservationNumber} — ANIMAL CONCEPT SRL`,
    html: baseTemplate(content),
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

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(201,118,46,0.1);border:2px solid rgba(201,118,46,0.3);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:14px;">🔔</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#2C1810;">Nouvelle réservation</h1>
      <p style="margin:0;font-size:14px;color:#6B5B4F;">Une demande vient d'arriver</p>
    </div>
    <div style="background:rgba(201,118,46,0.06);border:1px solid rgba(201,118,46,0.2);border-radius:10px;padding:18px 22px;text-align:center;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#8B7D70;margin-bottom:6px;">N° Réservation</div>
      <div style="font-size:28px;font-weight:900;color:#C9762E;letter-spacing:0.08em;font-family:monospace;">${reservation.reservationNumber}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Client</span><br/><span style="color:#2C1810;font-size:15px;font-weight:700;">${reservation.guestName}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Email</span><br/><span style="color:#2C1810;font-size:15px;">${reservation.guestEmail}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Téléphone</span><br/><span style="color:#2C1810;font-size:15px;">${reservation.guestPhone}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Profession</span><br/><span style="color:#2C1810;font-size:14px;">${reservation.guestProfession || '—'}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Adresse domicile</span><br/><span style="color:#2C1810;font-size:14px;">${reservation.guestHomeAddress || '—'}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Animal à la maison</span><br/><span style="color:#2C1810;font-size:14px;">${formatBool(reservation.hasPet)}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Déjà perdu un animal</span><br/><span style="color:#2C1810;font-size:14px;">${formatBool(reservation.hasLostPet)}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Livraison</span><br/><span style="color:#2C1810;font-size:14px;">${reservation.deliveryMethod === 'delivery' ? '🚚 Livraison' : '🏠 Retrait sur place'}${reservation.deliveryMethod === 'delivery' && reservation.deliveryAddress ? ` (${reservation.deliveryAddress})` : ''}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Chiot</span><br/><span style="color:#2C1810;font-size:15px;font-weight:700;">${puppy.name} (${puppy.breed})</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Prix</span><br/><span style="color:#C9762E;font-size:16px;font-weight:800;">${formatEuro(puppy.price)}</span></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(44,24,16,0.08);"><span style="color:#8B7D70;font-size:14px;">Paiement</span><br/><span style="color:#2C1810;font-size:15px;">${reservation.paymentLabel || (reservation.paymentMethod === 'full' ? 'Intégral' : 'Acompte 50%')}</span></td></tr>
      ${reservation.notes ? `<tr><td style="padding:10px 0;"><span style="color:#8B7D70;font-size:14px;">Notes client</span><br/><span style="color:#2C1810;font-size:14px;">${reservation.notes}</span></td></tr>` : ''}
    </table>
    <a href="${getPublicSiteUrl()}/admin/reservations/${reservation.id}"
       style="display:block;background:#C9762E;color:#fff;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:16px 24px;border-radius:6px;text-align:center;">
      📋 Voir détails
    </a>
  `;

  await sendMail({
    to: adminEmail,
    subject: `🔔 Nouvelle réservation ${reservation.reservationNumber} — ${reservation.guestName}`,
    html: baseTemplate(content),
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

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:72px;height:72px;background:rgba(201,118,46,0.1);border:2px solid rgba(201,118,46,0.3);border-radius:50%;display:inline-block;line-height:72px;font-size:32px;margin-bottom:18px;">${emoji}</div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#2C1810;letter-spacing:-0.02em;">Mise à jour de votre réservation</h1>
      <p style="margin:0;font-size:15px;color:#6B5B4F;">Bonjour ${name},</p>
    </div>
    <div style="background:rgba(201,118,46,0.06);border:1px solid rgba(201,118,46,0.2);border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:14px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#8B7D70;margin-bottom:12px;">Nouveau statut</div>
      <div style="font-size:24px;font-weight:900;color:#C9762E;letter-spacing:0.02em;margin-bottom:6px;">${label}</div>
      <div style="font-size:15px;color:#8B7D70;">Réservation n° ${reservationNumber}</div>
    </div>
    ${puppy ? `<p style="font-size:14px;color:#6B5B4F;text-align:center;margin:0 0 24px;">Concernant ${puppy.name} (${puppy.breed})</p>` : ''}
    <p style="font-size:15px;color:#A8998B;text-align:center;margin:0;">
      Une question ? Contactez-nous.<br/>
      ✉️ contact@animalconceptsrl.com
    </p>
  `;

  await sendMail({
    to: email,
    subject: `Réservation ${reservationNumber} — ${label}`,
    html: baseTemplate(content),
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
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(201,118,46,0.1);border:2px solid rgba(201,118,46,0.3);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:14px;">✉️</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#2C1810;">Message de ANIMAL CONCEPT SRL</h1>
      <p style="margin:0;font-size:14px;color:#6B5B4F;">Bonjour ${name},</p>
    </div>
    <div style="background:rgba(44,24,16,0.03);border:1px solid rgba(44,24,16,0.08);border-radius:10px;padding:24px;margin-bottom:24px;">
      <p style="font-size:15px;color:#2C1810;line-height:1.75;margin:0;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="font-size:15px;color:#A8998B;text-align:center;margin:0;">
      Une question ? Contactez-nous.<br/>
      ✉️ contact@animalconceptsrl.com
    </p>
  `;

  await sendMail({
    to: email,
    subject: subject || 'ANIMAL CONCEPT SRL — Message de votre éleveur',
    html: baseTemplate(content),
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
