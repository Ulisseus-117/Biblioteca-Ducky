import type { Ubicacion } from '../types/modelos';

export const formatoMoneda = (valor: number): string =>
  valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export const folioEjemplar = (id: number): string => `EJ-${String(id).padStart(6, '0')}`;

export const folioSolicitud = (id: number): string => `SC-${String(id).padStart(4, '0')}`;

/** "2026-10-05" → "05/10/2026" */
export const formatoFecha = (fecha: string): string => {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

export const textoUbicacion = (u: Pick<Ubicacion, 'estante' | 'seccion'>): string =>
  `Estante ${u.estante}, Sección ${u.seccion}`;

/** Convierte el valor de un input numérico a número o '' si está vacío. */
export const numeroOVacio = (valor: string): number | '' => (valor.trim() === '' ? '' : Number(valor));
