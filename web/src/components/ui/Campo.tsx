import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface Envoltura {
  etiqueta: string;
  error?: string;
  children: (id: string) => ReactNode;
  ancho?: number | string;
}

function EnvolturaCampo({ etiqueta, error, children, ancho }: Envoltura) {
  const id = useId();
  return (
    <div className={`campo ${error ? 'campo--error' : ''}`} style={ancho ? { width: ancho } : undefined}>
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>
      {children(id)}
      {error && <span className="campo__mensaje">{error}</span>}
    </div>
  );
}

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
  ancho?: number | string;
}

export function CampoTexto({ etiqueta, error, ancho, ...props }: CampoTextoProps) {
  return (
    <EnvolturaCampo etiqueta={etiqueta} error={error} ancho={ancho}>
      {(id) => <input id={id} className="campo__control" {...props} />}
    </EnvolturaCampo>
  );
}

export interface Opcion {
  valor: string | number;
  texto: string;
}

interface CampoSeleccionProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  opciones: Opcion[];
  /** Texto de la primera opción vacía (ej. "Todos", "Selecciona un rol"). */
  vacio?: string;
  error?: string;
  ancho?: number | string;
}

export function CampoSeleccion({ etiqueta, opciones, vacio, error, ancho, ...props }: CampoSeleccionProps) {
  return (
    <EnvolturaCampo etiqueta={etiqueta} error={error} ancho={ancho}>
      {(id) => (
        <select id={id} className="campo__control" {...props}>
          {vacio !== undefined && <option value="">{vacio}</option>}
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      )}
    </EnvolturaCampo>
  );
}
