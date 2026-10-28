import type { UsuarioSesion } from '../models/usuario.model';

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioSesion;
    }
  }
}

export {};
