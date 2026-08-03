// Encabezado de módulo. Los cinco módulos usaban tres tamaños distintos
// (text-4xl, text-3xl y fontSize:36 inline); aquí queda uno solo, atado al
// token --text-display-md del sistema.
export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <header className={`flex justify-between items-end gap-6 mb-8 ${className}`}>
      <div className="min-w-0">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'var(--text-display-md)',
            lineHeight: 1.1,
            color: 'var(--fg-primary)',
            marginBottom: 6,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--fg-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </header>
  )
}
