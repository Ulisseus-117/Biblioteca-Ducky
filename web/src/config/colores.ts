import type { ColorInsignia } from '../components/ui/Insignia';

/** Colores por valor, tomados del prototipo de Figma. */
export const COLOR_ROL: Record<string, ColorInsignia> = {
  Alumno: 'azul',
  Administrador: 'gris',
  Profesor: 'ambar',
  Bibliotecario: 'verde',
};

export const COLOR_ESTADO_EJEMPLAR: Record<string, ColorInsignia> = {
  Disponible: 'verde',
  Prestado: 'naranja',
  Reservado: 'azul',
  Dañado: 'rojo',
  Perdido: 'gris',
  Robado: 'rojo',
  Obsoleto: 'gris',
};

export const COLOR_ESTADO_SOLICITUD: Record<string, ColorInsignia> = {
  'Enviado a tesorería': 'naranja',
  Aceptado: 'verde',
  Rechazado: 'rojo',
};
