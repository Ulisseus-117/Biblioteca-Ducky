import { z } from 'zod';

/** Número opcional que llega como texto en la query string ("" se ignora). */
export const numeroOpcional = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().finite().optional(),
);

export const textoOpcional = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined),
  z.string().optional(),
);

export const paginaQuery = z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1));

export const ordenQuery = {
  orden: textoOpcional,
  dir: z.enum(['asc', 'desc']).optional(),
  pagina: paginaQuery,
};
