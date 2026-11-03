import { z } from 'zod';

const permisos = z.array(z.number().int().positive(), { error: 'Indica los permisos del perfil' });

export const crearPerfilSchema = z.object({
  nombre: z
    .string({ error: 'El nombre del perfil es obligatorio' })
    .trim()
    .min(1, 'El nombre del perfil es obligatorio')
    .max(100, 'El nombre admite máximo 100 caracteres'),
  descripcion: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined),
    z.string().max(500, 'La descripción admite máximo 500 caracteres').optional(),
  ),
  permisos: permisos.default([]),
});

export const permisosPerfilSchema = z.object({ permisos });
