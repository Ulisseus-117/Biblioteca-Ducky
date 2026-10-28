import type { EstadoSolicitud, LineaSolicitud, Pagina, Solicitud, SolicitudResumen } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosSolicitudes {
  folio?: number | '';
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoSolicitud | '';
  costoMin?: number | '';
  costoMax?: number | '';
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

export const solicitudesService = {
  listar: (filtros: FiltrosSolicitudes) =>
    http.get<Pagina<SolicitudResumen>>(`/solicitudes${aQueryString({ ...filtros })}`),
  obtener: (id: number) => http.get<Solicitud>(`/solicitudes/${id}`),
  crear: (lineas: LineaSolicitud[]) => http.post<Solicitud>('/solicitudes', { lineas }),
  cambiarEstado: (id: number, estado: EstadoSolicitud) =>
    http.patch<Solicitud>(`/solicitudes/${id}/estado`, { estado }),
};
