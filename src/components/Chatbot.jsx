import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLangStore, useThemeStore } from '../store';

const RESPONSES = {
  fr: {
    default:  "Merci pour votre message ! Nous vous répondons rapidement.\n📧 Nous contacter",
    horaires: "Nos horaires :\n🕗 Lun–Ven : 09h00 – 18h00\n🕘 Samedi : 10h00 – 16h00\n❌ Dimanche : Fermé",
    prix:     "Nos climatiseurs et ventilateurs sont proposés aux meilleurs prix du marché, installation comprise.\n\n📧 Contactez-nous pour un devis personnalisé !",
    rdv:      "Pour prendre rendez-vous pour un devis d'installation :\n\n📧 Nous contacter ou appelez-nous.",
    adresse:  "📍 AIR ECO CLIM\nBrié-et-Angonnes, France",
    bonjour:  "Bonjour ! Bienvenue chez AIR ECO CLIM ❄️\n\nComment puis-je vous aider ?\n• Horaires d'ouverture\n• Devis d'installation\n• Tarifs\n• Garantie & SAV\n• Notre adresse",
    garantie: "Nos produits sont couverts par :\n✅ Garantie constructeur 2 à 5 ans\n✅ Installation professionnelle\n✅ Service après-vente réactif\n✅ Pièces de rechange disponibles",
    livraison: "Nous livrons et installons dans toute la France :\n🚚 Livraison rapide\n🔧 Installation par nos techniciens\n📦 Retrait possible sur place",
    entretien: "Nous proposons des contrats d'entretien annuels pour vos climatiseurs :\n✅ Nettoyage des filtres\n✅ Vérification du circuit frigorifique\n✅ Contrôle des raccordements",
  },
  nl: {
    default:  "Bedankt voor uw bericht! We antwoorden snel.\n📧 Neem contact op",
    horaires: "Openingstijden:\n🕗 Ma–Vr: 09:00–18:00\n🕘 Za: 10:00–16:00\n❌ Zo: Gesloten",
    prix:     "Onze airconditioners en ventilatoren worden aangeboden tegen de beste prijzen, inclusief installatie.\n\n📧 Neem contact op voor een persoonlijke offerte!",
    rdv:      "Om een afspraak te maken voor een installatie-offerte:\n\n📧 Neem contact op of bel ons.",
    adresse:  "📍 AIR ECO CLIM\nBrié-et-Angonnes, Frankrijk",
    bonjour:  "Hallo! Welkom bij AIR ECO CLIM ❄️\n\nHoe kan ik u helpen?\n• Openingstijden\n• Installatie-offerte\n• Prijzen\n• Garantie & service\n• Adres",
    garantie: "Onze producten worden gedekt door:\n✅ Fabrieksgarantie 2 tot 5 jaar\n✅ Professionele installatie\n✅ Snelle after-sales service\n✅ Vervangingsonderdelen beschikbaar",
    livraison: "Wij leveren en installeren in heel Frankrijk:\n🚚 Snelle levering\n🔧 Installatie door onze technici\n📦 Afhalen mogelijk ter plaatse",
    entretien: "Wij bieden jaarlijkse onderhoudscontracten voor uw airco's:\n✅ Reiniging van filters\n✅ Controle van het koelcircuit\n✅ Controle van aansluitingen",
  },
  en: {
    default:  "Thanks for your message! We'll reply shortly.\n📧 Contact us",
    horaires: "Opening hours:\n🕗 Mon–Fri: 09:00–18:00\n🕘 Sat: 10:00–16:00\n❌ Sun: Closed",
    prix:     "Our air conditioners and fans are offered at the best market prices, installation included.\n\n📧 Contact us for a personalized quote!",
    rdv:      "To book an appointment for an installation quote:\n\n📧 Contact us or call us.",
    adresse:  "📍 AIR ECO CLIM\nBrié-et-Angonnes, France",
    bonjour:  "Hello! Welcome to AIR ECO CLIM ❄️\n\nHow can I help you?\n• Opening hours\n• Installation quote\n• Pricing\n• Warranty & service\n• Our address",
    garantie: "Our products are covered by:\n✅ Manufacturer warranty 2 to 5 years\n✅ Professional installation\n✅ Responsive after-sales service\n✅ Spare parts available",
    livraison: "We deliver and install throughout France:\n🚚 Fast delivery\n🔧 Installation by our technicians\n📦 Pickup available on-site",
    entretien: "We offer annual maintenance contracts for your AC units:\n✅ Filter cleaning\n✅ Refrigeration circuit check\n✅ Connection inspection",
  },
};

const QUICK_BUTTONS = {
  fr: ['Horaires', 'Devis', 'Adresse', 'Tarifs'],
  nl: ['Openingstijden', 'Offerte', 'Adres', 'Prijzen'],
  en: ['Opening hours', 'Quote', 'Address', 'Pricing'],
};

function detect(msg, lang) {
  const m = msg.toLowerCase();
  const R = RESPONSES[lang] || RESPONSES.fr;
  if (/hello|hallo|bonjour|hi|hoi/.test(m)) return R.bonjour;
  if (/heure|horaire|hour|open|tijd|openings/.test(m)) return R.horaires;
  if (/prix|price|cost|tarif|prijs|kosten/.test(m)) return R.prix;
  if (/rendez|rdv|appoint|afspraak|afspra|boek|devis|offerte|quote/.test(m)) return R.rdv;
  if (/adresse|address|adres|waar|where|lieu/.test(m)) return R.adresse;
  if (/garantie|garant|warranty|gezond|sav|service/.test(m)) return R.garantie;
  if (/livraison|lever|delivery|bezorg/.test(m)) return R.livraison;
  if (/entretien|mainten|onderhoud|maintenance/.test(m)) return R.entretien;
  return R.default;
}

export default function Chatbot() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const R  = RESPONSES[lang] || RESPONSES.fr;
  const QB = QUICK_BUTTONS[lang] || QUICK_BUTTONS.fr;

  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([{ from: 'bot', text: R.bonjour }]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const [notif, setNotif]   = useState(true);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  const winBg      = isDark ? '#0f0f0f'                 : '#ffffff';
  const winBorder  = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.1)';
  const msgBotBg   = isDark ? '#1e1e1e'                 : '#f0f0f0';
  const msgBotText = isDark ? '#e8e8e8'                 : '#111111';
  const msgUserText= '#ffffff';
  const inputBg    = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)';
  const inputText  = isDark ? '#e8e8e8'                 : '#111111';
  const inputPh    = isDark ? 'rgba(255,255,255,0.35)'  : 'rgba(0,0,0,0.35)';
  const footerBg   = isDark ? '#141414'                 : '#f8f8f8';
  const footerBord = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.08)';
  const dotBg      = isDark ? '#555'                    : '#bbb';
  const quickBg    = isDark ? 'rgba(46,134,193,0.08)'    : 'rgba(46,134,193,0.06)';
  const quickBd    = isDark ? 'rgba(46,134,193,0.2)'     : 'rgba(46,134,193,0.25)';
  const quickText  = isDark ? 'rgba(255,255,255,0.7)'    : '#2E86C1';
  const quickHoverBg   = isDark ? 'rgba(46,134,193,0.18)' : 'rgba(46,134,193,0.14)';
  const quickHoverText = '#2E86C1';

  useEffect(() => {
    const R2 = RESPONSES[lang] || RESPONSES.fr;
    setMsgs([{ from: 'bot', text: R2.bonjour }]);
  }, [lang]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) { setNotif(false); setTimeout(() => inputRef.current?.focus(), 300); } }, [open]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMsgs(m => [...m, { from: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: detect(msg, lang) }]);
    }, 800 + Math.random() * 600);
  };

  const placeholders  = { fr: 'Votre question...', nl: 'Uw vraag...', en: 'Your question...' };
  const headerStatus  = { fr: 'En ligne · Répond rapidement', nl: 'Online · Antwoordt snel', en: 'Online · Replies quickly' };

  return (
    <>
      <button className="chat-btn" onClick={() => setOpen(o => !o)} aria-label="Chat">
        <span style={{ fontSize: 26 }}>{open ? '✕' : '💬'}</span>
        {!open && notif && <div className="chat-notif">1</div>}
      </button>

      <div
        className={`chat-window ${open ? 'open' : 'closed'}`}
        style={{
          background: winBg,
          border: `1px solid ${winBorder}`,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ background: 'linear-gradient(135deg, #1B6B9C, #2E86C1)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>❄️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.02em' }}>
              AIR ECO CLIM
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
              {headerStatus[lang] || headerStatus.fr}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: winBg }}>
          {msgs.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                maxWidth: '88%', padding: '12px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'Inter', sans-serif",
                background: m.from === 'bot' ? msgBotBg : '#2E86C1',
                color: m.from === 'bot' ? msgBotText : msgUserText,
                alignSelf: m.from === 'bot' ? 'flex-start' : 'flex-end',
                borderBottomLeftRadius: m.from === 'bot' ? 3 : 12,
                borderBottomRightRadius: m.from === 'user' ? 3 : 12,
              }}
            >{m.text}</motion.div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: msgBotBg, borderRadius: 12, alignSelf: 'flex-start', borderBottomLeftRadius: 3 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 7, height: 7, background: dotBg, borderRadius: '50%', display: 'block', animation: 'bounce 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {msgs.length <= 2 && (
          <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, background: winBg }}>
            {QB.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{
                  background: quickBg, border: `1px solid ${quickBd}`, color: quickText,
                  fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = quickHoverBg; e.currentTarget.style.color = quickHoverText; }}
                onMouseOut={e => { e.currentTarget.style.background = quickBg; e.currentTarget.style.color = quickText; }}>
                {q}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: `1px solid ${footerBord}`, background: footerBg, flexShrink: 0 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={placeholders[lang] || placeholders.fr}
            style={{
              flex: 1, background: inputBg, border: `1px solid ${inputBorder}`, color: inputText,
              borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: "'Inter', sans-serif",
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2E86C1'}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
          <style>{`
            .chat-window input::placeholder { color: ${inputPh}; }
            @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
          `}</style>
          <button onClick={() => send()} disabled={!input.trim()}
            style={{
              background: input.trim() ? '#2E86C1' : (isDark ? 'rgba(46,134,193,0.3)' : 'rgba(46,134,193,0.2)'),
              border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed',
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, flexShrink: 0, transition: 'background 0.2s',
            }}>➤</button>
        </div>
      </div>
    </>
  );
}
