import type { PropsWithChildren } from 'react';

export function InlineState({ children, danger = false }: PropsWithChildren<{ danger?: boolean }>) {
  return <p className={danger ? 'portal-state portal-state-error' : 'portal-state'}>{children}</p>;
}
