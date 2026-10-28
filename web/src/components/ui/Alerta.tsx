import type { ReactNode } from 'react';
import { Icono } from './Icono';

type Tipo = 'info' | 'exito' | 'error' | 'advertencia';

const ICONOS = { info: 'info', exito: 'check', error: 'alerta', advertencia: 'alerta' } as const;

export function Alerta({ tipo = 'info', children }: { tipo?: Tipo; children: ReactNode }) {
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono nombre={ICONOS[tipo]} tamano={18} />
      <div>{children}</div>
    </div>
  );
}
