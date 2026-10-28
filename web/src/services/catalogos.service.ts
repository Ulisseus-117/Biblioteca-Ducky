import type { Autor, Rol, Tema, Ubicacion } from '../types/modelos';
import { http } from './http';

export const catalogosService = {
  roles: () => http.get<Rol[]>('/catalogos/roles'),
  autores: () => http.get<Autor[]>('/catalogos/autores'),
  crearAutor: (nombre: string) => http.post<Autor>('/catalogos/autores', { nombre }),
  temas: () => http.get<Tema[]>('/catalogos/temas'),
  crearTema: (nombre: string) => http.post<Tema>('/catalogos/temas', { nombre }),
  ubicaciones: () => http.get<Ubicacion[]>('/catalogos/ubicaciones'),
};
