import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLangStore, useThemeStore } from '../store';
import { t } from '../utils/i18n';
import { formatEuro } from '../utils/helpers';
import { useBreakpoint } from '../hooks';
import { orderAPI } from '../services/api';

const STATUS_ICONS = {
  pending:   '📝',
  confirmed: '✅',
  preparing: '📦',
  shipped:   '🚚',
  delivered: '🏠',
  cancelled: '❌',
};

export default function Track() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const isDark = theme === 'dark';
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 72 }}>
      <div style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)', padding: isMobile ? '36px 4% 28px' : '52px 6% 36px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(30px,5vw,64px)', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            {t('track_order', l)}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-3)', maxWidth: 520 }}>
            {l==='fr'?'Entrez votre numéro de commande pour suivre l\u2019état de votre livraison.':
              l==='nl'?'Voer uw bestelnummer in om de status van uw levering te volgen.':
              l==='en'?'Enter your order number to track the status of your delivery.':'Entrez votre numéro de commande pour suivre l\'état de votre livraison.'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '24px 4%' : '40px 6%' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input value={searchNum} onChange={e => setSearchNum(e.target.value)}
            placeholder={t('track_ph', l)} className="input-luxury" style={{ flex: 1, fontSize: 16 }} />
          <button type="submit" className="btn-primary" style={{ padding: '13px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
            {t('track_order', l)}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(46,134,193,0.15)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto' }} />
          </div>
        )}

        {!loading && searched && !order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: 40, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
              {l==='fr'?'Commande introuvable':l==='nl'?'Bestelling niet gevonden':l==='en'?'Order not found':'Commande introuvable'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
              {l==='fr'?'Vérifiez le numéro et réessayez.':l==='nl'?'Controleer het nummer en probeer het opnieuw.':l==='en'?'Check the number and try again.':'Vérifiez le numéro et réessayez.'}
            </p>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 20 : 24, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>
                    {l==='fr'?'Commande':l==='nl'?'Bestelling':l==='en'?'Order':'Commande'}
                  </p>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
                    {order.orderNumber}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>
                    {t('total', l)}
                  </p>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--primary)' }}>
                    {formatEuro(order.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {order.items?.length > 0 && order.items.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--bg-card2)', borderRadius: 10, marginBottom: 10 }}>
                  <img src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&q=70'}
                    alt={item.product?.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{item.product?.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{item.product?.brand} · {item.quantity || 1}x</p>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{l==='fr'?'Client':l==='nl'?'Klant':l==='en'?'Client':'Client'}</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>{order.customerName}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{l==='fr'?'Date':l==='nl'?'Datum':l==='en'?'Date':'Date'}</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>{new Date(order.createdAt).toLocaleDateString(l==='nl'?'nl-BE':l==='en'?'en-GB':'fr-BE')}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 20 : 28, boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 20 }}>
                {l==='fr'?'Suivi de la commande':l==='nl'?'Bestelstatus':l==='en'?'Order status':'Suivi de la commande'}
              </p>

              <div className="reservation-timeline">
                {timelineSteps.map((step, i) => {
                  const isActive = order.status === step.key || (timelineSteps.findIndex(s => s.key === order.status) >= i);
                  const isCancelled = order.status === 'cancelled';
                  const isCurrentStep = order.status === step.key;

                  return (
                    <div key={step.key} style={{ display: 'flex', gap: 14, padding: '0 0 24px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isCurrentStep ? 'linear-gradient(135deg,var(--secondary),var(--primary))' : isActive ? 'var(--primary-bg)' : 'var(--bg-card2)',
                          border: `2px solid ${isCurrentStep ? 'var(--primary)' : isActive ? 'rgba(46,134,193,0.4)' : 'var(--border)'}`,
                          fontSize: 16, zIndex: 2, transition: 'all 0.3s',
                        }}>
                          <span style={{ fontSize: 14 }}>{STATUS_ICONS[step.key]}</span>
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div style={{
                            flex: 1, width: 2,
                            background: isActive ? 'linear-gradient(to bottom,var(--primary),rgba(46,134,193,0.2))' : 'var(--border)',
                          }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: isCurrentStep ? 700 : 500, color: isActive ? 'var(--text)' : 'var(--text-3)', marginBottom: 2 }}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cancelled */}
              {order.status === 'cancelled' && (
                <div style={{ marginTop: 12, padding: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{t('timeline_cancel', l)}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
