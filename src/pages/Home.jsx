import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { puppyAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import PuppyCard from '../components/PuppyCard';

const SERVICES = [
  { icon:'🐶', fr:'Chiots de race', nl:'Rashonden', en:'Purebred puppies',
    descFr:'Pedigree LOSH, parents sélectionnés, santé garantie.', descNl:'Stamboom LOSH, geselecteerde ouders, gezondheid gegarandeerd.', descEn:'LOSH Pedigree, selected parents, guaranteed health.' },
  { icon:'📋', fr:'Vaccins & Puce', nl:'Vaccins & Chip', en:'Vaccines & Microchip',
    descFr:'Vaccins à jour, puce électronique, vermifuge, carnet de santé.', descNl:'Vaccinaties up-to-date, microchip, ontworming, gezondheidsboekje.', descEn:'Up-to-date vaccines, microchip, deworming, health record.' },
  { icon:'🐶', fr:'Réservation simple', nl:'Eenvoudig reserveren', en:'Easy reservation',
    descFr:'Acompte de 30%, solde à la remise. Pas de compte nécessaire.', descNl:'30% aanbetaling, saldo bij levering. Geen account nodig.', descEn:'30% deposit, balance on delivery. No account needed.' },
  { icon:'💉', fr:'Suivi en ligne', nl:'Online volgen', en:'Online tracking',
    descFr:'Suivez votre réservation en temps réel avec votre numéro unique.', descNl:'Volg uw reservering in realtime met uw unieke nummer.', descEn:'Track your reservation in real time with your unique number.' },
  { icon:'💶', fr:'Garantie santé', nl:'Gezondheidsgarantie', en:'Health guarantee',
    descFr:'Tous nos chiots partent avec un certificat de bonne santé vétérinaire.', descNl:'Al onze puppy’s krijgen een veterinair gezondheidscertificaat.', descEn:'All our puppies come with a veterinary health certificate.' },
  { icon:'📦', fr:'Livraison possible', nl:'Bezorging mogelijk', en:'Delivery possible',
    descFr:'Livraison sécurisée en Belgique et pays limitrophes.', descNl:'Veilige levering in België en buurlanden.', descEn:'Secure delivery in Belgium and neighboring countries.' },
];

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('sp_cookies'));
  if (!visible) return null;
  const accept  = () => { localStorage.setItem('sp_cookies', '1'); setVisible(false); };
  const decline = () => { localStorage.setItem('sp_cookies', '0'); setVisible(false); };
  const msg = { fr:'Nous utilisons des cookies pour améliorer votre expérience.', nl:'We gebruiken cookies om uw ervaring te verbeteren.', en:'We use cookies to improve your experience.' };
  return (
    <div className="cookie-banner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', flex:1 }}>🐶 {msg[lang] || msg.fr}</p>
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
    puppyAPI.getAll({ featured:'true', limit:8 })
      .then(r => { setFeatured(r.data.puppies||[]); setLoading(false); })
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
          <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1800&q=80&auto=format"
            alt="Hero" style={{ width:'100%', height:'110%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.3) 100%)' }} />
        </motion.div>

        <motion.div style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:780, opacity:heroO }}>
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(201,118,46,0.15)', border:'1px solid rgba(201,118,46,0.3)', borderRadius:4, padding:'7px 16px', marginBottom:28 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#C9762E', display:'inline-block' }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>
                {t('hero_badge', l)}
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.2 }}
            style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(52px,6vw,88px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.0, marginBottom:22 }}>
            ANIMAL<br/><span style={{ color:'#C9762E' }}>CONCEPT SRL</span>
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
            { value:'4.9 ★', label:t('hero_stat2', l) },
            { value:'150+', label:t('hero_stat3', l) },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 30, color:'#C9762E', lineHeight:1 }}>{value}</div>
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

      {/* Featured puppies */}
      <section style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom: isMobile ? 36 : 52 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Nos chiots disponibles':l==='nl'?'Onze beschikbare puppy’s':l==='en'?'Our available puppies':'Nos chiots disponibles'}
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1.05, marginBottom:12 }}>
              {l==='fr'?'Disponibles\nà la réservation':l==='nl'?'Beschikbaar\nvoor reservering':l==='en'?'Available\nfor reservation':'Disponibles à la réservation'}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(270px,1fr))', gap: isMobile ? 14 : 22 }}>
            {featured.map((p, i) => <PuppyCard key={p.id} puppy={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('services_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Une adoption en toute confiance':l==='nl'?'Een adoptie met vertrouwen':l==='en'?'Adoption with confidence':'Une adoption en toute confiance'}
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

      {/* Reviews */}
      <section style={{ background:'var(--bg)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('reviews_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
              {l==='fr'?'Ce que disent nos familles':l==='nl'?'Wat onze families zeggen':l==='en'?'What our families say':'Ce que disent nos familles'}
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 22 }}>
            {[
              { stars:5, text:{fr:'Un accueil chaleureux et professionnel. Notre petit Luna est en pleine forme !',nl:'Een warm en professioneel onthaal. Onze kleine Luna is in topvorm!',en:'A warm and professional welcome. Our little Luna is in great shape!'}, author:'Sophie M.', city:'Arlon' },
              { stars:5, text:{fr:'Éleveur sérieux, chiots en parfaite santé. Les conseils étaient très utiles. Je recommande.',nl:'Serieuze fokker, puppy\'s in perfecte gezondheid. Het advies was erg nuttig.',en:'Serious breeder, puppies in perfect health. The advice was very useful.'}, author:'Thomas D.', city:'Luxembourg' },
              { stars:5, text:{fr:'Réservation facile et livraison impeccable. Notre Bella est arrivée en pleine forme, bien installée dans sa caisse.',nl:'Eenvoudig reserveren en een vlekkeloze levering. Onze Bella arriveerde in topvorm.',en:'Easy reservation and flawless delivery. Our Bella arrived in great shape.'}, author:'Maria L.', city:'Namur' },
              { stars:5, text:{fr:'Tout s\'est déroulé comme convenu. Le suivi avant la livraison était très rassurant. Notre petit Max s\'est adapté immédiatement.',nl:'Alles verliep zoals afgesproken. De opvolging voor de levering was geruststellend.',en:'Everything went as agreed. The follow-up before delivery was very reassuring.'}, author:'Pierre H.', city:'Liège' },
              { stars:5, text:{fr:'Nous avons réservé à distance sans aucun souci. Les photos et vidéos nous ont permis de choisir en toute confiance.',nl:'We hebben op afstand gereserveerd zonder problemen. De foto\'s en video\'s gaven ons vertrouwen.',en:'We reserved remotely without any issue. The photos and videos let us choose confidently.'}, author:'Carine V.', city:'Bruxelles' },
              { stars:5, text:{fr:'Service de livraison au top ! Notre chiot est arrivé en parfaite santé avec tous ses documents. Merci infiniment.',nl:'Top leveringsservice! Onze puppy arriveerde in perfecte gezondheid met alle documenten.',en:'Top delivery service! Our puppy arrived in perfect health with all documents.'}, author:'Jean-Pierre R.', city:'Mons' },
              { stars:5, text:{fr:'Un grand merci pour votre professionnalisme. La réservation en ligne était simple et la communication claire tout au long du processus.',nl:'Hartelijk dank voor uw professionaliteit. De online reservering was eenvoudig en de communicatie duidelijk.',en:'Thank you for your professionalism. The online reservation was simple and communication was clear.'}, author:'Anne-Sophie K.', city:'Oupeye' },
              { stars:5, text:{fr:'Notre petite Nala est un amour. Tout était prêt pour son arrivée grâce aux conseils reçus. Livraison parfaite.',nl:'Onze kleine Nala is een schat. Alles was klaar voor haar komst dankzij het advies.',en:'Our little Nala is a sweetheart. Everything was ready for her arrival thanks to the advice.'}, author:'Marc D.', city:'Marche-en-Famenne' },
              { stars:5, text:{fr:'Très satisfaits de notre expérience. Le prix était clair, sans surprise. Notre chiot était exactement comme décrit sur le site.',nl:'Zeer tevreden met onze ervaring. De prijs was duidelijk, zonder verrassingen.',en:'Very satisfied with our experience. The price was clear, no surprises.'}, author:'Laura B.', city:'Arlon' },
              { stars:5, text:{fr:'La livraison a été organisée rapidement après la réservation. Notre petit compagnon est en pleine santé et déjà très attaché.',nl:'De levering werd snel georganiseerd na de reservering. Onze kleine metgezel is kerngezond.',en:'Delivery was organized quickly after reservation. Our little companion is very healthy.'}, author:'Cédric T.', city:'Libramont' },
              { stars:4, text:{fr:'Très bon contact avec l\'éleveur. La livraison a pris un peu de retard mais le chiot était en pleine forme. Satisfaits.',nl:'Goed contact met de fokker. De levering had wat vertraging maar de puppy was in topvorm.',en:'Good contact with the breeder. Delivery was slightly delayed but the puppy was healthy.'}, author:'Nathalie F.', city:'Liège' },
              { stars:4, text:{fr:'Réservation facile et rapide. Juste un petit souci de communication sur la date de livraison mais tout s\'est bien arrangé.',nl:'Eenvoudig en snel reserveren. Een klein communicatieprobleem over de leveringsdatum maar alles kwam goed.',en:'Easy and quick reservation. A small communication issue about delivery date but it was resolved.'}, author:'Jonathan W.', city:'Bruxelles' },
              { stars:4, text:{fr:'Chiot conforme aux photos et à la description. Je retire une étoile car le transport était un peu stressant pour lui.',nl:'Puppy zoals op de foto\'s en beschrijving. Ik trek een ster af omdat het transport stressvol was.',en:'Puppy matches photos and description. I deduct one star because transport was a bit stressful.'}, author:'Sébastien G.', city:'Namur' },
              { stars:4, text:{fr:'Bonne expérience globale. La réservation s\'est bien passée et le chiot est magnifique. Quelques jours d\'adaptation nécessaires.',nl:'Goede algemene ervaring. De reservering verliep goed en de puppy is prachtig.',en:'Good overall experience. Reservation went well and the puppy is beautiful. A few days of adjustment needed.'}, author:'Valérie M.', city:'Virton' },
              { stars:4, text:{fr:'Contact agréable et chiot en bonne santé. Le suivi post-livraison était un peu limité mais le nécessaire était fait.',nl:'Aangenaam contact en een gezonde puppy. De nazorg was beperkt maar noodzakelijk.',en:'Pleasant contact and healthy puppy. Post-delivery follow-up was limited but adequate.'}, author:'Damien P.', city:'Neufchâteau' },
              { stars:4, text:{fr:'Livraison soignée et chiot bien socialisé. Nous aurions aimé plus de photos avant la réservation.',nl:'Zorgvuldige levering en goed gesocialiseerde puppy. We hadden graag meer foto\'s gezien voor de reservering.',en:'Careful delivery and well-socialized puppy. We would have liked more photos before reserving.'}, author:'Catherine L.', city:'Oupeye' },
              { stars:4, text:{fr:'Tout s\'est bien passé dans l\'ensemble. Le chiot est en bonne santé et nous sommes ravis. La livraison était un peu tardive.',nl:'Alles is goed verlopen. De puppy is gezond en we zijn blij. De levering was iets te laat.',en:'Everything went well overall. The puppy is healthy and we are delighted. Delivery was a bit late.'}, author:'François X.', city:'Arlon' },
              { stars:3, text:{fr:'Chiot conforme mais la livraison a été compliquée à organiser. Plusieurs reports. Heureusement tout est bien qui finit bien.',nl:'Puppy zoals beloofd maar de levering was moeilijk te organiseren. Meerdere uitstel. Gelukkig goed afgelopen.',en:'Puppy as promised but delivery was complicated to organize. Several postponements. All\'s well that ends well.'}, author:'Isabelle R.', city:'Luxembourg' },
              { stars:3, text:{fr:'Satisfait du chiot, mais la communication avant la livraison pourrait être améliorée. J\'ai dû relancer plusieurs fois.',nl:'Tevreden over de puppy, maar de communicatie voor de levering kan beter. Ik moest verschillende keren herinneren.',en:'Satisfied with the puppy, but communication before delivery could be improved. I had to follow up several times.'}, author:'Luc B.', city:'Liège' },
              { stars:3, text:{fr:'Le chiot est en bonne santé et correspond à la description. Le processus de réservation était correct mais sans plus. Livraison ok.',nl:'De puppy is gezond en zoals beschreven. Het reserveringsproces was oké maar niet bijzonder. Levering ok.',en:'The puppy is healthy and matches description. Reservation process was fine but nothing special. Delivery ok.'}, author:'Patrick S.', city:'Bouillon' },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'28px 24px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {Array.from({length:5}).map((_,j)=><span key={j} style={{ color:j<r.stars?'#FFAA00':'var(--border-2)', fontSize:18 }}>★ </span>)}
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
