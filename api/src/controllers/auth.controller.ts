import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const AuthController = {
  async login(_req: Request, res: Response): Promise<void> {
    const { matricula, contrasena } = res.locals.body;
    res.json(await AuthService.iniciarSesion(matricula, contrasena));
  },

  perfil(req: Request, res: Response): void {
    res.json({ usuario: req.usuario });
  },
};
