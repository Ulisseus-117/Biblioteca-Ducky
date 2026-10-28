import type { UsuarioSesion } from '../types/modelos';
import { http } from './http';

export const authService = {
  login: (matricula: string, contrasena: string) =>
    http.post<{ token: string; usuario: UsuarioSesion }>('/auth/login', { matricula, contrasena }),
  perfil: () => http.get<{ usuario: UsuarioSesion }>('/auth/perfil'),
};
