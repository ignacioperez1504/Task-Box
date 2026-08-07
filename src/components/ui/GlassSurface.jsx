import { cva } from 'class-variance-authority'

// Une varios class names ignorando los vacíos/falsy. Equivalente al `cn` del
// componente de referencia; sin `clsx`/`tailwind-merge` porque el proyecto no
// los tiene y aquí no hay conflictos de utilidades que resolver.
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export const glassSurfaceVariants = cva('glass-surface', {
  variants: {
    elevation: {
      // Tarjetas y paneles apoyados sobre el fondo de la app.
      base: '',
      // Modales, dropdowns y cualquier capa por encima del contenido.
      raised: 'glass-surface--raised',
      // Filas, chips y cajas informativas dentro de otra superficie.
      sunken: 'glass-surface--sunken',
      // Vidrio oscuro sobre fondo claro (la antigua variante `dark`).
      dark: 'glass-surface--dark',
    },
    radius: {
      lg: 'glass-surface--radius-lg',
      md: 'glass-surface--radius-md',
      sm: 'glass-surface--radius-sm',
      control: 'glass-surface--radius-control',
      full: 'glass-surface--radius-full',
    },
    interactive: {
      true: 'glass-surface--interactive',
      false: '',
    },
    // Recorta el contenido a las esquinas redondeadas. Mueve la sombra del
    // layer al elemento, porque overflow:hidden recortaría la del layer.
    clip: {
      true: 'glass-surface--clip',
      false: '',
    },
  },
  defaultVariants: {
    elevation: 'base',
    radius: 'lg',
    interactive: false,
    clip: false,
  },
})

// Las dos capas que van detrás del contenido de cualquier caja: el vidrio y,
// separada de él, la sombra. Se montan como hijos absolutos con z-index
// negativo en vez de envolver la caja en un <div>, para que el elemento siga
// conservando su propio layout (flex-1, sticky, min-h-*, display:flex…).
//
// La caja las contiene con `z-index: 0` (ver index.css). Si algún call-site
// necesita apilar por encima, cualquier `z-*` propio sirve igual.
//
// Se declara primero, antes del contenido real, para que quede claro en el
// árbol que son fondo y no contenido.
export function GlassLayers() {
  return (
    <>
      <span className="glass-surface-glass" aria-hidden="true" />
      <span className="glass-surface-shadow" aria-hidden="true" />
    </>
  )
}

// Caja de vidrio genérica. Para el caso más común usá <GlassCard>; este
// componente existe para superficies que necesitan controlar su propio
// elemento (as="section", "li", "aside"…).
export default function GlassSurface({
  as: Tag = 'div',
  elevation,
  radius,
  interactive,
  clip,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(glassSurfaceVariants({ elevation, radius, interactive, clip }), className)}
      {...props}
    >
      <GlassLayers />
      {children}
    </Tag>
  )
}
