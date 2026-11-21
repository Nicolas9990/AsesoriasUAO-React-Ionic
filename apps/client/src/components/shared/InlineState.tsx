// Mensaje reutilizable para mostrar información, carga vacía o errores en una pantalla.
import type { PropsWithChildren } from 'react';

// `children` es el texto interno; `danger` cambia el estilo a error.
export function InlineState({ children, danger = false }: PropsWithChildren<{ danger?: boolean }>) {
  return <p className={danger ? 'portal-state portal-state-error' : 'portal-state'}>{children}</p>;
}
