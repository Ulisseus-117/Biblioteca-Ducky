import { useCallback, useEffect, useState } from 'react';
import { mensajeDeError } from '../services/http';

/**
 * Ejecuta una consulta a la API cuando cambian sus dependencias y expone
 * datos, estado de carga, error y una función para recargar.
 */
export function useConsulta<T>(consulta: () => Promise<T>, dependencias: unknown[]) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ejecutar = useCallback(consulta, dependencias);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await ejecutar());
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, [ejecutar]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar };
}
