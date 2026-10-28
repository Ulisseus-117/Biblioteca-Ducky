export const TAMANO_PAGINA = 10;

export interface Pagina<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
}

export function calcularOffset(pagina: number): number {
  return (Math.max(pagina, 1) - 1) * TAMANO_PAGINA;
}

/**
 * Devuelve la columna SQL para ORDER BY solo si está en la lista blanca,
 * para evitar inyección SQL en el ordenamiento.
 */
export function columnaOrden(
  solicitada: string | undefined,
  permitidas: Record<string, string>,
  porDefecto: string,
): string {
  return (solicitada && permitidas[solicitada]) || permitidas[porDefecto];
}

export function direccionOrden(dir: string | undefined): 'ASC' | 'DESC' {
  return dir === 'desc' ? 'DESC' : 'ASC';
}
