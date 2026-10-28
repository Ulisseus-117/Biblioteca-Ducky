import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/http';

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
      setError(e instanceof ApiError ? e.message : 'No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  }, [ejecutar]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar };
}

/** Estado de ordenamiento para encabezados de tabla. */
export function useOrden(columnaInicial: string, dirInicial: 'asc' | 'desc' = 'asc') {
  const [orden, setOrden] = useState({ columna: columnaInicial, dir: dirInicial });
  const alternar = useCallback((columna: string) => {
    setOrden((actual) =>
      actual.columna === columna
        ? { columna, dir: actual.dir === 'asc' ? 'desc' : 'asc' }
        : { columna, dir: 'asc' },
    );
  }, []);
  return { orden: orden.columna, dir: orden.dir, alternar };
}

export function mensajeDeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'No se pudo conectar con el servidor';
}
