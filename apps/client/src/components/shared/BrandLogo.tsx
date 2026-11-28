/** Logotipo oficial UAO. Versión positiva (rojo) o negativa (crema) según el fondo.
 *  Respetar área de protección y tamaño mínimo digital (50 px) del manual de identidad. */
export function BrandLogo({ negative = false, height = 44 }: { negative?: boolean; height?: number }) {
  return <img
    className={`brand-logo${negative ? ' brand-logo-negative' : ''}`}
    src="/brand/uao-logo.webp"
    alt="UAO"
    style={{ height }}
    draggable={false}
  />;
}
