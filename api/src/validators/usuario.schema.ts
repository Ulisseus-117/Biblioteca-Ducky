import { z } from 'zod';
import { numeroOpcional, ordenQuery, textoOpcional } from './comunes';

const matricula = z
  .string({ error: 'La matrícula es obligatoria' })
  .trim()
  .min(1, 'La matrícula es obligatoria')
  .max(30, 'La matrícula admite máximo 30 caracteres')
  .regex(/^[A-Za-z0-9_-]+$/, 'La matrícula solo admite letras, números, guion y guion bajo');

const contrasena = z.string().min(4, 'La contraseña debe tener al menos 4 caracteres').max(72);

export const crearUsuarioSchema = z.object({
  matricula,
  contrasena: z.string({ error: 'La contraseña es obligatoria' }).pipe(contrasena),
  idRol: z.number({ error: 'Selecciona un rol' }).int().positive('Selecciona un rol'),
});

export const actualizarUsuarioSchema = z.object({
  idRol: z.number().int().positive().optional(),
  contrasena: z.preprocess((v) => (v === '' ? undefined : v), contrasena.optional()),
});

export const filtrosUsuarioSchema = z.object({
  matricula: textoOpcional,
  idRol: numeroOpcional,
  estado: z.enum(['activo', 'inactivo', 'todos']).optional(),
  ...ordenQuery,
});
