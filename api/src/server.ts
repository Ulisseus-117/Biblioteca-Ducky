import { app } from './app';
import { probarConexion } from './config/database';
import { env } from './config/env';

async function iniciar(): Promise<void> {
  try {
    await probarConexion();
    console.info(`Conectado a MySQL (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (error) {
    console.error('No se pudo conectar a MySQL. Revisa que el servicio esté encendido y los datos de .env.');
    console.error(error);
    process.exit(1);
  }
  app.listen(env.port, () => {
    console.info(`API de la Biblioteca Ducky escuchando en http://localhost:${env.port}/api`);
  });
}

void iniciar();
