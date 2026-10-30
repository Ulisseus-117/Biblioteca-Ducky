import type { EstadoEjemplar, Modalidad, PaginaEjemplares } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosEjemplares {
  isbn?: string;
  idEjemplar?: number | '';
  estado?: EstadoEjemplar | '';
  modalidad?: Modalidad | '';
  idUbicacion?: number | '';
  orden?: OrdenEjemplares;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

export type OrdenEjemplares = 'id' | 'estado' | 'modalidad' | 'ubicacion';

/** Solo consulta: el registro y la edición de ejemplares se hacen en la web. */
export const ejemplaresService = {
  listar: (filtros: FiltrosEjemplares) =>
    http.get<PaginaEjemplares>(`/ejemplares${aQueryString({ ...filtros })}`),
};
