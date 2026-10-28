import { z } from 'zod';
import { ESTADOS_EJEMPLAR, MODALIDADES } from '../models/ejemplar.model';
import { numeroOpcional, ordenQuery, textoOpcional } from './comunes';

const modalidad = z.enum(MODALIDADES, { error: 'Selecciona una modalidad' });
const idUbicacion = z
  .number({ error: 'Selecciona una ubicación' })
  .int()
  .positive('Selecciona una ubicación');

export const registrarEjemplaresSchema = z.object({
  isbn: z.string({ error: 'Selecciona un libro' }).trim().min(1, 'Selecciona un libro'),
  cantidad: z
    .number({ error: 'La cantidad debe ser un número entero entre 1 y 50' })
    .int('La cantidad debe ser un número entero entre 1 y 50')
    .min(1, 'La cantidad debe ser un número entero entre 1 y 50')
    .max(50, 'La cantidad debe ser un número entero entre 1 y 50'),
  modalidad,
  idUbicacion,
});

export const actualizarEjemplarSchema = z.object({
  modalidad,
  idUbicacion,
  estado: z.enum(ESTADOS_EJEMPLAR, { error: 'Estado inválido' }),
});

export const filtrosEjemplarSchema = z.object({
  isbn: textoOpcional,
  idEjemplar: numeroOpcional,
  estado: z.enum(ESTADOS_EJEMPLAR).optional().catch(undefined),
  modalidad: z.enum(MODALIDADES).optional().catch(undefined),
  idUbicacion: numeroOpcional,
  ...ordenQuery,
});
