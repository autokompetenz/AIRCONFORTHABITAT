import { useState, useEffect } from 'react';
import { useBreakpoint } from '../hooks';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI, orderAPI } from '../services/api';
import { useToastStore, useLangStore, useThemeStore } from '../store';
import { formatEuro, getProductTypeLabel } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';

export default function ProductDetails() {
  const { slug } = useParams();
  const id = slug;
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  const C = {
    bg:      isDark ? '#0a0a0a'               : 'var(--bg)',
    card:    isDark ? '#141414'               : 'var(--bg-card)',
    card2:   isDark ? '#1a1a1a'               : 'var(--bg-card2)',
    border:  isDark ? 'rgba(255,255,255,0.08)': 'var(--border)',
    text:    isDark ? '#ffffff'               : 'var(--text)',
    text2:   isDark ? 'rgba(255,255,255,0.65)': 'var(--text-2)',
    text3:   isDark ? 'rgba(255,255,255,0.35)': 'var(--text-3)',
    primary: 'var(--primary)',
    shadow:  isDark ? '0 4px 24px rgba(0,0,0,0.4)' : 'var(--shadow-sm)',
  };

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then(r => { setProduct(r.data.product); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/catalog'); });
  }, [id]);

  if (loading) return (
    <div style={{ paddingTop: 100, background: C.bg, minHeight: '100vh' }}>
      <Loader text="Chargement..." />
    </div>
  );
  if (!product) return null;

  const images = [product.imageUrl, product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5].filter(Boolean);
  const inStock = product.status === 'available';
  const typeLabel = getProductTypeLabel(product.type, l);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: 76 }}>
      <div style={{ padding: '18px 6%', borderBottom: `1px solid ${C.border}`, background: C.card2 }}>
        <p style={{ fontSize: 13, color: C.text3 }}>
          <Link to="/" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--primary)'}
            onMouseOut={e => e.target.style.color = C.text3}>
            {l==='fr'?'Accueil':l==='nl'?'Home':l==='en'?'Home':'Accueil'}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>▸</span>
          <Link to="/catalog" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--primary)'}
            onMouseOut={e => e.target.style.color = C.text3}>
            {l==='fr'?'Catalogue':l==='nl'?'Catalogus':l==='en'?'Catalog':'Catalogue'}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>▸</span>
          <span style={{ color: C.text2 }}>{product.name}</span>
        </p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64 }}>
          <div>
            <motion.div key={activeImg} initial={{ opacity: 0.7, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '4/3', background: C.card, boxShadow: C.shadow }}>
              <img src={images[activeImg] || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80'}
                alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </motion.div>
            {images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)', gap: 10, marginTop: 16 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', border: `2.5px solid ${activeImg === i ? 'var(--primary)' : C.border}`, opacity: activeImg === i ? 1 : 0.6, cursor: 'pointer', transition: 'all 0.25s ease', padding: 0, background: C.card, transform: activeImg === i ? 'scale(1.02)' : 'scale(1)' }}
                    onMouseOver={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.borderColor='rgba(46,134,193,0.4)'; }}}
                    onMouseOut={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.6'; e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor=C.border; }}}>
                    <img src={img} alt={`Vue ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                {typeLabel}
                {product.brand && <span style={{fontSize:10,fontWeight:600,color:C.text3,marginLeft:8,letterSpacing:'0.1em'}}>{product.brand}</span>}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 36 : 52, color: C.text, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
              {product.name}
            </h1>
            {product.model && (
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 20 }}>
                {l==='fr'?'Modèle':l==='nl'?'Model':l==='en'?'Model':'Modèle'} : {product.model}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
              {product.salePrice ? (
                <>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 40, color: '#DC2626', letterSpacing: '-0.02em' }}>
                    {formatEuro(product.salePrice)}
                  </span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, color: C.text3, textDecoration: 'line-through', letterSpacing: '-0.02em' }}>
                    {formatEuro(product.price)}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#DC2626', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
                    SALE
                  </span>
                </>
              ) : product.price ? (
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 40, color: C.text, letterSpacing: '-0.02em' }}>
                  {formatEuro(product.price)}
                </span>
              ) : null}
            </div>

            <div style={{ marginBottom: 24 }}>
              {inStock ? (
                <span className="badge badge-available" style={{ background:'rgba(16,185,129,0.12)', color:'#059669', border:'1px solid rgba(16,185,129,0.25)', display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:'9999px', fontSize:12, fontWeight:800 }}>
                  ● {t('in_stock', l)}
                </span>
              ) : (
                <span className="badge badge-out-of-stock" style={{ background:'rgba(239,68,68,0.12)', color:'#DC2626', border:'1px solid rgba(239,68,68,0.25)', display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:'9999px', fontSize:12, fontWeight:800 }}>
                  ● {t('out_of_stock', l)}
                </span>
              )}
            </div>

            {product.description && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: isMobile ? 20 : 24, color: C.text, letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.2 }}>
                  {t('about_product', l)}
                </h3>
                <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.75, borderLeft: '3px solid rgba(46,134,193,0.4)', paddingLeft: 18 }}>
                  {product.description}
                </p>
              </div>
            )}

            {product.technicalDescription && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: isMobile ? 18 : 22, color: C.text, letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.2 }}>
                  {t('technical_desc', l)}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.technicalDescription.split('•').filter(Boolean).map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                      background: 'rgba(46,134,193,0.08)',
                      border: '1px solid rgba(46,134,193,0.2)',
                      padding: '6px 14px', borderRadius: 9999,
                    }}>
                      {item.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {inStock ? (
              <button onClick={() => setShowOrder(!showOrder)}
                style={{
                  width: '100%', padding: isMobile ? '18px' : '20px', borderRadius: 12,
                  fontFamily: "'Outfit',sans-serif", fontSize: isMobile?14:15, fontWeight:800,
                  letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
                  color: '#fff', boxShadow: '0 4px 16px rgba(46,134,193,0.3)',
                }}
                onMouseOver={e => { e.currentTarget.style.background='linear-gradient(135deg,var(--primary-dark),#1A5A82)'; e.currentTarget.style.transform='scale(1.02)'; }}
                onMouseOut={e => { e.currentTarget.style.background='linear-gradient(135deg,var(--primary),var(--primary-dark))'; e.currentTarget.style.transform='scale(1)'; }}>
                ❄ {t('order_btn', l)}
              </button>
            ) : null}

            {showOrder && inStock && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 6 }}>
                  {t('order_form', l)}
                </h3>
                <p style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>
                  {t('order_form_sub', l)}
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    setOrdering(true);
                    const data = Object.fromEntries(fd);
                    const res = await orderAPI.create({
                      productId: product.id,
                      quantity: parseInt(data.quantity) || 1,
                      guestName: data.name,
                      guestEmail: data.email,
                      guestPhone: data.phone,
                      address: data.address,
                      deliveryMethod: data.deliveryMethod,
                      notes: data.notes,
                    });
                    addToast(t('order_confirm', l), 'success');
                    navigate(`/track/${res.data.orderNumber}`);
                  } catch (err) {
                    addToast(err.response?.data?.error || 'Erreur', 'error');
                  } finally { setOrdering(false); }
                }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display:'flex', gap:12 }}>
                    <input name="name" required placeholder={t('name_label', l)} className="input-luxury" style={{ flex:1 }} />
                    <input name="quantity" type="number" defaultValue={1} min={1} style={{ width:80, textAlign:'center' }} className="input-luxury" />
                  </div>
                  <input name="email" type="email" required placeholder={t('email_label', l)} className="input-luxury" />
                  <input name="phone" type="tel" required placeholder={t('phone_label', l)} className="input-luxury" />
                  <input name="address" placeholder={t('address_ph', l)} className="input-luxury" />

                  <div style={{ display:'flex', gap:12 }}>
                    <label style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:10, background:C.card2, border:'1px solid var(--border)', cursor:'pointer' }}>
                      <input type="radio" name="deliveryMethod" value="delivery" defaultChecked style={{ accentColor:'var(--primary)', width:18, height:18 }} />
                      <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{t('delivery_delivery', l)}</span>
                    </label>
                    <label style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:10, background:C.card2, border:'1px solid var(--border)', cursor:'pointer' }}>
                      <input type="radio" name="deliveryMethod" value="pickup" style={{ accentColor:'var(--primary)', width:18, height:18 }} />
                      <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{t('delivery_pickup', l)}</span>
                    </label>
                  </div>

                  <textarea name="notes" rows={3} placeholder={t('notes_ph', l)} className="input-luxury" />
                  <button type="submit" disabled={ordering} className="btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>
                    {ordering ? '⏳...' : `❄ ${t('confirm_order', l)}`}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
