import type { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';

export const UsuarioController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const { estado, idRol, ...resto } = res.locals.query;
    const activo = estado === 'todos' ? undefined : estado !== 'inactivo';
    res.json(await UsuarioService.listar({ ...resto, idRol, activo }));
  },

  async obtener(req: Request<{ matricula: string }>, res: Response): Promise<void> {
    res.json(await UsuarioService.obtener(req.params.matricula));
  },

  async crear(_req: Request, res: Response): Promise<void> {
    const { matricula, contrasena, idRol } = res.locals.body;
    res.status(201).json(await UsuarioService.crear(matricula, contrasena, idRol));
  },

  async actualizar(req: Request<{ matricula: string }>, res: Response): Promise<void> {
    res.json(await UsuarioService.actualizar(req.params.matricula, res.locals.body));
  },

  async desactivar(req: Request<{ matricula: string }>, res: Response): Promise<void> {
    res.json(await UsuarioService.desactivar(req.params.matricula, req.usuario!.matricula));
  },

  async reactivar(req: Request<{ matricula: string }>, res: Response): Promise<void> {
    res.json(await UsuarioService.reactivar(req.params.matricula));
  },
};
