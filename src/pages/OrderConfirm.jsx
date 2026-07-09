import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { formatEuro } from '../utils/helpers';
import { useBreakpoint } from '../hooks';
import { orderAPI } from '../services/api';
import { CheckCircle, ShoppingCart, ChevronLeft, Copy } from 'lucide-react';

export default function OrderConfirm() {
  const { number } = useParams();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!number) return;
    (async () => {
      try {
        const { data } = await orderAPI.track(number.trim().toUpperCase());
        setOrder(data.order);
        setPayment(data.payment);
      } catch {
        setError(true);
      } finally { setLoading(false); }
    })();
  }, [number]);

  const notes = order?.notes ? (() => { try { return JSON.parse(order.notes); } catch { return {}; } })() : {};

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E5E5E5', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', padding: isMobile ? '40px 4%' : '60px 5%', textAlign: 'center' }}>
        <ShoppingCart size={48} color="#ccc" strokeWidth={1.5} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          {l === 'fr' ? 'Commande introuvable' : l === 'nl' ? 'Bestelling niet gevonden' : 'Order not found'}
        </h2>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>
          {l === 'fr' ? 'Le numéro de commande est invalide ou n\'existe pas.' : l === 'nl' ? 'Het bestelnummer is ongeldig of bestaat niet.' : 'The order number is invalid or does not exist.'}
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px', fontSize: 13 }}>
          {t('return_home', l)}
        </Link>
      </div>
    );
  }

  const clientFields = [
    { label: l === 'fr' ? 'Nom' : l === 'nl' ? 'Achternaam' : 'Last name', value: notes.nom },
    { label: l === 'fr' ? 'Prénom' : l === 'nl' ? 'Voornaam' : 'First name', value: notes.prenom },
    { label: l === 'fr' ? 'Date de naissance' : l === 'nl' ? 'Geboortedatum' : 'Date of birth', value: notes.dateNaissance },
    { label: l === 'fr' ? 'Société' : l === 'nl' ? 'Bedrijf' : 'Company', value: notes.societe },
    { label: l === 'fr' ? 'Email' : l === 'nl' ? 'E-mail' : 'Email', value: order.customerEmail },
    { label: l === 'fr' ? 'Téléphone' : l === 'nl' ? 'Telefoon' : 'Phone', value: order.customerPhone },
    { label: l === 'fr' ? 'Pays' : l === 'nl' ? 'Land' : 'Country', value: notes.pays },
    { label: l === 'fr' ? 'Code postal' : l === 'nl' ? 'Postcode' : 'Postal code', value: notes.codePostal },
    { label: l === 'fr' ? 'Ville' : l === 'nl' ? 'Stad' : 'City', value: notes.ville },
    { label: l === 'fr' ? 'Adresse' : l === 'nl' ? 'Adres' : 'Address', value: notes.numeroVoie },
    { label: l === 'fr' ? 'Lieu-dit' : l === 'nl' ? 'Plaatsnaam' : 'Place name', value: notes.lieuDit },
    { label: l === 'fr' ? 'Complément' : l === 'nl' ? 'Aanvulling' : 'Complement', value: notes.complement },
    { label: l === 'fr' ? 'SMS offres' : l === 'nl' ? 'SMS aanbiedingen' : 'SMS offers', value: notes.smsOffres ? (l === 'fr' ? 'Accepté' : l === 'nl' ? 'Geaccepteerd' : 'Accepted') : null },
  ].filter(f => f.value);

  const cell = (label, value) => value ? (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 1 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', wordBreak: 'break-word' }}>{value}</span>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      <div style={{ background: '#F5F5F5', borderBottom: '1px solid var(--border)', padding: isMobile ? '20px 4% 16px' : '28px 5% 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link to="/" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#999', fontSize: 12, textDecoration: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            <ChevronLeft size={16} strokeWidth={1.5} />
            {t('return_home', l)}
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 4% 80px' : '40px 5%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckCircle size={28} strokeWidth={2} color="#2E7D32" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px,4vw,32px)', color: '#1A1A1A', marginBottom: 6 }}>
            {l === 'fr' ? 'Commande confirmée !' : l === 'nl' ? 'Bestelling bevestigd!' : 'Order confirmed!'}
          </h1>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 400, margin: '0 auto' }}>
            {l === 'fr' ? 'Votre commande a bien été enregistrée. Vous allez recevoir un email de confirmation.' :
              l === 'nl' ? 'Uw bestelling is geregistreerd. U ontvangt een bevestigingsmail.' :
              'Your order has been recorded. You will receive a confirmation email.'}
          </p>
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0F4FF', padding: '8px 16px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('your_number', l)}
            </span>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {order.orderNumber}
            </span>
            <button onClick={() => copyText(order.orderNumber, 'num')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'num' ? '#2E7D32' : '#999', padding: 2, display: 'flex' }}>
              <Copy size={14} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {l === 'fr' ? 'Vos informations' : l === 'nl' ? 'Uw gegevens' : 'Your information'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px 20px' }}>
            {clientFields.map((f, i) => cell(f.label, f.value))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {l === 'fr' ? 'Détails de la commande' : l === 'nl' ? 'Bestelgegevens' : 'Order details'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {l === 'fr' ? 'Produits' : l === 'nl' ? 'Producten' : 'Products'}
            </span>
            <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>
              {formatEuro(order.totalAmount || 0)}
            </span>
          </div>
          {order.items?.map((item, i) => (
            <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#F5F5F5', marginBottom: 6 }}>
              <img src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&q=70'}
                alt={item.product?.name} style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</p>
                <p style={{ fontSize: 11, color: '#999' }}>{item.quantity || 1}x · {formatEuro(item.price)}</p>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{formatEuro(item.price * (item.quantity || 1))}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ border: '2px solid var(--primary)', padding: isMobile ? 16 : 24, marginBottom: 24, background: '#F0F7FF' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {l === 'fr' ? 'Paiement par virement bancaire' : l === 'nl' ? 'Betaling via bankoverschrijving' : 'Payment by bank transfer'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#fff', padding: '10px 14px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>IBAN</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{payment?.iban || 'BE68 1234 5678 9012'}</span>
                <button onClick={() => copyText(payment?.iban || '', 'iban')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'iban' ? '#2E7D32' : '#999', padding: 2, display: 'flex', flexShrink: 0 }}>
                  <Copy size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '10px 14px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>BIC</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', fontFamily: 'monospace' }}>{payment?.bic || 'GEBABEBB'}</span>
                <button onClick={() => copyText(payment?.bic || '', 'bic')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'bic' ? '#2E7D32' : '#999', padding: 2, display: 'flex', flexShrink: 0 }}>
                  <Copy size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.4, background: '#fff', padding: 10, border: '1px solid var(--border)' }}>
            {l === 'fr' ? 'Merci d\'utiliser le numéro de commande comme référence de paiement. Votre commande sera traitée dès réception du virement.' :
              l === 'nl' ? 'Gebruik het bestelnummer als betalingskenmerk. Uw bestelling wordt verwerkt zodra de overschrijving is ontvangen.' :
              'Please use the order number as payment reference. Your order will be processed upon receipt of the transfer.'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center' }}>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {t('return_home', l)} →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}