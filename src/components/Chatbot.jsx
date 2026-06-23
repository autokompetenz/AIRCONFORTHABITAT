import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLangStore, useThemeStore } from '../store';

const RESPONSES = {
  fr: {
    default:  "Merci pour votre message ! Nous vous répondons rapidement.\n📧 contact@animalconceptsrl.com",
    horaires: "Nos horaires :\n🕗 Lun–Ven : 09h00 – 18h00\n🕘 Samedi : 10h00 – 16h00\n❌ Dimanche : Fermé",
    prix:     "Nos chiots sont proposés à des prix justes, incluant pedigree, vaccins, puce et vermifuge.\n\n📧 Contactez-nous pour plus d'infos !",
    rdv:      "Pour prendre rendez-vous afin de rencontrer un chiot :\n\n📧 contact@animalconceptsrl.com",
    adresse:  "📍 ANIMAL CONCEPT SRL\nRue Fût Voie 216\n4683 Oupeye, Belgique",
    bonjour:  "Bonjour ! Bienvenue chez ANIMAL CONCEPT SRL 🐶\n\nComment puis-je vous aider ?\n• Horaires d'ouverture\n• Prendre rendez-vous\n• Tarifs\n• Notre adresse",
    garantie: "Tous nos chiots partent avec :\n✅ Pedigree LOSH\n✅ Vaccins à jour\n✅ Puce électronique\n✅ Vermifuge\n✅ Carnet de santé",
  },
  nl: {
    default:  "Bedankt voor uw bericht! We antwoorden snel.\n📧 contact@animalconceptsrl.com",
    horaires: "Openingstijden:\n🕗 Ma–Vr: 09:00–18:00\n🕘 Za: 10:00–16:00\n❌ Zo: Gesloten",
    prix:     "Onze puppy's worden aangeboden tegen eerlijke prijzen, inclusief stamboom, vaccinaties, chip en ontworming.\n\n📧 Neem contact op voor meer info!",
    rdv:      "Om een afspraak te maken om een puppy te ontmoeten:\n\n📧 contact@animalconceptsrl.com",
    adresse:  "📍 ANIMAL CONCEPT SRL\nRue Fût Voie 216\n4683 Oupeye, België",
    bonjour:  "Hallo! Welkom bij ANIMAL CONCEPT SRL 🐶\n\nHoe kan ik u helpen?\n• Openingstijden\n• Afspraak maken\n• Prijzen\n• Adres",
    garantie: "Al onze puppy's worden geleverd met:\n✅ Stamboom LOSH\n✅ Vaccinaties up-to-date\n✅ Microchip\n✅ Ontworming\n✅ Gezondheidsboekje",
  },
  en: {
    default:  "Thanks for your message! We'll reply shortly.\n📧 contact@animalconceptsrl.com",
    horaires: "Opening hours:\n🕗 Mon–Fri: 09:00–18:00\n🕘 Sat: 10:00–16:00\n❌ Sun: Closed",
    prix:     "Our puppies are offered at fair prices, including pedigree, vaccines, microchip and deworming.\n\n📧 Contact us for more info!",
    rdv:      "To book an appointment to meet a puppy:\n\n📧 contact@animalconceptsrl.com",
    adresse:  "📍 ANIMAL CONCEPT SRL\nRue Fût Voie 216\n4683 Oupeye, Belgium",
    bonjour:  "Hello! Welcome to ANIMAL CONCEPT SRL 🐶\n\nHow can I help you?\n• Opening hours\n• Book appointment\n• Pricing\n• Our address",
    garantie: "All our puppies come with:\n✅ LOSH Pedigree\n✅ Up-to-date vaccines\n✅ Microchip\n✅ Deworming\n✅ Health record",
  },
};

const QUICK_BUTTONS = {
  fr: ['Horaires', 'Rendez-vous', 'Adresse', 'Tarifs'],
  nl: ['Openingstijden', 'Afspraak', 'Adres', 'Prijzen'],
  en: ['Opening hours', 'Appointment', 'Address', 'Pricing'],
};

function detect(msg, lang) {
  const m = msg.toLowerCase();
  const R = RESPONSES[lang] || RESPONSES.fr;
  if (/hello|hallo|bonjour|hi|hoi/.test(m)) return R.bonjour;
  if (/heure|horaire|hour|open|tijd|openings/.test(m)) return R.horaires;
  if (/prix|price|cost|tarif|prijs|kosten/.test(m)) return R.prix;
  if (/rendez|rdv|appoint|afspraak|afspra|boek/.test(m)) return R.rdv;
  if (/adresse|address|adres|waar|where|lieu/.test(m)) return R.adresse;
  if (/garantie|garant|warranty|gezond|vaccin|puce|chip/.test(m)) return R.garantie;
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
  const quickBg    = isDark ? 'rgba(201,118,46,0.08)'    : 'rgba(201,118,46,0.06)';
  const quickBd    = isDark ? 'rgba(201,118,46,0.2)'     : 'rgba(201,118,46,0.25)';
  const quickText  = isDark ? 'rgba(255,255,255,0.7)'    : '#C9762E';
  const quickHoverBg   = isDark ? 'rgba(201,118,46,0.18)' : 'rgba(201,118,46,0.14)';
  const quickHoverText = '#C9762E';

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
        <span style={{ fontSize: 26 }}>{open ? '✕' : '🐶'}</span>
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
        <div style={{ background: 'linear-gradient(135deg, #A8652A, #C9762E)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🐶</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.02em' }}>
              ANIMAL CONCEPT SRL
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
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'Outfit', sans-serif",
                background: m.from === 'bot' ? msgBotBg : '#C9762E',
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
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
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
              borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: "'Outfit', sans-serif",
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#C9762E'}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
          <style>{`
            .chat-window input::placeholder { color: ${inputPh}; }
            @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
          `}</style>
          <button onClick={() => send()} disabled={!input.trim()}
            style={{
              background: input.trim() ? '#C9762E' : (isDark ? 'rgba(201,118,46,0.3)' : 'rgba(201,118,46,0.2)'),
              border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed',
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, flexShrink: 0, transition: 'background 0.2s',
            }}>➤</button>
        </div>
      </div>
    </>
  );
}
