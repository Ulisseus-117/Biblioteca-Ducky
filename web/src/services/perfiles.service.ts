import type { Perfil, Permiso } from '../types/modelos';
import { http } from './http';

export interface DatosPerfil {
  nombre: string;
  descripcion?: string;
  permisos: number[];
}

export const perfilesService = {
  listar: () => http.get<Perfil[]>('/perfiles'),
  permisos: () => http.get<Permiso[]>('/perfiles/permisos'),
  obtener: (idRol: number) => http.get<Perfil>(`/perfiles/${idRol}`),
  crear: (datos: DatosPerfil) => http.post<Perfil>('/perfiles', datos),
  actualizarPermisos: (idRol: number, permisos: number[]) =>
    http.put<Perfil>(`/perfiles/${idRol}/permisos`, { permisos }),
};
