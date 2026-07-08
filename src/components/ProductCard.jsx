import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEuro, getProductTypeLabel } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { ShoppingCart, Star, Truck } from 'lucide-react';

export default function ProductCard({ product, index = 0 }) {
  const { lang } = useLangStore();
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discountPct = isOnSale ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="card-hover"
      style={{
        background: '#fff', border: '1px solid var(--border)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        borderColor: hovered ? 'var(--border-2)' : 'var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>

      <Link to={`/product/${product.slug || product.id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden' }}>
        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=70'}
          alt={product.name}
          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />

        <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4, flexDirection: 'column' }}>
          {isOnSale && (
            <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', lineHeight: 1.4 }}>
              -{discountPct}%
            </span>
          )}
          {product.status === 'out_of_stock' && (
            <span style={{ background: '#666', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', lineHeight: 1.4 }}>
              {t('out_of_stock', l)}
            </span>
          )}
        </div>
      </Link>

      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 1, letterSpacing: '0.03em' }}>
            {getProductTypeLabel(product.type, l).toUpperCase()}
          </p>
          <h3 style={{
            fontWeight: 600, fontSize: 13, color: 'var(--text)',
            lineHeight: 1.3, marginBottom: 2,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
            {product.brand}{product.model ? ` - ${product.model}` : ''}
          </p>
        </Link>

        <div style={{ marginBottom: 6 }}>
          {isOnSale ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--red)', letterSpacing: '-0.02em' }}>
                {formatEuro(product.salePrice)}
              </span>
              <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-3)', textDecoration: 'line-through' }}>
                {formatEuro(product.price)}
              </span>
            </div>
          ) : (
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {formatEuro(product.price)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-3)', marginBottom: 10, flexWrap: 'nowrap' }}>
          {product.status === 'available' ? (
            <span style={{ color: 'var(--green)', fontWeight: 600, whiteSpace: 'nowrap' }}>● {t('in_stock', l)}</span>
          ) : (
            <span style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>● {t('out_of_stock', l)}</span>
          )}
          <Truck size={11} strokeWidth={1.5} />
          <span style={{ whiteSpace: 'nowrap' }}>24h</span>
          <span style={{ color: 'var(--primary)', marginLeft: 'auto', flexShrink: 0 }}>★★★★</span>
        </div>

        {product.status === 'available' ? (
          <Link to={`/product/${product.slug || product.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'var(--primary)', color: '#fff', border: 'none',
              padding: '9px 0', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              textDecoration: 'none', marginTop: 'auto',
            }}>
            <ShoppingCart size={14} strokeWidth={2} /> {t('order_btn', l)}
          </Link>
        ) : (
          <Link to={`/product/${product.slug || product.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'var(--bg-card2)', color: 'var(--text-2)', border: '1px solid var(--border)',
              padding: '8px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              textDecoration: 'none', marginTop: 'auto',
            }}>
            {t('view_product', l)}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
