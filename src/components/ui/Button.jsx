import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './GlassSurface'

// Un único lenguaje de botón para toda la app, ahora sobre el sistema Glass de
// tres capas (contenedor + vidrio + sombra hermana); ver el bloque
// "SISTEMA GLASS" en src/index.css.
//
// Reparto de responsabilidades entre los tres cva:
//   - wrap  → variante (paleta y radio, vía las custom properties --gb-*)
//   - glass → la superficie; su pintura vive entera en CSS
//   - text  → tamaño (padding y tipografía)
// El tamaño va en el contenido y no en el <button> porque el user-agent impone
// un `font` propio al elemento: declararlo en el hijo lo gana por herencia sin
// necesidad de !important.
//
// Sobre el reset del <button>: el componente de referencia traía `all-unset` en
// el string base. No es una utilidad de Tailwind y no genera ninguna regla, así
// que nunca aplicó nada. Su equivalente real, `[all:unset]`, sí se genera, pero
// Tailwind lo ordena dentro de @layer utilities después de `relative`,
// `rounded-*`, `cursor-*` y `transition-*`, de modo que las borraría todas. El
// reset vive en la regla `.glass-button` de index.css, que al estar fuera de
// toda @layer gana a cualquier utilidad sin arrasar con el resto. Por lo mismo
// se quitaron del string base `rounded-full` y `transition-all`: `.glass-button`
// define radio y transición propios y los dejaba inertes.

const glassButtonVariants = cva('glass-button relative isolate cursor-pointer')

// El radio y la paleta viven en el contenedor, porque las tres capas
// (vidrio, contenido y sombra) tienen que compartirlos.
const glassButtonWrapVariants = cva('glass-button-wrap cursor-pointer', {
  variants: {
    variant: {
      primary: 'glass-button-wrap--primary',
      secondary: 'glass-button-wrap--secondary',
      ghost: 'glass-button-wrap--ghost',
      danger: 'glass-button-wrap--danger',
      'danger-outline': 'glass-button-wrap--danger-outline',
      success: 'glass-button-wrap--success',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

// El padding de cada tamaño vive en index.css y no en utilidades `px-*`/`py-*`:
// el reset global del proyecto (`*{padding:0}`, sin capa) le gana a
// @layer utilities y deja en cero cualquier utilidad de espaciado de Tailwind.
const glassButtonTextVariants = cva('glass-button-text relative select-none', {
  variants: {
    size: {
      default: 'glass-button-text--default',
      sm: 'glass-button-text--sm',
      lg: 'glass-button-text--lg',
      icon: 'glass-button-text--icon',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

// El sistema anterior nombraba los tamaños sm/md/lg. `md` se mantiene como
// alias de `default` para no tocar los call-sites existentes.
const SIZE_ALIASES = { md: 'default' }

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    pulse = false,
    className = '',
    contentClassName,
    style,
    ...props
  },
  ref
) {
  const resolvedSize = SIZE_ALIASES[size] || size

  return (
    <div
      className={cn(glassButtonWrapVariants({ variant }), className)}
      data-full-width={fullWidth ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      style={{
        animation: pulse && !disabled ? 'pulse-terracotta 3s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <button
        className={glassButtonVariants()}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <span className={cn(glassButtonTextVariants({ size: resolvedSize }), contentClassName)}>
          {children}
        </span>
      </button>
      <div className="glass-button-shadow" aria-hidden="true"></div>
    </div>
  )
})

export default Button
export { Button, glassButtonVariants, glassButtonWrapVariants, glassButtonTextVariants }
