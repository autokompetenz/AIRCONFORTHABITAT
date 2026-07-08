import { useThemeStore } from '../store';

export default function MailButton() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const bg = isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)';
  const backdrop = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';

  return (
    <a
      href="mailto:contact@animalconceptsrl.com"
      className="mail-btn"
      aria-label="Email"
      style={{
        background: bg,
        backdropFilter: `blur(12px)`,
        WebkitBackdropFilter: `blur(12px)`,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: `0 8px 32px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'}`,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#e8e8e8' : '#1A1410'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13L2 4" />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#e8e8e8' : '#1A1410', fontFamily: "'Inter',sans-serif", letterSpacing: '0.02em' }}>Nous contacter</span>
    </a>
  );
}
