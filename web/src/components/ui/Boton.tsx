import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'suave' | 'peligro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  chico?: boolean;
}

export function Boton({
  variante = 'primario',
  chico = false,
  className = '',
  type = 'button',
  ...props
}: Props) {
  const clases = ['btn', `btn--${variante}`, chico ? 'btn--chico' : '', className].filter(Boolean).join(' ');
  return <button type={type} className={clases} {...props} />;
}
