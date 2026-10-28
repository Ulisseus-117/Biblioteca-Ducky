import type { Ejemplar, EstadoEjemplar, Modalidad, PaginaEjemplares } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosEjemplares {
  isbn?: string;
  idEjemplar?: number | '';
  estado?: EstadoEjemplar | '';
  modalidad?: Modalidad | '';
  idUbicacion?: number | '';
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

export const ejemplaresService = {
  listar: (filtros: FiltrosEjemplares) =>
    http.get<PaginaEjemplares>(`/ejemplares${aQueryString({ ...filtros })}`),
  obtener: (id: number) => http.get<Ejemplar>(`/ejemplares/${id}`),
  registrar: (datos: { isbn: string; cantidad: number; modalidad: Modalidad; idUbicacion: number }) =>
    http.post<{ ids: number[] }>('/ejemplares', datos),
  actualizar: (id: number, datos: { modalidad: Modalidad; idUbicacion: number; estado: EstadoEjemplar }) =>
    http.put<Ejemplar>(`/ejemplares/${id}`, datos),
  darDeBaja: (id: number) => http.delete<{ eliminado: boolean }>(`/ejemplares/${id}`),
};
