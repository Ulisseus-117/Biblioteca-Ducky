import { catalogosService } from '../services/catalogos.service';
import { useConsulta } from './useConsulta';

/** Catálogo de temas para el campo "Tema" y para el texto de criterios. */
export function useTemas() {
  const { datos } = useConsulta(() => catalogosService.temas(), []);
  return datos ?? [];
}
