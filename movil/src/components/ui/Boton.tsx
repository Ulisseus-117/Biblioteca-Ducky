import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  chico?: boolean;
  ancho?: boolean;
}

/** Botón del Design System: primario (azul relleno) o secundario (contorno azul). */
export function Boton({
  variante = 'primario',
  chico = false,
  ancho = false,
  className = '',
  type = 'button',
  ...props
}: Props) {
  const clases = ['btn', `btn--${variante}`, chico && 'btn--chico', ancho && 'btn--ancho', className]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={clases} {...props} />;
}
