import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string | null;
}

export const RolModel = {
  async listar(): Promise<Rol[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_rol AS idRol, nombre, descripcion FROM rol ORDER BY id_rol',
    );
    return filas as Rol[];
  },

  async buscarPorId(idRol: number): Promise<Rol | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_rol AS idRol, nombre, descripcion FROM rol WHERE id_rol = ?',
      [idRol],
    );
    return (filas[0] as Rol) ?? null;
  },

  async permisosDeRol(idRol: number): Promise<string[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT p.nombre_permiso AS nombre
         FROM rol_permiso rp
         JOIN permiso p ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ?`,
      [idRol],
    );
    return filas.map((f) => f.nombre as string);
  },
};
