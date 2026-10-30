import type { Ubicacion } from '../types/modelos';

export const folioEjemplar = (id: number): string => `EJ-${String(id).padStart(6, '0')}`;

/** "EJ-000210" o "210" → 210. Devuelve '' si no es un folio válido. */
export const idDeFolio = (folio: string): number | '' => {
  const digitos = folio.trim().toUpperCase().replace(/^EJ-?/, '');
  return /^\d+$/.test(digitos) ? Number(digitos) : '';
};

export const textoUbicacion = (u: Pick<Ubicacion, 'estante' | 'seccion'>): string =>
  `Estante ${u.estante}, Sección ${u.seccion}`;

/** "2026-10-15" → "15/10/2026" */
export const formatoFecha = (fecha: string): string => {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

export const fechaDeHoy = (): string => {
  const hoy = new Date();
  const dosDigitos = (n: number) => String(n).padStart(2, '0');
  return `${dosDigitos(hoy.getDate())}/${dosDigitos(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
};

/** "1 libro" / "2 libros" */
export const plural = (cantidad: number, singular: string, pluralTexto: string): string =>
  `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;

/** Convierte el valor de un campo numérico a número o '' si está vacío. */
export const numeroOVacio = (valor: string | null | undefined): number | '' =>
  !valor || valor.trim() === '' ? '' : Number(valor);
