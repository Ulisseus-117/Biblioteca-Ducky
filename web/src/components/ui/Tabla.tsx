import type { ReactNode } from 'react';
import { Icono } from './Icono';

export interface Columna<T> {
  clave: string;
  titulo: string;
  /** Si se indica, el encabezado permite ordenar por esta columna en la API. */
  ordenable?: boolean;
  ancho?: number | string;
  render: (fila: T) => ReactNode;
}

interface Props<T> {
  columnas: Columna<T>[];
  filas: T[];
  clave: (fila: T) => string | number;
  orden?: string;
  dir?: 'asc' | 'desc';
  alOrdenar?: (columna: string) => void;
  cargando?: boolean;
  mensajeVacio?: string;
}

export function Tabla<T>({
  columnas,
  filas,
  clave,
  orden,
  dir,
  alOrdenar,
  cargando,
  mensajeVacio,
}: Props<T>) {
  const iconoOrden = (columna: string) => {
    if (orden !== columna) return 'ordenar';
    return dir === 'asc' ? 'flechaArriba' : 'flechaAbajo';
  };

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} style={c.ancho ? { width: c.ancho } : undefined}>
                {c.ordenable && alOrdenar ? (
                  <button type="button" className="orden-btn" onClick={() => alOrdenar(c.clave)}>
                    {c.titulo} <Icono nombre={iconoOrden(c.clave)} tamano={14} />
                  </button>
                ) : (
                  c.titulo
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cargando && (
            <tr>
              <td className="tabla__vacia" colSpan={columnas.length}>
                Cargando…
              </td>
            </tr>
          )}
          {!cargando && filas.length === 0 && (
            <tr>
              <td className="tabla__vacia" colSpan={columnas.length}>
                {mensajeVacio ?? 'No se encontraron resultados'}
              </td>
            </tr>
          )}
          {!cargando &&
            filas.map((fila) => (
              <tr key={clave(fila)}>
                {columnas.map((c) => (
                  <td key={c.clave}>{c.render(fila)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
