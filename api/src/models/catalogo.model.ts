import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';

/** Catálogos de apoyo: autores, temas y ubicaciones. */
export interface Autor {
  idAutor: number;
  nombre: string;
}

export interface Tema {
  idTema: number;
  nombre: string;
}

export interface Ubicacion {
  idUbicacion: number;
  estante: number;
  seccion: number;
}

export const CatalogoModel = {
  async listarAutores(): Promise<Autor[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_autor AS idAutor, nombre FROM autor ORDER BY nombre',
    );
    return filas as Autor[];
  },

  async crearAutor(nombre: string): Promise<Autor> {
    const [resultado] = await pool.execute<ResultSetHeader>('INSERT INTO autor (nombre) VALUES (?)', [
      nombre,
    ]);
    return { idAutor: resultado.insertId, nombre };
  },

  /** Reutiliza el autor si ya existe con el mismo nombre; si no, lo crea. */
  async buscarOCrearAutor(nombre: string, conexion: PoolConnection): Promise<number> {
    const [filas] = await conexion.query<RowDataPacket[]>(
      'SELECT id_autor FROM autor WHERE nombre = ? LIMIT 1',
      [nombre],
    );
    if (filas[0]) return filas[0].id_autor;
    const [resultado] = await conexion.execute<ResultSetHeader>('INSERT INTO autor (nombre) VALUES (?)', [
      nombre,
    ]);
    return resultado.insertId;
  },

  async listarTemas(): Promise<Tema[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_tema AS idTema, nombre FROM tema ORDER BY nombre',
    );
    return filas as Tema[];
  },

  async buscarTemaPorNombre(nombre: string): Promise<Tema | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_tema AS idTema, nombre FROM tema WHERE nombre = ?',
      [nombre],
    );
    return (filas[0] as Tema) ?? null;
  },

  async crearTema(nombre: string): Promise<Tema> {
    const [resultado] = await pool.execute<ResultSetHeader>('INSERT INTO tema (nombre) VALUES (?)', [nombre]);
    return { idTema: resultado.insertId, nombre };
  },

  async listarUbicaciones(): Promise<Ubicacion[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_ubicacion AS idUbicacion, estante, seccion FROM ubicacion ORDER BY estante, seccion',
    );
    return filas as Ubicacion[];
  },

  async existeUbicacion(idUbicacion: number): Promise<boolean> {
    const [filas] = await pool.query<RowDataPacket[]>('SELECT 1 FROM ubicacion WHERE id_ubicacion = ?', [
      idUbicacion,
    ]);
    return filas.length > 0;
  },
};
