import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware';
import { authRouter } from './auth.routes';
import { catalogoRouter } from './catalogo.routes';
import { ejemplarRouter } from './ejemplar.routes';
import { libroRouter } from './libro.routes';
import { solicitudRouter } from './solicitud.routes';
import { usuarioRouter } from './usuario.routes';

export const apiRouter = Router();

apiRouter.get('/salud', (_req, res) => {
  res.json({ estado: 'ok' });
});
apiRouter.use('/auth', authRouter);

// A partir de aquí todas las rutas requieren sesión
apiRouter.use(autenticar);
apiRouter.use('/usuarios', usuarioRouter);
apiRouter.use('/libros', libroRouter);
apiRouter.use('/ejemplares', ejemplarRouter);
apiRouter.use('/solicitudes', solicitudRouter);
apiRouter.use('/catalogos', catalogoRouter);
