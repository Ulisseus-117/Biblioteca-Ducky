import type { Tema, Ubicacion } from '../types/modelos';
import { http } from './http';

export const catalogosService = {
  temas: () => http.get<Tema[]>('/catalogos/temas'),
  ubicaciones: () => http.get<Ubicacion[]>('/catalogos/ubicaciones'),
};
