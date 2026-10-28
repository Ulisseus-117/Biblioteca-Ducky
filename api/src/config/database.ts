import mysql from 'mysql2/promise';
import { env } from './env';

/** Pool de conexiones a MySQL compartido por todos los modelos. */
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
});

/** Verifica la conexión al iniciar el servidor. */
export async function probarConexion(): Promise<void> {
  const conexion = await pool.getConnection();
  await conexion.ping();
  conexion.release();
}
