import type { ReactNode } from 'react';
import { Icono, type NombreIcono } from './Icono';

interface Props {
  titulo: string;
  icono?: NombreIcono;
  tono?: 'peligro' | 'exito' | 'info';
  children: ReactNode;
  acciones: ReactNode;
}

/** Diálogo centrado para confirmaciones y avisos (pantallas "Confirmación", "Éxito" y "Rechazada"). */
export function Modal({ titulo, icono = 'alerta', tono = 'peligro', children, acciones }: Props) {
  const claseIcono = tono === 'peligro' ? '' : `modal__icono--${tono}`;
  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="modal">
        <div className={`modal__icono ${claseIcono}`}>
          <Icono nombre={icono} tamano={24} />
        </div>
        <h2>{titulo}</h2>
        <p>{children}</p>
        <div className="acciones">{acciones}</div>
      </div>
    </div>
  );
}
