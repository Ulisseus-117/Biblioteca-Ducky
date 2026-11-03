import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import { crearPerfilSchema, permisosPerfilSchema } from '../validators/perfil.schema';

export const perfilRouter = Router();

perfilRouter.use(requierePermiso('perfiles.gestionar'));
perfilRouter.get('/', PerfilController.listar);
perfilRouter.post('/', validar(crearPerfilSchema), PerfilController.crear);
perfilRouter.get('/permisos', PerfilController.permisos);
perfilRouter.get('/:idRol', PerfilController.obtener);
perfilRouter.put('/:idRol/permisos', validar(permisosPerfilSchema), PerfilController.actualizarPermisos);
