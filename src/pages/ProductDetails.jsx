import { useState, useEffect } from 'react';
import { useBreakpoint } from '../hooks';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro, getProductTypeLabel } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';
import { ProductSchema } from '../components/SchemaOrg';
import { Shield, Truck, ShoppingCart, ChevronDown, Star } from 'lucide-react';

export default function ProductDetails() {
  const { slug } = useParams();
  const id = slug;
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [openSections, setOpenSections] = useState({ description: false, technical: false });
  const { addItem, openCart } = useCartStore();

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const { isMobile } = useBreakpoint();
  const l = lang || 'fr';

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then(r => { setProduct(r.data.product); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/catalog'); });
  }, [id]);

  if (loading) return (
    <div style={{ paddingTop: 80, background: '#fff', minHeight: '100vh' }}>
      <Loader text="Chargement..." />
    </div>
  );
  if (!product) return null;

  const images = [product.imageUrl, product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5].filter(Boolean);
  const inStock = product.status === 'available';
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discountPct = isOnSale ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <>
      <ProductSchema product={product} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', background: '#fff' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: isMobile ? '12px 4%' : '12px 5%', borderBottom: '1px solid var(--border)', background: '#F5F5F5' }}
        >
          <p style={{ fontSize: 12, color: '#999' }}>
            <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>{l === 'fr' ? 'Accueil' : l === 'nl' ? 'Home' : 'Home'}</Link>
            <span style={{ margin: '0 8px', color: '#ccc' }}>›</span>
            <Link to="/catalog" style={{ color: '#999', textDecoration: 'none' }}>{l === 'fr' ? 'Catalogue' : l === 'nl' ? 'Catalogus' : 'Catalog'}</Link>
            <span style={{ margin: '0 8px', color: '#ccc' }}>›</span>
            <span style={{ color: '#666' }}>{product.name}</span>
          </p>
        </motion.div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 4%' : '40px 5%' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 48 }}
          >
            <div>
              <div style={{ border: '1px solid var(--border)', overflow: 'hidden', aspectRatio: '4/3', background: '#F5F5F5', position: 'relative' }}>
                <img src={images[activeImg] || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80'}
                  alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {isOnSale && (
                  <span style={{ position: 'absolute', top: 8, left: 8, background: '#CC0000', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px' }}>
                    -{discountPct}%
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`, gap: 8, marginTop: 10 }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{
                        aspectRatio: '4/3', border: `2px solid ${activeImg === i ? 'var(--primary)' : '#E5E5E5'}`,
                        opacity: activeImg === i ? 1 : 0.6, cursor: 'pointer', padding: 0, background: '#F5F5F5', overflow: 'hidden',
                      }}>
                      <img src={img} alt={`Vue ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4 }}>
                {getProductTypeLabel(product.type, l).toUpperCase()}
              </p>
              <h1 style={{ fontWeight: 800, fontSize: isMobile ? 22 : 28, color: '#1A1A1A', marginBottom: 4 }}>
                {product.name}
              </h1>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
                {product.brand}{product.model ? ` · ${product.model}` : ''}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                {isOnSale ? (
                  <>
                    <span style={{ fontWeight: 900, fontSize: 28, color: '#CC0000', letterSpacing: '-0.02em' }}>
                      {formatEuro(product.salePrice)}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 16, color: '#999', textDecoration: 'line-through' }}>
                      {formatEuro(product.price)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#CC0000', padding: '2px 8px' }}>
                      -{discountPct}%
                    </span>
                  </>
                ) : product.price ? (
                  <span style={{ fontWeight: 900, fontSize: 28, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
                    {formatEuro(product.price)}
                  </span>
                ) : null}
              </div>

              <div style={{ marginBottom: 16 }}>
                {inStock ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>
                    ● {t('in_stock', l)}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#999' }}>
                    ● {t('out_of_stock', l)}
                  </span>
                )}
              </div>

              {/* Accordion Description */}
              {product.description && (
                <div style={{ marginBottom: 8, border: '1px solid var(--border)' }}>
                  <button onClick={() => toggleSection('description')} style={{
                    width: '100%', background: '#F5F5F5', border: 'none', cursor: 'pointer',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', textAlign: 'left',
                  }}>
                    <span>{t('about_product', l)}</span>
                    <ChevronDown size={16} color="#999" style={{ transform: openSections.description ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {openSections.description && (
                    <div style={{ padding: '12px 16px', fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion Technical */}
              {product.technicalDescription && (
                <div style={{ marginBottom: 16, border: '1px solid var(--border)' }}>
                  <button onClick={() => toggleSection('technical')} style={{
                    width: '100%', background: '#F5F5F5', border: 'none', cursor: 'pointer',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', textAlign: 'left',
                  }}>
                    <span>{t('technical_desc', l)}</span>
                    <ChevronDown size={16} color="#999" style={{ transform: openSections.technical ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {openSections.technical && (
                    <div style={{ padding: '12px 16px' }}>
                      {product.technicalDescription.split('•').filter(Boolean).map((item, idx) => (
                        <p key={idx} style={{ fontSize: 12, color: '#666', padding: '4px 0', borderBottom: '1px solid #E5E5E5' }}>
                          • {item.trim()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {product.warranty && (
                  <div style={{ border: '1px solid var(--border)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={18} color="var(--primary)" strokeWidth={1.5} />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: 1 }}>{t('warranty_label', l)}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{product.warranty}</p>
                    </div>
                  </div>
                )}
                <div style={{ border: '1px solid var(--border)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Truck size={18} color="var(--primary)" strokeWidth={1.5} />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: 1 }}>{l === 'fr' ? 'Livraison' : l === 'nl' ? 'Levering' : 'Delivery'}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{l === 'fr' ? 'En 24h' : l === 'nl' ? 'Binnen 24u' : 'In 24h'}</p>
                  </div>
                </div>
              </div>

              {inStock && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))}
                      style={{ width: 40, height: 42, border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>−</button>
                    <span style={{ minWidth: 36, textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)}
                      style={{ width: 40, height: 42, border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>+</button>
                  </div>
                  <button onClick={() => { addItem(product, qty); setQty(1); addToast(t('added_to_cart', l), 'success'); openCart(); }}
                    className="btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, padding: '11px 20px' }}>
                    <ShoppingCart size={16} strokeWidth={2} />
                    {t('add_to_cart', l)}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
