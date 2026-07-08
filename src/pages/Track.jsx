import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { formatEuro } from '../utils/helpers';
import { useBreakpoint } from '../hooks';
import { orderAPI } from '../services/api';
import { FileText, CheckCircle, Package, Truck, Home, Search, XCircle } from 'lucide-react';

const STATUS_ICONS = {
  pending: FileText,
  confirmed: CheckCircle,
  preparing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
};

export default function Track() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const { number } = useParams();
  const [searchNum, setSearchNum] = useState(number || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchNum.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const { data } = await orderAPI.track(searchNum.trim().toUpperCase());
      setOrder(data.order);
    } catch {
      setOrder(null);
    } finally { setLoading(false); }
  };

  const timelineSteps = [
    { key: 'pending', label: t('timeline_pending', l) },
    { key: 'confirmed', label: t('timeline_confirmed', l) },
    { key: 'preparing', label: t('timeline_prep', l) },
    { key: 'shipped', label: t('timeline_shipped', l) },
    { key: 'delivered', label: t('timeline_done', l) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: '#F5F5F5', borderBottom: '1px solid var(--border)', padding: isMobile ? '28px 4% 24px' : '40px 5% 32px' }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,40px)', color: '#1A1A1A', marginBottom: 8 }}
          >
            {t('track_order', l)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            style={{ fontSize: 14, color: '#999', maxWidth: 480 }}
          >
            {l === 'fr' ? 'Entrez votre numéro de commande pour suivre l\'état de votre livraison.' :
              l === 'nl' ? 'Voer uw bestelnummer in om de status van uw levering te volgen.' :
              'Enter your order number to track the status of your delivery.'}
          </motion.p>
        </div>
      </motion.div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '20px 4%' : '32px 5%' }}>
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: 8, marginBottom: 28 }}
        >
          <input value={searchNum} onChange={e => setSearchNum(e.target.value)}
            placeholder={t('track_ph', l)}
            style={{ flex: 1, border: '1px solid var(--border)', padding: '9px 12px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          <button type="submit" className="btn-primary" style={{ padding: '9px 16px', fontSize: 12, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} strokeWidth={2} /> {t('track_order', l)}
          </button>
        </motion.form>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: 'center', padding: 32 }}
          >
            <div style={{ width: 28, height: 28, border: '2px solid #E5E5E5', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </motion.div>
        )}

        {!loading && searched && !order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: 32, border: '1px solid var(--border)', background: '#F5F5F5' }}>
            <Search size={32} color="#ccc" strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 6 }}>
              {l === 'fr' ? 'Commande introuvable' : l === 'nl' ? 'Bestelling niet gevonden' : 'Order not found'}
            </h3>
            <p style={{ fontSize: 13, color: '#999' }}>
              {l === 'fr' ? 'Vérifiez le numéro et réessayez.' : l === 'nl' ? 'Controleer het nummer en probeer het opnieuw.' : 'Check the number and try again.'}
            </p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>
                    {l === 'fr' ? 'Commande' : l === 'nl' ? 'Bestelling' : 'Order'}
                  </p>
                  <p style={{ fontWeight: 800, fontSize: 16, color: '#1A1A1A' }}>
                    {order.orderNumber}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>
                    {t('total', l)}
                  </p>
                  <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>
                    {formatEuro(order.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {order.items?.length > 0 && order.items.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#F5F5F5', marginBottom: 8 }}>
                  <img src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&q=70'}
                    alt={item.product?.name} style={{ width: 48, height: 48, objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{item.product?.name}</p>
                    <p style={{ fontSize: 11, color: '#999' }}>{item.product?.brand} · {item.quantity || 1}x</p>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: '#999' }}>{l === 'fr' ? 'Client' : l === 'nl' ? 'Klant' : 'Client'}</p>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{order.customerName}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#999' }}>{l === 'fr' ? 'Date' : l === 'nl' ? 'Datum' : 'Date'}</p>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{new Date(order.createdAt).toLocaleDateString(l === 'nl' ? 'nl-BE' : l === 'en' ? 'en-GB' : 'fr-FR')}</p>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 16 }}>
                {l === 'fr' ? 'Suivi de la commande' : l === 'nl' ? 'Bestelstatus' : 'Order status'}
              </p>

              {timelineSteps.map((step, i) => {
                const stepIndex = timelineSteps.findIndex(s => s.key === order.status);
                const isActive = i <= stepIndex;
                const isCancelled = order.status === 'cancelled';
                const isCurrent = i === stepIndex;

                const Icon = STATUS_ICONS[step.key];

                return (
                  <div key={step.key} style={{ display: 'flex', gap: 12, paddingBottom: i < timelineSteps.length - 1 ? 20 : 0, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCurrent ? 'var(--primary)' : isActive ? 'var(--primary)' : '#E5E5E5',
                        zIndex: 2,
                      }}>
                        <Icon size={14} strokeWidth={2} color="#fff" />
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div style={{ flex: 1, width: 1, background: isActive ? 'var(--primary)' : '#E5E5E5' }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isActive ? '#1A1A1A' : '#999' }}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}

              {order.status === 'cancelled' && (
                <div style={{ marginTop: 12, padding: 10, background: '#FFF0F0', border: '1px solid #FFCCCC', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#CC0000' }}>{t('timeline_cancel', l)}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
