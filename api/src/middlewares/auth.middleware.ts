import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UsuarioSesion } from '../models/usuario.model';
import { HttpError } from '../utils/http-error';

/** Verifica el token "Bearer" y coloca al usuario en req.usuario. */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith('Bearer ')) {
    throw HttpError.unauthorized('Inicia sesión para continuar');
  }
  try {
    req.usuario = jwt.verify(encabezado.slice(7), env.jwt.secret) as UsuarioSesion;
    next();
  } catch {
    throw new HttpError(401, 'Tu sesión expiró. Inicia sesión de nuevo.', 'SESION_EXPIRADA');
  }
}

/** Permite el paso solo si el rol del usuario tiene alguno de los permisos indicados (tabla rol_permiso). */
export function requierePermiso(...permisos: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const tienePermiso = permisos.some((p) => req.usuario?.permisos.includes(p));
    if (!tienePermiso) {
      throw HttpError.forbidden('Tu perfil no tiene permiso para realizar esta acción');
    }
    next();
  };
}
