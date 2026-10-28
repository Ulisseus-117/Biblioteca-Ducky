import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { manejarErrores, rutaNoEncontrada } from './middlewares/error.middleware';
import { apiRouter } from './routes';

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use('/api', apiRouter);
app.use(rutaNoEncontrada);
app.use(manejarErrores);
