import { cn, GlassLayers, glassSurfaceVariants } from './GlassSurface'

// Tarjeta de vidrio del sistema. Antes era un <div> plano que pintaba fondo,
// borde y box-shadow en el mismo elemento; ahora delega en las tres capas del
// sistema Glass (ver "SISTEMA GLASS — cajas" en src/index.css).
//
// La API no cambia: variant / padding / radius / className / style siguen
// significando lo mismo, y el elemento sigue siendo el que recibe el layout,
// así que los call-sites que le pasan `flex-1`, `sticky top-0` o
// `display:flex` por style siguen funcionando igual.
//
// Para retintar el borde de una tarjeta concreta, sobreescribí la custom
// property en vez del borde: style={{ '--gs-border': '...' }}.
export default function GlassCard({
  children,
  variant = 'light',
  padding = 20,
  radius = 'lg',
  interactive = false,
  clip = false,
  className = '',
  style,
}) {
  return (
    <div
      className={cn(
        glassSurfaceVariants({
          elevation: variant === 'dark' ? 'dark' : 'base',
          radius,
          interactive,
          clip,
        }),
        className
      )}
      style={{ padding, ...style }}
    >
      <GlassLayers />
      {children}
    </div>
  )
}
