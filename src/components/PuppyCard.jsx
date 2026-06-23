import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEuro, getAgeString } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';

export default function PuppyCard({ puppy, index = 0 }) {
  const { lang } = useLangStore();
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="puppy-card"
      style={{
        background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(201,118,46,0.3)' : 'var(--border)'}`,
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}>

      <Link to={`/puppy/${puppy.slug || puppy.id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden' }}>
        <img src={puppy.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=70'}
          alt={puppy.name}
          className="puppy-img-zoom"
          style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />

        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 7 }}>
          {puppy.featured && (
            <span style={{ background: '#C9762E', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3 }}>★ Nouveau</span>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 8 }}>
          <Link to={`/puppy/${puppy.slug || puppy.id}`} onClick={e => e.stopPropagation()}
            style={{
              flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: '10px 0', borderRadius: 6, fontSize: 11,
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
            {t('view_puppy', l)} →
          </Link>
        </div>
      </Link>

      <div style={{ padding: '18px 20px 20px' }}>
        <Link to={`/puppy/${puppy.slug || puppy.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 3, lineHeight: 1.1, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text)'}>
            {puppy.name}
          </h3>
        </Link>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, fontWeight: 500 }}>
            {puppy.breed}{puppy.breed === 'Canis Vulgaris' && <span style={{fontSize:10,color:'var(--text-3)',marginLeft:4}}>({t('canis_hint', l)})</span>} · {puppy.sex === 'Male' ? t('male', l) : t('female', l)} · {getAgeString(puppy.birthDate, l)}
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 26, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {formatEuro(puppy.price)}
            </div>
          </div>
          <Link to={`/puppy/${puppy.slug || puppy.id}`}
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
            {t('reserve_btn', l)}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
