import type { ReactNode } from 'react';
import { Boton } from './Boton';

/** Aviso sencillo con título y botón "Aceptar" (overlays "Descarga completada" y "WhatsApp Web"). */
export function Aviso({
  titulo,
  children,
  alAceptar,
}: {
  titulo: string;
  children: ReactNode;
  alAceptar: () => void;
}) {
  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="aviso">
        <h2 className="aviso__titulo">{titulo}</h2>
        {children}
        <div>
          <Boton onClick={alAceptar}>Aceptar</Boton>
        </div>
      </div>
    </div>
  );
}
