import { z } from 'zod';
import { ESTADOS_SOLICITUD } from '../models/solicitud.model';
import { numeroOpcional, ordenQuery, textoOpcional } from './comunes';

const numEjemplares = z
  .number({ error: 'Los ejemplares deben ser un entero mayor a 0' })
  .int('Los ejemplares deben ser un entero mayor a 0')
  .min(1, 'Los ejemplares deben ser un entero mayor a 0');
const costoUnitario = z
  .number({ error: 'El costo unitario debe ser mayor o igual a 0' })
  .min(0, 'El costo unitario debe ser mayor o igual a 0');

export const crearSolicitudSchema = z.object({
  lineas: z
    .array(
      z.object({
        isbn: z.string().trim().min(1, 'Selecciona un libro'),
        numEjemplares,
        costoUnitario,
        // Si el libro no existe en el catálogo, se da de alta primero (decisión 8 del modelo)
        libroNuevo: z
          .object({
            titulo: z.string().trim().min(1, 'El título del libro nuevo es obligatorio'),
            autor: z.string().trim().min(1, 'El autor del libro nuevo es obligatorio'),
          })
          .optional(),
      }),
    )
    .min(1, 'Agrega al menos un libro a la solicitud'),
});

export const estadoSolicitudSchema = z.object({
  estado: z.enum(ESTADOS_SOLICITUD, { error: 'Estado inválido' }),
});

export const filtrosSolicitudSchema = z.object({
  folio: numeroOpcional,
  fechaDesde: textoOpcional,
  fechaHasta: textoOpcional,
  estado: z.enum(ESTADOS_SOLICITUD).optional().catch(undefined),
  costoMin: numeroOpcional,
  costoMax: numeroOpcional,
  ...ordenQuery,
});
