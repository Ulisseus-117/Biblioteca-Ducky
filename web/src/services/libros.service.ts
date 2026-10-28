import type { DatosLibro, Libro, LibroResumen, Pagina } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosLibros {
  q?: string;
  titulo?: string;
  autor?: string;
  idTema?: number | '';
  isbn?: string;
  editorial?: string;
  anio?: number | '';
  ejemplaresMin?: number | '';
  ejemplaresMax?: number | '';
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

const ruta = (isbn: string) => `/libros/${encodeURIComponent(isbn)}`;

export const librosService = {
  listar: (filtros: FiltrosLibros) =>
    http.get<Pagina<LibroResumen>>(`/libros${aQueryString({ ...filtros })}`),
  opciones: () => http.get<{ isbn: string; titulo: string }[]>('/libros/opciones'),
  obtener: (isbn: string) => http.get<Libro>(ruta(isbn)),
  crear: (datos: DatosLibro) => http.post<Libro>('/libros', datos),
  actualizar: (isbnActual: string, datos: DatosLibro) => http.put<Libro>(ruta(isbnActual), datos),
  eliminar: (isbn: string) => http.delete<void>(ruta(isbn)),
};
