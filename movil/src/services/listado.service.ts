import type { Ejemplar, Libro } from '../types/modelos';
import { ejemplaresService } from './ejemplares.service';
import { librosService, type FiltrosLibros } from './libros.service';

export interface LibroConEjemplares {
  libro: Libro;
  ejemplares: Ejemplar[];
}

/** Recorre todas las páginas de una consulta paginada de la API (10 registros por página). */
async function todasLasPaginas<T>(
  consultar: (pagina: number) => Promise<{ datos: T[]; total: number; tamanoPagina: number }>,
): Promise<T[]> {
  const primera = await consultar(1);
  const paginas = Math.ceil(primera.total / primera.tamanoPagina);
  const resto = await Promise.all(
    Array.from({ length: Math.max(paginas - 1, 0) }, (_, i) => consultar(i + 2)),
  );
  return [primera, ...resto].flatMap((p) => p.datos);
}

/**
 * Datos del "Listado de libros" (M11): todos los libros que cumplen los criterios,
 * con su ficha y la lista completa de sus ejemplares.
 */
export async function obtenerListadoLibros(filtros: FiltrosLibros): Promise<LibroConEjemplares[]> {
  const resumenes = await todasLasPaginas((pagina) => librosService.listar({ ...filtros, pagina }));
  return Promise.all(
    resumenes.map(async ({ isbn }) => ({
      libro: await librosService.obtener(isbn),
      ejemplares:
        resumenes.find((r) => r.isbn === isbn)?.numEjemplares === 0
          ? []
          : await todasLasPaginas((pagina) => ejemplaresService.listar({ isbn, pagina })),
    })),
  );
}
