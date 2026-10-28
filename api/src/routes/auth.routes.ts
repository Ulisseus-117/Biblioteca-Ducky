import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.schema';

export const authRouter = Router();

authRouter.post('/login', validar(loginSchema), AuthController.login);
authRouter.get('/perfil', autenticar, AuthController.perfil);
