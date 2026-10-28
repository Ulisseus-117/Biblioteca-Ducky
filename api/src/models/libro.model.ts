import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';
import type { Autor, Tema } from './catalogo.model';
import { calcularOffset, columnaOrden, direccionOrden, Pagina, TAMANO_PAGINA } from '../utils/pagination';

export interface LibroResumen {
  isbn: string;
  titulo: string;
  autores: string[];
  temas: string[];
  numEjemplares: number;
  disponibles: number;
}

export interface Libro {
  isbn: string;
  titulo: string;
  editorial: string | null;
  anio: number | null;
  idioma: string | null;
  precioUltimaCompraUsd: number | null;
  numEjemplares: number;
  disponibles: number;
  autores: Autor[];
  temas: Tema[];
}

export interface DatosLibro {
  isbn: string;
  titulo: string;
  editorial?: string | null;
  anio?: number | null;
  idioma?: string | null;
  precioUltimaCompraUsd?: number | null;
  idAutores: number[];
  idTemas: number[];
}

export interface FiltrosLibro {
  q?: string;
  titulo?: string;
  autor?: string;
  idTema?: number;
  isbn?: string;
  editorial?: string;
  anio?: number;
  ejemplaresMin?: number;
  ejemplaresMax?: number;
  orden?: string;
  dir?: string;
  pagina: number;
}

const COLUMNAS_ORDEN = {
  titulo: 'l.titulo',
  autor: 'autores',
  isbn: 'l.isbn',
  tema: 'temas',
  ejemplares: 'l.num_ejemplares',
};

const SEPARADOR = '||';

function separar(valor: string | null): string[] {
  return valor ? valor.split(SEPARADOR) : [];
}

function construirFiltros(filtros: FiltrosLibro): { where: string; valores: unknown[] } {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  const autorExiste = `EXISTS (SELECT 1 FROM libro_autor la2 JOIN autor a2 ON a2.id_autor = la2.id_autor
                        WHERE la2.isbn = l.isbn AND a2.nombre LIKE ?)`;

  if (filtros.q) {
    // Búsqueda general: título, autor, ISBN o editorial
    condiciones.push(`(l.titulo LIKE ? OR l.isbn LIKE ? OR l.editorial LIKE ? OR ${autorExiste})`);
    const patron = `%${filtros.q}%`;
    valores.push(patron, patron, patron, patron);
  }
  if (filtros.titulo) {
    condiciones.push('l.titulo LIKE ?');
    valores.push(`%${filtros.titulo}%`);
  }
  if (filtros.autor) {
    condiciones.push(autorExiste);
    valores.push(`%${filtros.autor}%`);
  }
  if (filtros.idTema) {
    condiciones.push('EXISTS (SELECT 1 FROM libro_tema lt2 WHERE lt2.isbn = l.isbn AND lt2.id_tema = ?)');
    valores.push(filtros.idTema);
  }
  if (filtros.isbn) {
    condiciones.push('l.isbn LIKE ?');
    valores.push(`%${filtros.isbn}%`);
  }
  if (filtros.editorial) {
    condiciones.push('l.editorial LIKE ?');
    valores.push(`%${filtros.editorial}%`);
  }
  if (filtros.anio) {
    condiciones.push('l.anio = ?');
    valores.push(filtros.anio);
  }
  if (filtros.ejemplaresMin !== undefined) {
    condiciones.push('l.num_ejemplares >= ?');
    valores.push(filtros.ejemplaresMin);
  }
  if (filtros.ejemplaresMax !== undefined) {
    condiciones.push('l.num_ejemplares <= ?');
    valores.push(filtros.ejemplaresMax);
  }
  return { where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '', valores };
}

async function guardarRelaciones(conexion: PoolConnection, isbn: string, datos: DatosLibro): Promise<void> {
  await conexion.execute('DELETE FROM libro_autor WHERE isbn = ?', [isbn]);
  await conexion.execute('DELETE FROM libro_tema WHERE isbn = ?', [isbn]);
  for (const idAutor of new Set(datos.idAutores)) {
    await conexion.execute('INSERT INTO libro_autor (isbn, id_autor) VALUES (?, ?)', [isbn, idAutor]);
  }
  for (const idTema of new Set(datos.idTemas)) {
    await conexion.execute('INSERT INTO libro_tema (isbn, id_tema) VALUES (?, ?)', [isbn, idTema]);
  }
}

export const LibroModel = {
  async listar(filtros: FiltrosLibro): Promise<Pagina<LibroResumen>> {
    const { where, valores } = construirFiltros(filtros);
    const orden = columnaOrden(filtros.orden, COLUMNAS_ORDEN, 'titulo');

    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT l.isbn, l.titulo, l.num_ejemplares AS numEjemplares,
              (SELECT GROUP_CONCAT(a.nombre ORDER BY a.nombre SEPARATOR '${SEPARADOR}')
                 FROM libro_autor la JOIN autor a ON a.id_autor = la.id_autor WHERE la.isbn = l.isbn) AS autores,
              (SELECT GROUP_CONCAT(t.nombre ORDER BY t.nombre SEPARATOR '${SEPARADOR}')
                 FROM libro_tema lt JOIN tema t ON t.id_tema = lt.id_tema WHERE lt.isbn = l.isbn) AS temas,
              (SELECT COUNT(*) FROM ejemplar e WHERE e.isbn = l.isbn AND e.estado = 'Disponible') AS disponibles
         FROM libro l
         ${where}
        ORDER BY ${orden} ${direccionOrden(filtros.dir)}, l.titulo
        LIMIT ? OFFSET ?`,
      [...valores, TAMANO_PAGINA, calcularOffset(filtros.pagina)],
    );
    const [conteo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM libro l ${where}`,
      valores,
    );

    return {
      datos: filas.map((f) => ({
        isbn: f.isbn,
        titulo: f.titulo,
        autores: separar(f.autores),
        temas: separar(f.temas),
        numEjemplares: f.numEjemplares,
        disponibles: Number(f.disponibles),
      })),
      total: conteo[0].total,
      pagina: filtros.pagina,
      tamanoPagina: TAMANO_PAGINA,
    };
  },

  async listarOpciones(): Promise<{ isbn: string; titulo: string }[]> {
    const [filas] = await pool.query<RowDataPacket[]>('SELECT isbn, titulo FROM libro ORDER BY titulo');
    return filas as { isbn: string; titulo: string }[];
  },

  async buscarPorIsbn(isbn: string): Promise<Libro | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT l.isbn, l.titulo, l.editorial, l.anio, l.idioma,
              l.precio_ultima_compra_usd AS precioUltimaCompraUsd, l.num_ejemplares AS numEjemplares,
              (SELECT COUNT(*) FROM ejemplar e WHERE e.isbn = l.isbn AND e.estado = 'Disponible') AS disponibles
         FROM libro l WHERE l.isbn = ?`,
      [isbn],
    );
    if (!filas[0]) return null;

    const [autores] = await pool.query<RowDataPacket[]>(
      `SELECT a.id_autor AS idAutor, a.nombre FROM libro_autor la JOIN autor a ON a.id_autor = la.id_autor
        WHERE la.isbn = ? ORDER BY a.nombre`,
      [isbn],
    );
    const [temas] = await pool.query<RowDataPacket[]>(
      `SELECT t.id_tema AS idTema, t.nombre FROM libro_tema lt JOIN tema t ON t.id_tema = lt.id_tema
        WHERE lt.isbn = ? ORDER BY t.nombre`,
      [isbn],
    );
    return {
      ...(filas[0] as Omit<Libro, 'autores' | 'temas'>),
      disponibles: Number(filas[0].disponibles),
      autores: autores as Autor[],
      temas: temas as Tema[],
    };
  },

  async existe(isbn: string): Promise<boolean> {
    const [filas] = await pool.query<RowDataPacket[]>('SELECT 1 FROM libro WHERE isbn = ?', [isbn]);
    return filas.length > 0;
  },

  /** Inserta el libro con sus autores y temas. Acepta una conexión para usarse dentro de otra transacción. */
  async crear(datos: DatosLibro, conexionExterna?: PoolConnection): Promise<void> {
    const conexion = conexionExterna ?? (await pool.getConnection());
    try {
      if (!conexionExterna) await conexion.beginTransaction();
      await conexion.execute(
        `INSERT INTO libro (isbn, titulo, editorial, anio, idioma, precio_ultima_compra_usd)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          datos.isbn,
          datos.titulo,
          datos.editorial ?? null,
          datos.anio ?? null,
          datos.idioma ?? null,
          datos.precioUltimaCompraUsd ?? null,
        ],
      );
      await guardarRelaciones(conexion, datos.isbn, datos);
      if (!conexionExterna) await conexion.commit();
    } catch (error) {
      if (!conexionExterna) await conexion.rollback();
      throw error;
    } finally {
      if (!conexionExterna) conexion.release();
    }
  },

  /** Actualiza la ficha. Si cambia el ISBN, las llaves foráneas se actualizan en cascada. */
  async actualizar(isbnActual: string, datos: DatosLibro): Promise<void> {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      await conexion.execute(
        `UPDATE libro SET isbn = ?, titulo = ?, editorial = ?, anio = ?, idioma = ?, precio_ultima_compra_usd = ?
          WHERE isbn = ?`,
        [
          datos.isbn,
          datos.titulo,
          datos.editorial ?? null,
          datos.anio ?? null,
          datos.idioma ?? null,
          datos.precioUltimaCompraUsd ?? null,
          isbnActual,
        ],
      );
      await guardarRelaciones(conexion, datos.isbn, datos);
      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  async contarEjemplaresOcupados(isbn: string): Promise<number> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM ejemplar WHERE isbn = ? AND estado IN ('Prestado', 'Reservado')`,
      [isbn],
    );
    return Number(filas[0].total);
  },

  /** Préstamos, reservas y solicitudes de compra que hacen referencia al libro. */
  async contarHistorial(isbn: string): Promise<number> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT (SELECT COUNT(*) FROM prestamo p JOIN ejemplar e ON e.id_ejemplar = p.id_ejemplar WHERE e.isbn = ?)
            + (SELECT COUNT(*) FROM reserva_espera WHERE isbn = ?)
            + (SELECT COUNT(*) FROM detalle_solicitud WHERE isbn = ?) AS total`,
      [isbn, isbn, isbn],
    );
    return Number(filas[0].total);
  },

  async eliminarConEjemplares(isbn: string): Promise<void> {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      await conexion.execute('DELETE FROM ejemplar WHERE isbn = ?', [isbn]);
      await conexion.execute('DELETE FROM libro WHERE isbn = ?', [isbn]);
      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },
};
