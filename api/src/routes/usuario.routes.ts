import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import {
  actualizarUsuarioSchema,
  crearUsuarioSchema,
  filtrosUsuarioSchema,
} from '../validators/usuario.schema';

export const usuarioRouter = Router();

usuarioRouter.use(requierePermiso('usuarios.gestionar'));
usuarioRouter.get('/', validar(filtrosUsuarioSchema, 'query'), UsuarioController.listar);
usuarioRouter.post('/', validar(crearUsuarioSchema), UsuarioController.crear);
usuarioRouter.get('/:matricula', UsuarioController.obtener);
usuarioRouter.put('/:matricula', validar(actualizarUsuarioSchema), UsuarioController.actualizar);
usuarioRouter.patch('/:matricula/desactivar', UsuarioController.desactivar);
usuarioRouter.patch('/:matricula/reactivar', UsuarioController.reactivar);
