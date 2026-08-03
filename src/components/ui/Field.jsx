// Campos de formulario del sistema. Todos los inputs de la app compartían el
// mismo bloque de estilo copiado a mano con alphas que iban derivando
// (.05/.06 de fondo, .12/.15 de borde); aquí queda una sola definición.

const SURFACE = {
  background: 'rgba(var(--ink-rgb),.06)',
  border: '1px solid rgba(var(--ink-rgb),.15)',
  borderRadius: 'var(--ds-radius-control)',
  color: 'var(--fg-primary)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  width: '100%',
  transition: 'border-color var(--ds-duration-base) var(--ds-ease-out)',
}

export function Label({ children, hint, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`ds-label mb-2 ${className}`}>
      {children}
      {hint && (
        <span style={{ textTransform: 'none', letterSpacing: 'normal', opacity: 0.75 }}>
          {' '}{hint}
        </span>
      )}
    </label>
  )
}

export function Input({ className = '', style, ...props }) {
  return (
    <input
      className={`text-sm px-4 py-3 focus:border-terracotta ${className}`}
      style={{ ...SURFACE, ...style }}
      {...props}
    />
  )
}

export function Textarea({ className = '', style, ...props }) {
  return (
    <textarea
      className={`text-sm px-4 py-3 focus:border-terracotta resize-none ${className}`}
      style={{ ...SURFACE, ...style }}
      {...props}
    />
  )
}

// Input + etiqueta, que es como se usa en el 90% de los casos.
export default function Field({ label, hint, as = 'input', className = '', ...props }) {
  const Control = as === 'textarea' ? Textarea : Input
  return (
    <div className={className}>
      {label && <Label hint={hint}>{label}</Label>}
      <Control {...props} />
    </div>
  )
}

// Superficie "hundida" reutilizable para chips, tracks y cajas informativas
// que no son inputs pero comparten el mismo tinte.
export const sunkenSurface = {
  background: 'rgba(var(--ink-rgb),.05)',
  border: '1px solid rgba(var(--ink-rgb),.1)',
  borderRadius: 'var(--ds-radius-control)',
}
