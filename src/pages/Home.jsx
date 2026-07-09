import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import ProductCard from '../components/ProductCard';
import { Snowflake, Wind, Wrench, Shield, Truck, Star, PackageOpen } from 'lucide-react';

const SERVICES = [
  { fr:'Climatiseurs fixes', nl:'Vaste airco\'s', en:'Fixed AC units',
    descFr:'Installation de splits, multisplits et gainables. Marques premium Daikin, Mitsubishi, Hitachi.',
    descNl:'Installatie van splits, multisplits en kanaalsystemen. Premium merken. Daikin, Mitsubishi, Hitachi.',
    descEn:'Installation of splits, multisplits and ducted systems. Premium brands Daikin, Mitsubishi, Hitachi.',
    icon: Snowflake },
  { fr:'Climatiseurs mobiles', nl:'Mobiele airco\'s', en:'Portable ACs',
    descFr:'Solutions nomades monobloc ou split mobile. Sans travaux, livré chez vous en 24h.',
    descNl:'Monoblock of mobiele split oplossingen. Geen werken, bij u geleverd binnen 24u.',
    descEn:'Monoblock or portable split solutions. No works needed, delivered to you in 24h.',
    icon: Wind },
  { fr:'Ventilateurs', nl:'Ventilatoren', en:'Fans',
    descFr:'Ventilateurs sur pied, colonne, mural, plafond, brumisateur. Large choix, livraison rapide.',
    descNl:'Staande-, kolom-, muur-, plafondventilatoren, vernevelaars. Ruime keuze, snelle levering.',
    descEn:'Pedestal, tower, wall, ceiling fans, misting fans. Wide selection, fast delivery.',
    icon: Wind },
  { fr:'Installation pro', nl:'Professionele installatie', en:'Professional installation',
    descFr:'Pose et mise en service par nos techniciens certifiés RGE QualiPAC. Respect des normes.',
    descNl:'Installatie en inbedrijfstelling door gecertificeerde RGE QualiPAC technici. Normconform.',
    descEn:'Setup and commissioning by certified RGE QualiPAC technicians. Standards compliant.',
    icon: Wrench },
  { fr:'SAV & Garantie', nl:'Service & Garantie', en:'After-sales & Warranty',
    descFr:'Service après-vente, entretien annuel et garantie constructeur incluse sur tous nos produits.',
    descNl:'After-sales, jaarlijks onderhoud en fabrieksgarantie inbegrepen bij al onze producten.',
    descEn:'After-sales service, annual maintenance and manufacturer warranty included on all products.',
    icon: Shield },
  { fr:'Livraison France', nl:'Bezorging Frankrijk', en:'Delivery France',
    descFr:'Livraison rapide et sécurisée dans toute la France. Expédition sous 24h pour les produits en stock.',
    descNl:'Snelle en veilige levering in heel Frankrijk. Verzending binnen 24u voor producten op voorraad.',
    descEn:'Fast and secure delivery throughout France. Shipping within 24h for in-stock products.',
    icon: Truck },
];

const REVIEWS = [
  { stars:5, text:{fr:'Installation rapide et professionnelle. Notre climatiseur Daikin fonctionne parfaitement.', nl:'Snelle en professionele installatie. Onze Daikin airco werkt perfect.', en:'Fast and professional installation. Our Daikin AC works perfectly.'}, author:'Sophie M.', city:'Arlon' },
  { stars:5, text:{fr:'Très satisfait du ventilateur. Silencieux, efficace, livraison rapide. Je recommande.', nl:'Zeer tevreden met de ventilator. Stil, efficiënt, snelle levering.', en:'Very satisfied with the fan. Quiet, effective, fast delivery.'}, author:'Thomas D.', city:'Luxembourg' },
  { stars:4, text:{fr:'Bon contact avec l\'équipe. Produit de qualité, installation parfaite. Légers délais.', nl:'Goed contact met het team. Kwaliteitsproduct, perfecte installatie.', en:'Good contact with the team. Quality product, perfect installation.'}, author:'Nathalie F.', city:'Vienne' },
];

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('ach_cookies'));
  if (!visible) return null;
  const accept = () => { localStorage.setItem('ach_cookies', '1'); setVisible(false); };
  const decline = () => { localStorage.setItem('ach_cookies', '0'); setVisible(false); };
  return (
    <div className="cookie-banner">
      <p>{lang === 'fr' ? 'Nous utilisons des cookies pour améliorer votre expérience.' : lang === 'nl' ? 'We gebruiken cookies om uw ervaring te verbeteren.' : 'We use cookies to improve your experience.'}</p>
      <div className="actions">
        <button onClick={decline} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 14px', minHeight: 32 }}>
          {lang === 'nl' ? 'Weigeren' : lang === 'en' ? 'Decline' : 'Refuser'}
        </button>
        <button onClick={accept} className="btn-primary" style={{ fontSize: '0.75rem', padding: '6px 14px', minHeight: 32 }}>
          {lang === 'nl' ? 'Accepteren' : lang === 'en' ? 'Accept' : 'Accepter'}
        </button>
      </div>
    </div>
  );
}

function StarRating({ count }) {
  return (
    <div style={{ display: 'flex', gap: 1, marginBottom: 8 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < count ? 'var(--primary)' : '#ddd'} color={i < count ? 'var(--primary)' : '#ddd'} strokeWidth={0} />
      ))}
    </div>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackNum, setTrackNum] = useState('');
  const navigate = useNavigate();
  const l = lang || 'fr';

  useEffect(() => {
    setLoading(true);
    productAPI.getAll({ featured: 'true', limit: 6 })
      .then(r => { setFeatured(r.data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          background: '#1A1A1A', color: '#fff',
          padding: isMobile ? '50px 4% 40px' : '80px 5% 60px',
          overflow: 'hidden',
        }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url(https://images.pexels.com/photos/24828656/pexels-photo-24828656.jpeg?w=1400&q=80) center/cover no-repeat',
          opacity: 0.15,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1A1A1A 40%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ maxWidth: 560 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div style={{
                display: 'inline-block',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                marginBottom: 14,
              }}>
                Artisan RGE QualiPAC · Vienne (38)
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                fontSize: isMobile ? 28 : 40, fontWeight: 900,
                marginBottom: 14, lineHeight: 1.1, letterSpacing: '-0.02em',
              }}
            >
              {l === 'fr' ? 'Climatisation & confort' : l === 'nl' ? 'Airconditioning & comfort' : 'Air conditioning & comfort'}
              <br />
              <span style={{ color: 'var(--primary)' }}>
                {l === 'fr' ? 'directement chez vous' : l === 'nl' ? 'direct bij u thuis' : 'directly at your home'}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ fontSize: 14, color: '#999', lineHeight: 1.7, marginBottom: 24 }}
            >
              {t('hero_subtitle', l)}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
            >
              <Link to="/catalog" className="btn-primary" style={{ fontSize: 13, padding: '11px 28px' }}>
                {t('hero_cta1', l)}
              </Link>
              <Link to="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#ccc', textDecoration: 'none',
                padding: '11px 20px', border: '1px solid #333',
              }}>
                {t('nav_company', l)} →
              </Link>
            </motion.div>
          </div>
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{
                display: 'flex', gap: 32, marginTop: 48,
                borderTop: '1px solid #2A2A2A', paddingTop: 28,
              }}
            >
              {[
                { num: '8', suffix: '+', label: t('hero_stat1', l) },
                { num: '1500', suffix: '+', label: t('hero_stat2', l) },
                { num: '500', suffix: '+', label: t('hero_stat3', l) },
              ].map(({ num, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{num}{suffix}</div>
                  <div style={{ fontSize: 11, color: '#777', marginTop: 4, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
        </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5', padding: isMobile ? '12px 4%' : '12px 5%' }}
      >
        <form onSubmit={handleTrack} style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 6 }}>
          <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
            placeholder={t('track_ph', l)}
            style={{
              flex: '1 1 auto', minWidth: 0, width: '100%',
              border: '1px solid #E5E5E5', padding: '8px 12px',
              fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif', outline: 'none',
            }} />
          <button type="submit" className="btn-primary" style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: 12, padding: '8px 14px', minHeight: 36 }}>
            {t('track_order', l)}
          </button>
        </form>
      </motion.div>

      {loading ? (
        <section style={{ padding: isMobile ? '32px 4%' : '40px 5%', textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #E5E5E5', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </section>
      ) : featured.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ padding: isMobile ? '32px 4%' : '40px 5%', borderBottom: '1px solid #E5E5E5' }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.35 }}
            style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#1A1A1A' }}
          >
            {l === 'fr' ? 'Sélection pour votre confort' : l === 'nl' ? 'Selectie voor uw comfort' : 'Selection for your comfort'}
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.35 }}
            style={{ textAlign: 'center', marginTop: 24 }}
          >
            <Link to="/catalog" className="btn-primary" style={{ fontSize: 12, padding: '10px 28px' }}>
              {l === 'fr' ? 'Voir tous les produits' : l === 'nl' ? 'Bekijk alle producten' : 'See all products'} →
            </Link>
          </motion.div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ padding: '40px 5%', borderBottom: '1px solid #E5E5E5' }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#1A1A1A' }}
        >
          {l === 'fr' ? 'Nos services' : l === 'nl' ? 'Onze diensten' : 'Our services'}
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const title = s[l] || s.fr;
            const desc = s[`desc${l.charAt(0).toUpperCase() + l.slice(1)}`] || s.descFr;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                className="card-hover"
                style={{ border: '1px solid #E5E5E5', padding: '16px', background: '#fff' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Icon size={18} color="var(--primary)" strokeWidth={1.8} />
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{title}</h3>
                </div>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{desc}</p>
              </motion.div>
            );
          })}
        </div>
        </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ padding: isMobile ? '32px 4%' : '40px 5%' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            {l === 'fr' ? 'Avis clients' : l === 'nl' ? 'Klantbeoordelingen' : 'Client reviews'}
          </h2>
          <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>★★★★★ 4.8/5</span>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
              className="card-hover"
              style={{ border: '1px solid #E5E5E5', padding: '16px', background: '#fff' }}
            >
              <StarRating count={r.stars} />
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 10 }}>"{r.text[l] || r.text.fr}"</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>{r.author}</p>
              <p style={{ fontSize: 11, color: '#999' }}>{r.city}</p>
            </motion.div>
          ))}
        </div>
        </motion.section>

      <CookieBanner lang={l} />
    </div>
  );
}
