import type { ReactNode } from 'react';

/** Renglón "Etiqueta ........ Valor" de la ficha del libro y de las tarjetas de ejemplar. */
export function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div className="fila-dato">
      <span className="fila-dato__etiqueta">{etiqueta}</span>
      <span className="fila-dato__valor">{valor ?? '—'}</span>
    </div>
  );
}
