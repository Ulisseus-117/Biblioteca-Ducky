import type { Pagina, Usuario } from '../types/modelos';
import { aQueryString, http } from './http';

export interface FiltrosUsuarios {
  matricula?: string;
  idRol?: number | '';
  estado?: 'activo' | 'inactivo' | 'todos';
  orden?: string;
  dir?: 'asc' | 'desc';
  pagina?: number;
}

const ruta = (matricula: string) => `/usuarios/${encodeURIComponent(matricula)}`;

export const usuariosService = {
  listar: (filtros: FiltrosUsuarios) => http.get<Pagina<Usuario>>(`/usuarios${aQueryString({ ...filtros })}`),
  obtener: (matricula: string) => http.get<Usuario>(ruta(matricula)),
  crear: (datos: { matricula: string; contrasena: string; idRol: number }) =>
    http.post<Usuario>('/usuarios', datos),
  actualizar: (matricula: string, datos: { idRol: number; contrasena?: string }) =>
    http.put<Usuario>(ruta(matricula), datos),
  desactivar: (matricula: string) => http.patch<Usuario>(`${ruta(matricula)}/desactivar`),
  reactivar: (matricula: string) => http.patch<Usuario>(`${ruta(matricula)}/reactivar`),
};
