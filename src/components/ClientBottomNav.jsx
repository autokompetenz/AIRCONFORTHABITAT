import { Link, useLocation } from 'react-router-dom';
import { useBreakpoint } from '../hooks';
import { ShoppingCart, Store, MapPin, Home } from 'lucide-react';

function pathMatchesNav(pathname) {
  if (/^\/track/.test(pathname)) return true;
  if (/^\/catalog/.test(pathname)) return true;
  if (/^\/about/.test(pathname)) return true;
  if (/^\/($)/.test(pathname)) return true;
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
    { to: '/', label: 'Accueil', icon: Home, match: (p) => p === '/' },
    { to: '/catalog', label: 'Produits', icon: Store, match: (p) => p.startsWith('/catalog') },
    { to: '/track', label: 'Suivi', icon: MapPin, match: (p) => p === '/track' },
  ];

  return (
    <nav aria-label="Navigation mobile" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 950,
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      padding: '6px 4px max(8px, env(safe-area-inset-bottom))',
      background: '#fff', borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
    }}>
      {items.map(({ to, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={to} to={to} style={{
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            padding: '4px 2px', textDecoration: 'none',
            color: active ? 'var(--primary)' : '#999',
            fontSize: 10, fontWeight: active ? 700 : 500,
            borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
          }}>
            <Icon size={20} strokeWidth={1.5} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
