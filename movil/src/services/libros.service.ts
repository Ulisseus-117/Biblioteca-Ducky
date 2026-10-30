import type { Libro, LibroResumen, Pagina } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosLibros {
  titulo?: string;
  autor?: string;
  idTema?: number | '';
  isbn?: string;
  editorial?: string;
  anio?: number | '';
  ejemplaresMin?: number | '';
  ejemplaresMax?: number | '';
  orden?: OrdenLibros;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

/** Columnas por las que se puede ordenar en la app (pantallas M05 y M06 del prototipo). */
export type OrdenLibros = 'titulo' | 'autor' | 'ejemplares';

export const librosService = {
  listar: (filtros: FiltrosLibros) =>
    http.get<Pagina<LibroResumen>>(`/libros${aQueryString({ ...filtros })}`),
  obtener: (isbn: string) => http.get<Libro>(`/libros/${encodeURIComponent(isbn)}`),
};
