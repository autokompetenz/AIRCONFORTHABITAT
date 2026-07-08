import { Link, useLocation } from 'react-router-dom';
import { useBreakpoint } from '../hooks';

function pathMatchesNav(pathname) {
  if (/^\/track/.test(pathname)) return true;
  if (/^\/catalog/.test(pathname)) return true;
  if (/^\/about/.test(pathname)) return true;
  return false;
}

export function useBottomNavPadding() {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();
  if (!isMobile || !pathMatchesNav(pathname)) return 0;
  return 'calc(56px + max(12px, env(safe-area-inset-bottom)))';
}

export default function ClientBottomNav() {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();

  if (!isMobile || !pathMatchesNav(pathname)) return null;

  const items = [
    { to: '/catalog', label: 'Produits', icon: '❄️', match: (p) => p.startsWith('/catalog') },
    { to: '/about', label: 'Société', icon: '🏢', match: (p) => p.startsWith('/about') },
    { to: '/track', label: 'Suivi', icon: '📍', match: (p) => p === '/track' },
  ];

  return (
    <nav aria-label="Navigation mobile" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 950,
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      padding: '6px 4px max(8px, env(safe-area-inset-bottom))',
      background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.12)', backdropFilter: 'blur(16px)',
    }}>
      {items.map(({ to, label, icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={to} to={to} style={{
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            padding: '4px 2px', textDecoration: 'none',
            color: active ? 'var(--primary)' : 'var(--text-3)',
            fontSize: 10, fontWeight: active ? 800 : 600,
            fontFamily: "'Outfit',sans-serif",
            borderRadius: 10, background: active ? 'var(--primary-bg)' : 'transparent',
            border: active ? '1px solid var(--primary-border)' : '1px solid transparent',
            transition: 'color 0.2s, background 0.2s',
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
