export default function SectionHeader({ eyebrow, title, subtitle, align = 'center', style }) {
  return (
    <div style={{ textAlign: align, marginBottom: 48, ...style }}>
      {eyebrow && <div className="section-eyebrow" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}>{eyebrow}</div>}
      {title && (
        <h2 style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 900,
          fontSize: 'clamp(1.625rem, 4vw, 3rem)',
          color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: title ? 12 : 0,
        }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-3)', maxWidth: 540, margin: align === 'center' ? '0 auto' : '0' }}>{subtitle}</p>
      )}
    </div>
  );
}
