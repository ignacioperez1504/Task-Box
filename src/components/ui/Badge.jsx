// color must be a literal hex string (not a var() reference) so the
// alpha-suffix technique below renders reliably regardless of color-mix() support.
export default function Badge({ children, color = '#E8825B', dot = false }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
        color,
        background: color + '33',
        border: `1px solid ${color}66`,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {children}
    </span>
  )
}
