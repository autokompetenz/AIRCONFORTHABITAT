import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLangStore, useThemeStore, useAdminStore, useCartStore } from '../store';
import { t, LANGUAGES } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import { Search, ShoppingCart, User, Menu, X, Snowflake, Building2, MapPin, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { lang, setLang } = useLangStore();
  const { theme, toggle } = useThemeStore();
  const { isAuthenticated, logout } = useAdminStore();
  const { items, openCart } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const menuRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
      document.addEventListener('mousedown', h);
      return () => document.removeEventListener('mousedown', h);
    }
  }, [isMobile]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const darkBg = isDark ? '#1A1A1A' : '#1A1A1A';
  const darkText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)';

  const categories = [
    { label: { fr: 'Climatiseurs fixes', nl: 'Vaste airco\'s', en: 'Fixed ACs' }, path: '/catalog?type=climatiseur_fixe' },
    { label: { fr: 'Climatiseurs mobiles', nl: 'Mobiele airco\'s', en: 'Portable ACs' }, path: '/catalog?type=climatiseur_mobile' },
    { label: { fr: 'Ventilateurs', nl: 'Ventilatoren', en: 'Fans' }, path: '/catalog?type=ventilateur' },
    { label: { fr: 'Marques', nl: 'Merken', en: 'Brands' }, path: '/catalog' },
    { label: { fr: 'Promotions', nl: 'Aanbiedingen', en: 'Sales' }, path: '/catalog?sort=price_asc' },
  ];

  return (
    <>
      <div style={{
        background: darkBg, color: darkText, fontSize: 10,
        padding: '4px 4%', display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Artisan RGE · Brié-et-Angonnes (38) · Livraison France</span>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!isMobile && <Link to="/track" style={{ color: darkText, textDecoration: 'none', fontWeight: 500 }}>{t('nav_track', lang)}</Link>}
          <span style={{ fontWeight: 600, color: '#fff' }}>{lang.toUpperCase()}</span>
        </div>
      </div>

      <header style={{
        background: isDark ? '#2A2A2A' : '#fff',
        borderBottom: '1px solid var(--border)',
        padding: isMobile ? '10px 4%' : '12px 5%',
        display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24,
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0 }}>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 14 : 18, fontWeight: 900,
            color: isDark ? '#fff' : '#1A1A1A', letterSpacing: '-0.02em',
          }}>
            AIR ECO<span style={{ color: 'var(--primary)' }}> CLIM</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--primary)', textTransform: 'uppercase', marginTop: 1 }}>
            Brié-et-Angonnes · France
          </div>
        </Link>

        {!isMobile && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, display: 'flex' }}>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder={t('search_ph', lang)}
              style={{
                flex: 1, border: '2px solid var(--primary)', borderRight: 'none',
                padding: '8px 12px', fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                outline: 'none', background: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#1A1A1A',
              }} />
            <button type="submit" style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={16} strokeWidth={2} />
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, marginLeft: 'auto' }}>
          {!isMobile && (
            <Link to="/track" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8125rem', color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500,
            }}>
              <MapPin size={16} strokeWidth={1.5} /> {t('nav_track', lang)}
            </Link>
          )}

          <button onClick={openCart} style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            padding: isMobile ? '4px' : '6px 12px',
            color: isDark ? '#fff' : 'var(--text)',
          }}>
            <ShoppingCart size={isMobile ? 20 : 22} strokeWidth={1.8} />
            {!isMobile && <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Mon panier</span>}
            {count > 0 && (
              <span style={{
                position: 'absolute', top: isMobile ? -2 : -4, right: isMobile ? -4 : 2,
                background: 'var(--red)', color: '#fff',
                fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                padding: isMobile ? '4px' : '6px 8px',
                color: isDark ? '#fff' : 'var(--text)',
              }}>
              {isMobile ? (
                menuOpen ? <X size={22} /> : <Menu size={22} />
              ) : (
                <>
                  <User size={20} strokeWidth={1.8} />
                  <ChevronDown size={14} strokeWidth={2} />
                </>
              )}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  style={{
                    position: isMobile ? 'fixed' : 'absolute',
                    right: 0, top: isMobile ? 0 : '100%',
                    left: isMobile ? 0 : 'auto',
                    bottom: isMobile ? 0 : 'auto',
                    background: isDark ? '#2A2A2A' : '#fff',
                    border: isMobile ? 'none' : '1px solid var(--border)',
                    minWidth: isMobile ? '100%' : 220,
                    zIndex: 9999,
                    padding: isMobile ? '20px 5% 40px' : '8px 0',
                    overflowY: isMobile ? 'auto' : 'visible',
                    boxShadow: isMobile ? 'none' : '0 4px 16px rgba(0,0,0,0.12)',
                    display: 'flex', flexDirection: 'column',
                  }}>
                  {isMobile && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Menu</div>
                        <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4 }}>
                          <X size={24} strokeWidth={1.5} />
                        </button>
                      </div>
                      <form onSubmit={handleSearch} style={{ display: 'flex', marginBottom: 16 }}>
                        <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
                          placeholder={t('search_ph', lang)}
                          style={{
                            flex: 1, border: '2px solid var(--primary)', borderRight: 'none',
                            padding: '10px 12px', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                            outline: 'none', background: 'var(--bg-input)', color: 'var(--text)',
                          }} />
                        <button type="submit" style={{
                          background: 'var(--primary)', color: '#fff', border: 'none',
                          padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}>
                          <Search size={18} strokeWidth={2} />
                        </button>
                      </form>

                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Catégories</div>
                      {categories.map((cat, i) => (
                        <Link key={i} to={cat.path} onClick={() => setMenuOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 0', fontSize: 15, color: 'var(--text)',
                            textDecoration: 'none', borderBottom: '1px solid var(--border)',
                            fontWeight: 600,
                          }}>
                          {cat.label[lang] || cat.label.fr}
                        </Link>
                      ))}

                      <div style={{ marginTop: 16 }}>
                        {[
                          { to: '/about', icon: Building2, label: t('nav_company', lang) },
                          { to: '/track', icon: MapPin, label: t('nav_track', lang) },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 0', fontSize: 14, color: 'var(--text-2)',
                              textDecoration: 'none', borderBottom: '1px solid var(--border)',
                              fontWeight: 500,
                            }}>
                            <Icon size={18} strokeWidth={1.5} color="var(--primary)" /> {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isMobile && (
                    <Link to="/catalog" onClick={() => setMenuOpen(false)} style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_products', lang)}</Link>
                  )}
                  {!isMobile && (
                    <Link to="/about" onClick={() => setMenuOpen(false)} style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_company', lang)}</Link>
                  )}
                  {!isMobile && (
                    <Link to="/track" onClick={() => setMenuOpen(false)} style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_track', lang)}</Link>
                  )}

                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

                  <button onClick={toggle} style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{isDark ? '☀️' : '🌙'}</span>
                    {isDark ? t('light_mode', lang) : t('dark_mode', lang)}
                  </button>

                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

                  <div style={{ padding: '8px 16px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
                      Langue
                    </p>
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setMenuOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 0', fontSize: 13,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: l.code === lang ? 'var(--primary)' : 'var(--text-2)',
                          fontWeight: l.code === lang ? 700 : 400,
                          fontFamily: 'Inter, sans-serif', width: '100%', textAlign: 'left',
                        }}>
                        <span style={{ fontSize: 16 }}>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>

                  {isAuthenticated && (
                    <>
                      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                      <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        Déconnexion
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {!isMobile && (
        <nav style={{
          display: 'flex', gap: 0, padding: '0 5%',
          borderBottom: '1px solid var(--border)',
          background: isDark ? '#222' : '#fff',
        }}>
          {categories.map((cat, i) => (
            <Link key={i} to={cat.path}
              style={{
                padding: '10px 20px', fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-2)', textDecoration: 'none',
                borderBottom: '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderBottomColor = 'var(--primary)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderBottomColor = 'transparent'; }}>
              {cat.label[lang] || cat.label.fr}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
