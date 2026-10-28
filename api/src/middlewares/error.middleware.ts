import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

export function rutaNoEncontrada(req: Request, _res: Response, next: NextFunction): void {
  next(HttpError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

/** Convierte cualquier error en una respuesta JSON uniforme: { error: { mensaje, codigo } }. */
export function manejarErrores(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { mensaje: error.message, codigo: error.codigo } });
    return;
  }
  const errorMysql = error as { code?: string };
  if (errorMysql.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: { mensaje: 'El registro ya existe', codigo: 'DUPLICADO' } });
    return;
  }
  if (errorMysql.code === 'ER_ROW_IS_REFERENCED_2') {
    res
      .status(409)
      .json({ error: { mensaje: 'El registro tiene información relacionada', codigo: 'EN_USO' } });
    return;
  }
  console.error(error);
  res.status(500).json({ error: { mensaje: 'Error interno del servidor', codigo: 'ERROR_INTERNO' } });
}
