import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEuro, getProductTypeLabel, getTypeIcon } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';

export default function ProductCard({ product, index = 0 }) {
  const { lang } = useLangStore();
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  const isOnSale = product.salePrice && product.salePrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="product-card"
      style={{
        background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(46,134,193,0.3)' : 'var(--border)'}`,
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}>

      <Link to={`/product/${product.slug || product.id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden' }}>
        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=70'}
          alt={product.name}
          className="product-img-zoom"
          style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />

        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {isOnSale && (
            <span style={{ background: '#E74C3C', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3 }}>★ Promo</span>
          )}
          {product.status === 'out_of_stock' && (
            <span style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3, backdropFilter: 'blur(4px)' }}>{t('out_of_stock', l)}</span>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 8 }}>
          <Link to={`/product/${product.slug || product.id}`} onClick={e => e.stopPropagation()}
            style={{
              flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: '10px 0', borderRadius: 6, fontSize: 11,
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
            {t('view_product', l)} →
          </Link>
        </div>
      </Link>

      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>{getTypeIcon(product.type)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {getProductTypeLabel(product.type, l)}
          </span>
        </div>

        <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 2, lineHeight: 1.1, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text)'}>
            {product.name}
          </h3>
        </Link>

        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, fontWeight: 500 }}>
          {product.brand}{product.model ? ` · ${product.model}` : ''}
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <div>
            {isOnSale ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 26, color: '#E74C3C', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {formatEuro(product.salePrice)}
                </div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text-3)', textDecoration: 'line-through', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {formatEuro(product.price)}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 26, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {formatEuro(product.price)}
              </div>
            )}
          </div>
          <Link to={`/product/${product.slug || product.id}`}
            className="admin-reserve-btn"
            style={{
              padding: '10px 16px', borderRadius: 6, fontSize: 11, fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              border: 'none', fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s',
              background: 'var(--primary)', color: '#fff',
              textDecoration: 'none', flexShrink: 0,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}>
            {t('order_btn', l)}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
