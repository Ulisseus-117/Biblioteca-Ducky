import type { ReactNode } from 'react';

export type ColorInsignia = 'azul' | 'verde' | 'rojo' | 'gris' | 'ambar' | 'naranja';

export function Insignia({ color = 'gris', children }: { color?: ColorInsignia; children: ReactNode }) {
  return <span className={`badge badge--${color}`}>{children}</span>;
}
