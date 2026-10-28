import type { ButtonHTMLAttributes } from 'react';
import { Icono, type NombreIcono } from './Icono';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icono: NombreIcono;
  etiqueta: string;
  variante?: 'primario' | 'peligro' | 'neutro' | 'exito';
}

export function BotonIcono({ icono, etiqueta, variante = 'primario', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--${variante} ${className}`}
      aria-label={etiqueta}
      title={etiqueta}
      {...props}
    >
      <Icono nombre={icono} tamano={variante === 'neutro' ? 18 : 16} />
    </button>
  );
}
