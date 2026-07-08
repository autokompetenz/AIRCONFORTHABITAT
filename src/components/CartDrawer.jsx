import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro } from '../utils/helpers';
import { t } from '../utils/i18n';
import { orderAPI } from '../services/api';

export default function CartDrawer() {
  const { items, cartOpen, closeCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const l = lang || 'fr';
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const [showModal, setShowModal] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const handleOrder = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setOrdering(true);
    try {
      const res = await orderAPI.create({
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        customerName: fd.get('name'),
        customerEmail: fd.get('email'),
        customerPhone: fd.get('phone'),
        customerAddress: fd.get('address'),
        deliveryMethod: fd.get('deliveryMethod') || 'delivery',
        notes: fd.get('notes'),
      });
      clearCart();
      addToast(t('order_confirm', l), 'success');
      setShowModal(false);
      closeCart();
      navigate(`/track/${res.data.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setOrdering(false); }
  };

  return (
    <>
      <AnimatePresence>
        {cartOpen && (
          <>
            <div onClick={closeCart} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: Math.min(420, window.innerWidth - 20),
                zIndex: 2001, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {l === 'fr' ? 'Panier' : l === 'nl' ? 'Winkelwagen' : 'Cart'}
                  {items.length > 0 && <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, marginLeft: 8 }}>({items.reduce((s, i) => s + i.quantity, 0)})</span>}
                </h2>
                <button onClick={closeCart} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-2)', lineHeight: 1 }}>✕</button>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                    <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
                      {l === 'fr' ? 'Votre panier est vide' : l === 'nl' ? 'Uw winkelwagen is leeg' : 'Your cart is empty'}
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
                      {l === 'fr' ? 'Parcourez notre catalogue et ajoutez des produits.' : l === 'nl' ? 'Blader door onze catalogus en voeg producten toe.' : 'Browse our catalog and add products.'}
                    </p>
                    <Link to="/catalog" onClick={closeCart} className="btn-primary" style={{ textDecoration: 'none', padding: '14px 28px', fontSize: 14 }}>
                      {t('nav_products', l)} →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <img src={item.imageUrl || ''} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/product/${item.slug || item.id}`} onClick={closeCart} style={{ textDecoration: 'none' }}>
                            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                          </Link>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{item.brand}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                              <button onClick={() => { if (item.quantity <= 1) removeItem(item.id); else updateQuantity(item.id, item.quantity - 1); }}
                                style={{ background: 'none', border: 'none', width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ background: 'none', border: 'none', width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--primary)', marginLeft: 'auto' }}>{formatEuro(item.price * item.quantity)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-3)', padding: 4, lineHeight: 1, flexShrink: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', background: 'var(--bg-card)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{l === 'fr' ? 'Total' : l === 'nl' ? 'Totaal' : 'Total'}</span>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 28, color: 'var(--text)', letterSpacing: '-0.02em' }}>{formatEuro(total)}</span>
                  </div>
                  <button onClick={() => { closeCart(); setShowModal(true); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 15 }}>
                    ❄ {l === 'fr' ? 'Commander' : l === 'nl' ? 'Bestellen' : 'Order'}
                  </button>
                  <button onClick={clearCart} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', fontSize: 13, color: 'var(--text-3)', cursor: 'pointer', padding: 8 }}>
                    {l === 'fr' ? 'Vider le panier' : l === 'nl' ? 'Winkelwagen legen' : 'Clear cart'}
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
                background: 'var(--bg-card)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: '28px 32px',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>
                  {l === 'fr' ? 'Commander' : l === 'nl' ? 'Bestellen' : 'Order'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-2)', lineHeight: 1, padding: 0 }}>✕</button>
              </div>

              <form id="order-form" onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input name="name" required placeholder={t('name_label', l)} className="input-luxury" style={{ fontSize: 15, padding: '14px 16px' }} />
                <input name="email" type="email" required placeholder={t('email_label', l)} className="input-luxury" style={{ fontSize: 15, padding: '14px 16px' }} />
                <input name="phone" type="tel" required placeholder={t('phone_label', l)} className="input-luxury" style={{ fontSize: 15, padding: '14px 16px' }} />
                <input name="address" placeholder={t('address_ph', l)} className="input-luxury" style={{ fontSize: 15, padding: '14px 16px' }} />
                <div style={{ display: 'flex', gap: 12 }}>
                  {['delivery', 'pickup'].map(m => (
                    <label key={m} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, background: 'var(--bg-card2)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
                      <input type="radio" name="deliveryMethod" value={m} defaultChecked={m === 'delivery'} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                      {m === 'delivery' ? t('delivery_delivery', l) : t('delivery_pickup', l)}
                    </label>
                  ))}
                </div>
                <textarea name="notes" rows={2} placeholder={t('notes_ph', l)} className="input-luxury" style={{ fontSize: 15, padding: '14px 16px', resize: 'none' }} />

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, fontSize: 14, padding: '14px' }}>
                    {l === 'fr' ? 'Annuler' : l === 'nl' ? 'Annuleren' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={ordering} className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: 14, padding: '14px' }}>
                    {ordering ? '⏳...' : `❄ ${t('confirm_order', l)}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
