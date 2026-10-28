import { Router } from 'express';
import { SolicitudController } from '../controllers/solicitud.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import {
  crearSolicitudSchema,
  estadoSolicitudSchema,
  filtrosSolicitudSchema,
} from '../validators/solicitud.schema';

export const solicitudRouter = Router();

solicitudRouter.use(requierePermiso('solicitudes.gestionar'));
solicitudRouter.get('/', validar(filtrosSolicitudSchema, 'query'), SolicitudController.listar);
solicitudRouter.get('/:id', SolicitudController.obtener);
solicitudRouter.post('/', validar(crearSolicitudSchema), SolicitudController.crear);
solicitudRouter.patch('/:id/estado', validar(estadoSolicitudSchema), SolicitudController.cambiarEstado);
