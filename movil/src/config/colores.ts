import type { ColorInsignia } from '../components/ui/Insignia';

/** Colores de la insignia de estado de un ejemplar, tomados del prototipo de Figma (iguales a la web). */
export const COLOR_ESTADO_EJEMPLAR: Record<string, ColorInsignia> = {
  Disponible: 'verde',
  Prestado: 'naranja',
  Reservado: 'azul',
  Dañado: 'rojo',
  Perdido: 'gris',
  Robado: 'rojo',
  Obsoleto: 'gris',
};
