import { Link } from 'react-router-dom';
import { useLangStore, useThemeStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';

export default function Footer() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0f0f0f' : '#F0ECE6';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)';
  const text = isDark ? 'rgba(255,255,255,0.75)' : '#444';
  const text2 = isDark ? 'rgba(255,255,255,0.45)' : '#777';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const F = "'Outfit',sans-serif";

  const linkStyle = {
    fontSize: isMobile ? 14 : 13,
    fontWeight: 500,
    color: text,
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
  };

  const colTitle = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: text2,
    marginBottom: isMobile ? 12 : 16,
    fontFamily: F,
  };

  return (
    <footer style={{
      background: bg,
      borderTop: `1px solid ${border}`,
      padding: isMobile ? '40px 5% 100px' : '60px 5% 40px',
      transition: 'background 0.3s',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
        gap: isMobile ? 32 : 48,
      }}>
        {/* Brand */}
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: F, fontSize: 18, fontWeight: 900, color: isDark ? '#fff' : '#111', letterSpacing: '0.05em' }}>
              ANIMAL CONCEPT SRL
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--primary)', textTransform: 'uppercase', marginTop: 3 }}>
              Oupeye &middot; Belgique
            </div>
          </Link>
          <p style={{ fontSize: 13, color: text2, lineHeight: 1.7, marginTop: 16, maxWidth: 300 }}>
            {lang === 'fr' ? 'Élevage familial de chiots de race, sélectionnés avec soin pour leur santé et leur tempérament.' : lang === 'en' ? 'Family kennel of purebred puppies, carefully selected for health and temperament.' : 'Familiale fokkerij van rashonden, zorgvuldig geselecteerd op gezondheid en temperament.'}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <div style={colTitle}>{t('nav_puppies', lang)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 8 }}>
            <Link to="/catalog" style={linkStyle}>{t('nav_puppies', lang)}</Link>
            <Link to="/catalog" style={linkStyle}>{t('nav_kennel', lang)}</Link>

            <Link to="/track"   style={linkStyle}>{t('nav_track', lang)}</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <div style={colTitle}>{t('legal_mentions', lang)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 8 }}>
            <Link to="/legal#identite" style={linkStyle}>{t('legal_mentions', lang)}</Link>
            <Link to="/legal#privacy" style={linkStyle}>{t('privacy', lang)}</Link>
            <Link to="/legal#terms"   style={linkStyle}>{t('terms', lang)}</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div style={colTitle}>{t('contact_label', lang)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 8, fontSize: 13, color: text }}>
            <a href="mailto:contact@animalconceptsrl.com" style={{
              fontSize: isMobile ? 14 : 13, fontWeight: 700, color: '#fff',
              background: '#C9762E', textDecoration: 'none', padding: '10px 20px',
              borderRadius: 8, textAlign: 'center', display: 'inline-block',
              fontFamily: "'Outfit',sans-serif", letterSpacing: '0.04em',
              transition: 'background 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#B8681E'}
              onMouseOut={e => e.currentTarget.style.background = '#C9762E'}>
              ✉ {t('contact_label', lang)}
            </a>
            <span>Oupeye, Belgique</span>
            <Link to="/legal" style={linkStyle}>{t('cookies_label', lang)}</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1200,
        margin: '32px auto 0',
        paddingTop: 24,
        borderTop: `1px solid ${border}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 12 : 0,
        fontSize: 12,
        color: text2,
      }}>
        <span>
          &copy; {new Date().getFullYear()} ANIMAL CONCEPT SRL — {t('copyright', lang)}
        </span>
        <span>{t('made_in', lang)}</span>
      </div>
    </footer>
  );
}
