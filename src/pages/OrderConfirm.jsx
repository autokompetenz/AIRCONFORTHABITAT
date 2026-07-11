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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const productTypes = [...new Set((order?.items || []).map(i => i.product?.type).filter(Boolean))];
  const typeLabels = { climatiseur_fixe: 'Climatiseur', climatiseur_mobile: 'Climatiseur mobile', ventilateur: 'Ventilateur' };
  const paymentRef = `AIR ECO CLIM ${productTypes.map(t => typeLabels[t] || t).join(' + ')}`;

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !order?.orderNumber) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const { data } = await orderAPI.uploadPaymentProof(order.orderNumber, fd);
      setOrder(prev => ({ ...prev, paymentProofUrl: data.receiptUrl }));
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || 'Erreur lors de l\'envoi');
    } finally { setUploading(false); }
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
            {l === 'fr' ? `Référence : ${paymentRef}` : l === 'nl' ? `Referentie: ${paymentRef}` : `Reference: ${paymentRef}`}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16, background: '#FAFAFA' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {l === 'fr' ? 'Envoyer une preuve de virement' : l === 'nl' ? 'Bewijs van overschrijving versturen' : 'Send payment proof'}
          </p>
          {order.paymentProofUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#E8F5E9', border: '1px solid #A5D6A7' }}>
              <span style={{ color: '#2E7D32' }}>✅</span>
              <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>
                {l === 'fr' ? 'Preuve de virement reçue' : l === 'nl' ? 'Bewijs ontvangen' : 'Payment proof received'}
              </span>
              <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                {l === 'fr' ? 'Voir' : l === 'nl' ? 'Bekijken' : 'View'} →
              </a>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
                {l === 'fr' ? 'Après avoir effectué le virement, vous pouvez joindre ici une capture d\'écran ou un PDF du justificatif.' :
                  l === 'nl' ? 'Na de overschrijving kunt u hier een screenshot of PDF van het bewijs bijvoegen.' :
                  'After making the transfer, you can attach a screenshot or PDF of the receipt here.'}
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileSelect}
                  style={{ fontSize: 13, flex: 1, minWidth: 180 }} />
                <button onClick={handleUpload} disabled={uploading || !selectedFile}
                  className="btn-primary" style={{ fontSize: 12, padding: '8px 18px', minHeight: 36 }}>
                  {uploading ? (l === 'fr' ? 'Envoi...' : l === 'nl' ? 'Verzenden...' : 'Sending...') :
                    (l === 'fr' ? 'Envoyer' : l === 'nl' ? 'Versturen' : 'Send')}
                </button>
              </div>
              {uploadError && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 8 }}>{uploadError}</p>}
              {uploadSuccess && <p style={{ fontSize: 12, color: '#2E7D32', marginTop: 8, fontWeight: 600 }}>
                {l === 'fr' ? '✅ Preuve de virement envoyée avec succès !' : l === 'nl' ? '✅ Bewijs van overschrijving succesvol verzonden!' : '✅ Payment proof sent successfully!'}
              </p>}
            </>
          )}
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