import { Link } from 'react-router-dom';
import { useLangStore, useThemeStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import { Mail, MapPin, Shield, Award, Wrench } from 'lucide-react';

const CONTACT_EMAIL = 'contact@airecoclim.com';

export default function Footer() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const isDark = theme === 'dark';

  const bg = '#1A1A1A';
  const text = '#999';
  const text2 = '#666';
  const border = '#333';

  const linkStyle = {
    fontSize: '0.75rem', fontWeight: 500, color: text,
    textDecoration: 'none', display: 'block', padding: '3px 0',
  };

  return (
    <footer style={{ background: bg, borderTop: '1px solid #333', color: text }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '32px 5% 80px' : '40px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 20 : 40 }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                AIR ECO<span style={{ color: 'var(--primary)' }}> CLIM</span>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--primary)', textTransform: 'uppercase', marginTop: 2 }}>
                Brié-et-Angonnes · France
              </div>
            </Link>
            <p style={{ fontSize: 12, color: text, lineHeight: 1.6, marginTop: 12, maxWidth: 280 }}>
              {lang === 'fr' ? 'Installation de climatisation, pompes à chaleur et chauffage — vente, installation et SAV en France.' : lang === 'en' ? 'Installation of air conditioning, heat pumps and heating — sales, installation and after-sales in France.' : 'Installatie van airconditioning, warmtepompen en verwarming — verkoop, installatie en after-sales in Frankrijk.'}
            </p>
            <div style={{ marginTop: 8, fontSize: 11, color: text2, lineHeight: 1.6 }}>
              <div>RCS Grenoble 844 859 413 · SIRET 844 859 413 00024</div>
              <div>APE 43.22B · TVA FR67844859413</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: text2, marginBottom: 10 }}>
              {t('nav_products', lang)}
            </h4>
            <Link to="/catalog" style={linkStyle}>{t('nav_products', lang)}</Link>
            <Link to="/about" style={linkStyle}>{t('nav_company', lang)}</Link>
            <Link to="/track" style={linkStyle}>{t('nav_track', lang)}</Link>
          </div>

          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: text2, marginBottom: 10 }}>
              {t('legal_mentions', lang)}
            </h4>
            <Link to="/legal#identite" style={linkStyle}>{t('legal_mentions', lang)}</Link>
            <Link to="/legal#privacy" style={linkStyle}>{t('privacy', lang)}</Link>
            <Link to="/legal#terms" style={linkStyle}>{t('terms', lang)}</Link>
          </div>

          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: text2, marginBottom: 10 }}>
              {t('contact_label', lang)}
            </h4>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{
              fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--primary)',
              textDecoration: 'none', padding: '8px 16px', display: 'inline-flex',
              alignItems: 'center', gap: 6, marginBottom: 8,
            }}>
              <Mail size={14} strokeWidth={2} />
              {t('contact_label', lang)}
            </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: text, padding: '3px 0' }}>
                <MapPin size={13} strokeWidth={1.5} /> Brié-et-Angonnes, France
              </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', padding: '16px 0', marginTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={16} color="var(--primary)" strokeWidth={1.8} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>RGE</div>
              <div style={{ fontSize: 10, color: text2 }}>Reconnu Garant de l'Environnement</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="var(--primary)" strokeWidth={1.8} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>QualiPAC</div>
              <div style={{ fontSize: 10, color: text2 }}>Certification PAC</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={16} color="var(--primary)" strokeWidth={1.8} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>Artisan RGE</div>
              <div style={{ fontSize: 10, color: text2 }}>Certifié</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: 14, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, color: text2 }}>
          <span>&copy; {new Date().getFullYear()} AIR ECO CLIM — {t('copyright', lang)}</span>
          <span>{t('made_in', lang)}</span>
        </div>
      </div>
    </footer>
  );
}
