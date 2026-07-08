import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { productAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import ProductCard from '../components/ProductCard';

const SERVICES = [
  { icon:'🏗', fr:'Climatiseurs fixes', nl:'Vaste airco\'s', en:'Fixed AC units',
    descFr:'Installation de splits, multisplits et systèmes gainables. Marques premium.', descNl:'Installatie van splits, multisplits en kanaalsystemen. Premium merken.', descEn:'Installation of splits, multisplits and ducted systems. Premium brands.' },
  { icon:'🔄', fr:'Climatiseurs mobiles', nl:'Mobiele airco\'s', en:'Portable AC units',
    descFr:'Solutions nomades monobloc ou split mobile. Sans travaux, livré chez vous.', descNl:'Monoblock of mobiele split oplossingen. Geen werken, bij u geleverd.', descEn:'Monoblock or portable split solutions. No works, delivered to you.' },
  { icon:'💨', fr:'Ventilateurs', nl:'Ventilatoren', en:'Fans',
    descFr:'Ventilateurs sur pied, colonne, mural, plafond, brumisateur. Large choix.', descNl:'Staande-, kolom-, muur-, plafondventilatoren, vernevelaars. Ruime keuze.', descEn:'Pedestal, tower, wall, ceiling fans, misting fans. Wide selection.' },
  { icon:'🔧', fr:'Installation pro', nl:'Professionele installatie', en:'Professional installation',
    descFr:'Pose et mise en service par nos techniciens agréés. Respect des normes.', descNl:'Installatie en inbedrijfstelling door erkende technici. Normconform.', descEn:'Setup and commissioning by certified technicians. Standards compliant.' },
  { icon:'🛡', fr:'SAV & Garantie', nl:'Service & Garantie', en:'After-sales & Warranty',
    descFr:'Service après-vente, entretien annuel et garantie constructeur incluse.', descNl:'After-sales, jaarlijks onderhoud en fabrieksgarantie inbegrepen.', descEn:'After-sales service, annual maintenance and manufacturer warranty included.' },
  { icon:'📦', fr:'Livraison France', nl:'Bezorging Frankrijk', en:'Delivery France',
    descFr:'Livraison rapide et sécurisée dans toute la France.', descNl:'Snelle en veilige levering in heel Frankrijk.', descEn:'Fast and secure delivery throughout France.' },
];

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('ach_cookies'));
  if (!visible) return null;
  const accept  = () => { localStorage.setItem('ach_cookies', '1'); setVisible(false); };
  const decline = () => { localStorage.setItem('ach_cookies', '0'); setVisible(false); };
  const msg = { fr:'Nous utilisons des cookies pour améliorer votre expérience.', nl:'We gebruiken cookies om uw ervaring te verbeteren.', en:'We use cookies to improve your experience.' };
  return (
    <div className="cookie-banner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', flex:1 }}>❄ {msg[lang] || msg.fr}</p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={decline} style={{ padding:'9px 18px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-3)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>{lang==='nl'?'Weigeren':lang==='en'?'Decline':'Refuser'}</button>
        <button onClick={accept} className="btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>{lang==='nl'?'Accepteren':lang==='en'?'Accept':'Accepter'}</button>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackNum, setTrackNum] = useState('');
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const l = lang || 'fr';
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
  const heroY = useTransform(scrollYProgress, [0,1], ['0%','25%']);
  const heroO = useTransform(scrollYProgress, [0,0.7], [1,0]);

  useEffect(() => {
    setLoading(true);
    productAPI.getAll({ featured:'true', limit:8 })
      .then(r => { setFeatured(r.data.products||[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <section ref={heroRef} style={{ position:'relative', height: isMobile ? '100svh' : '100vh', minHeight:580, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <motion.div style={{ position:'absolute', inset:0, y:heroY }}>
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80&auto=format"
            alt="Hero" style={{ width:'100%', height:'110%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.3) 100%)' }} />
        </motion.div>

        <motion.div style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:780, opacity:heroO }}>
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(46,134,193,0.15)', border:'1px solid rgba(46,134,193,0.3)', borderRadius:4, padding:'7px 16px', marginBottom:28 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', display:'inline-block' }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>
                {t('hero_badge', l)}
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.2 }}
            style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(52px,6vw,88px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.0, marginBottom:22 }}>
            AIRCONFORT<br/><span style={{ color:'var(--secondary)' }}>HABITAT</span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.35 }}
            style={{ fontSize: isMobile ? 15 : 18, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:36, maxWidth:520 }}>
            {t('hero_subtitle', l)}
          </motion.p>

          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.5 }}
            style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" className="btn-primary" style={{ fontSize: isMobile ? 13 : 14 }}>
              {t('hero_cta1', l)} →
            </Link>
            <Link to="/catalog" className="btn-ghost" style={{ fontSize: isMobile ? 13 : 14, borderColor:'rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.85)' }}>
              {t('hero_cta2', l)}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8, duration:0.6 }}
          style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', padding: isMobile ? '16px 5%' : '22px 7%', display:'flex', justifyContent:'space-around', gap:16, flexWrap:'wrap' }}>
          {[
            { value:'8+', label:t('hero_stat1', l) },
            { value:'1500+', label:t('hero_stat2', l) },
            { value:'500+', label:t('hero_stat3', l) },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 30, color:'var(--secondary)', lineHeight:1 }}>{value}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color:'rgba(255,255,255,0.45)', marginTop:4, fontWeight:600, letterSpacing:'0.05em' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '20px 5%' : '24px 7%' }}>
        <form onSubmit={handleTrack} style={{ maxWidth:640, margin:'0 auto', display:'flex', gap:10 }}>
          <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
            placeholder={t('track_ph', l)}
            className="input-luxury"
            style={{ flex:1, fontSize: isMobile ? 14 : 15 }} />
          <button type="submit" className="btn-primary" style={{ padding:'13px 20px', fontSize:13, whiteSpace:'nowrap', flexShrink:0 }}>
            {t('track_order', l)}
          </button>
        </form>
      </div>

      <section style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom: isMobile ? 36 : 52 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Nos produits en vedette':l==='nl'?'Onze aanbevolen producten':l==='en'?'Our featured products':'Nos produits en vedette'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1.05, marginBottom:12 }}>
              {l==='fr'?'Sélection\npour votre confort':l==='nl'?'Selectie\nvoor uw comfort':l==='en'?'Selection\nfor your comfort':'Sélection pour votre confort'}
            </h2>
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
              <div style={{ width:48, height:48, border:'3px solid rgba(46,134,193,0.15)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(270px,1fr))', gap: isMobile ? 14 : 22 }}>
              {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('services_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Votre confort, notre métier':l==='nl'?'Uw comfort, ons vak':l==='en'?'Your comfort, our expertise':'Votre confort, notre métier'}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:560, margin:'12px auto 0' }}>{t('services_sub', l)}</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 20 }}>
            {SERVICES.map((s, i) => {
              const title = s[l] || s.fr;
              const desc = s[`desc${l.charAt(0).toUpperCase()+l.slice(1)}`] || s.descFr;
              return (
                <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'28px 24px', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ fontSize:36, marginBottom:14 }}>{s.icon}</div>
                  <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8 }}>{title}</h3>
                  <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65 }}>{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background:'var(--bg)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('reviews_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Ce que disent nos clients':l==='nl'?'Wat onze klanten zeggen':l==='en'?'What our clients say':'Ce que disent nos clients'}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 22 }}>
            {[
              { stars:5, text:{fr:'Installation rapide et professionnelle. Notre climatiseur Daikin fonctionne parfaitement. Température idéale dans toute la maison !',nl:'Snelle en professionele installatie. Onze Daikin airco werkt perfect. Ideale temperatuur in het hele huis!',en:'Fast and professional installation. Our Daikin AC works perfectly. Ideal temperature throughout the house!'}, author:'Sophie M.', city:'Arlon' },
              { stars:5, text:{fr:'Très satisfait du ventilateur Dyson. Silencieux et très efficace. Livraison rapide et soignée. Je recommande vivement.',nl:'Zeer tevreden met de Dyson ventilator. Stil en zeer efficiënt. Snelle en zorgvuldige levering.',en:'Very satisfied with the Dyson fan. Quiet and very effective. Fast and careful delivery.'}, author:'Thomas D.', city:'Luxembourg' },
              { stars:5, text:{fr:'Commande en ligne simple et livraison impeccable. Le climatiseur mobile est parfait pour mon appartement. Rapport qualité-prix excellent.',nl:'Eenvoudig online bestellen en vlekkeloze levering. De mobiele airco is perfect voor mijn appartement.',en:'Easy online ordering and flawless delivery. The portable AC is perfect for my apartment.'}, author:'Maria L.', city:'Namur' },
              { stars:5, text:{fr:'Équipe très compétente pour l\'installation de notre split. Conseils avisés et travail soigné. La clim est silencieuse et rafraîchit parfaitement.',nl:'Zeer deskundig team voor de installatie van onze split. Goed advies en net werk.',en:'Very competent team for our split installation. Good advice and careful work.'}, author:'Pierre H.', city:'Vienne' },
              { stars:5, text:{fr:'Achat d\'un climatiseur mobile en ligne. Suivi de commande parfait, livraison rapide. Produit conforme à la description. Très content.',nl:'Online aankoop van een mobiele airco. Perfecte orderopvolging, snelle levering.',en:'Online purchase of a portable AC. Perfect order tracking, fast delivery.'}, author:'Carine V.', city:'Paris' },
              { stars:5, text:{fr:'Service après-vente au top ! Problème résolu en 24h. Merci à toute l\'équipe pour le professionnalisme et la réactivité.',nl:'Top after-sales service! Probleem opgelost binnen 24u. Dank aan het team voor de professionaliteit.',en:'Top after-sales service! Problem solved within 24h. Thanks to the whole team.'}, author:'Jean-Pierre R.', city:'Mons' },
              { stars:5, text:{fr:'Devis gratuit et installation réalisée en une journée. Techniciens agréables et minutieux. La climatisation est un vrai bonheur en été.',nl:'Gratis offerte en installatie in één dag. Aangename en nauwkeurige technici.',en:'Free quote and installation done in one day. Pleasant and thorough technicians.'}, author:'Anne-Sophie K.', city:'Oupeye' },
              { stars:5, text:{fr:'Ventilateur sur pied commandé en ligne. Prix compétitif, livraison rapide. Parfait pour mes bureaux. Je recommande ce site.',nl:'Staande ventilator online besteld. Scherpe prijs, snelle levering. Perfect voor mijn kantoor.',en:'Pedestal fan ordered online. Competitive price, fast delivery. Perfect for my office.'}, author:'Marc D.', city:'Marche-en-Famenne' },
              { stars:5, text:{fr:'Installation complète d\'une climatisation gainable. Travail de qualité, respect des délais. Maison fraîche et silencieuse. Merci !',nl:'Volledige installatie van een kanaalairco. Kwaliteitswerk, deadlines gerespecteerd. Koel en stil huis.',en:'Complete ducted AC installation. Quality work, deadlines met. Cool and quiet house.'}, author:'Laura B.', city:'Arlon' },
              { stars:4, text:{fr:'Bon contact avec l\'équipe. La livraison a pris un peu de retard mais le produit est de qualité et l\'installation parfaite.',nl:'Goed contact met het team. Levering had wat vertraging maar het product is van goede kwaliteit.',en:'Good contact with the team. Delivery was slightly delayed but the product quality is great.'}, author:'Nathalie F.', city:'Vienne' },
              { stars:4, text:{fr:'Climatiseur mobile conforme aux photos. Prix correct. Juste un souci sur la notice en néerlandais uniquement. Sinon tout bien.',nl:'Mobiele airco zoals op foto\'s. Goede prijs. Alleen handleiding was enkel Nederlands.',en:'Portable AC matches photos. Good price. Only issue was manual was Dutch only.'}, author:'Jonathan W.', city:'Paris' },
              { stars:4, text:{fr:'Achat ventilateur brumisateur pour ma terrasse. Très efficace par forte chaleur. Légers délais de livraison mais satisfaite.',nl:'Mistventilator gekocht voor mijn terras. Zeer effectief bij hitte. Kleine leveringsvertraging maar tevreden.',en:'Bought a misting fan for my terrace. Very effective in heat. Slight delivery delay but satisfied.'}, author:'Valérie M.', city:'Virton' },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'28px 24px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {Array.from({length:5}).map((_,j)=><span key={j} style={{ color:j<r.stars?'var(--secondary)':'var(--border-2)', fontSize:18 }}>★ </span>)}
                </div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7, marginBottom:16 }}>"{r.text[l] || r.text.fr}"</p>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{r.author}</p>
                <p style={{ fontSize:11, color:'var(--text-3)' }}>{r.city}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CookieBanner lang={l} />
    </div>
  );
}
