import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro } from '../utils/helpers';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import { orderAPI } from '../services/api';
import { ShoppingCart, X, Minus, Plus } from 'lucide-react';

export default function CartDrawer() {
  const { items, cartOpen, closeCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
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
            <div onClick={closeCart} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)' }} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                 position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : Math.min(400, window.innerWidth - 20),
                zIndex: 2001, background: '#fff', borderLeft: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>
                  {l === 'fr' ? 'Panier' : l === 'nl' ? 'Winkelwagen' : 'Cart'}
                  {items.length > 0 && <span style={{ fontSize: 13, color: '#999', fontWeight: 600, marginLeft: 6 }}>({items.reduce((s, i) => s + i.quantity, 0)})</span>}
                </h2>
                <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4 }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <ShoppingCart size={40} color="#ccc" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 6 }}>
                      {l === 'fr' ? 'Votre panier est vide' : l === 'nl' ? 'Uw winkelwagen is leeg' : 'Your cart is empty'}
                    </p>
                    <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                      {l === 'fr' ? 'Parcourez notre catalogue et ajoutez des produits.' : l === 'nl' ? 'Blader door onze catalogus en voeg producten toe.' : 'Browse our catalog and add products.'}
                    </p>
                    <Link to="/catalog" onClick={closeCart} className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: 12 }}>
                      {t('nav_products', l)} →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px', border: '1px solid var(--border)', background: '#F5F5F5' }}>
                        <img src={item.imageUrl || ''} alt={item.name} style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/product/${item.slug || item.id}`} onClick={closeCart} style={{ textDecoration: 'none' }}>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                          </Link>
                          <p style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{item.brand}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                              <button onClick={() => { if (item.quantity <= 1) { removeItem(item.id); addToast(t('item_removed', l), 'info'); } else updateQuantity(item.id, item.quantity - 1); }}
                                style={{ background: 'none', border: 'none', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                <Minus size={12} strokeWidth={2} />
                              </button>
                              <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ background: 'none', border: 'none', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                <Plus size={12} strokeWidth={2} />
                              </button>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', marginLeft: 'auto' }}>{formatEuro(item.price * item.quantity)}</span>
                          </div>
                        </div>
                        <button onClick={() => { removeItem(item.id); addToast(t('item_removed', l), 'info'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4, flexShrink: 0 }}>
                          <X size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: '#fff', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{l === 'fr' ? 'Total' : l === 'nl' ? 'Totaal' : 'Total'}</span>
                    <span style={{ fontWeight: 900, fontSize: 24, color: '#1A1A1A', letterSpacing: '-0.02em' }}>{formatEuro(total)}</span>
                  </div>
                  <button onClick={() => { closeCart(); setShowModal(true); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 13, gap: 8 }}>
                    <ShoppingCart size={16} strokeWidth={2} /> {l === 'fr' ? 'Commander' : l === 'nl' ? 'Bestellen' : 'Order'}
                  </button>
                  <button onClick={() => { clearCart(); addToast(t('cart_cleared', l), 'info'); }} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', fontSize: 12, color: '#999', cursor: 'pointer', padding: 6 }}>
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
              position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto',
                background: '#fff', padding: isMobile ? '20px 16px' : '24px 28px',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>
                  {l === 'fr' ? 'Commander' : l === 'nl' ? 'Bestellen' : 'Order'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form id="order-form" onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input name="name" required placeholder={t('name_label', l)} className="input-luxury" style={{ fontSize: 14, padding: '10px 14px' }} />
                <input name="email" type="email" required placeholder={t('email_label', l)} className="input-luxury" style={{ fontSize: 14, padding: '10px 14px' }} />
                <input name="phone" type="tel" required placeholder={t('phone_label', l)} className="input-luxury" style={{ fontSize: 14, padding: '10px 14px' }} />
                <input name="address" placeholder={t('address_ph', l)} className="input-luxury" style={{ fontSize: 14, padding: '10px 14px' }} />
                <textarea name="notes" rows={2} placeholder={t('notes_ph', l)} className="input-luxury" style={{ fontSize: 14, padding: '10px 14px', resize: 'none' }} />

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, fontSize: 13, padding: '12px' }}>
                    {l === 'fr' ? 'Annuler' : l === 'nl' ? 'Annuleren' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={ordering} className="btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: 13, padding: '12px', gap: 8 }}>
                    {ordering ? '...' : <><ShoppingCart size={16} strokeWidth={2} /> {t('confirm_order', l)}</>}
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
