import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface Envoltura {
  etiqueta: string;
  error?: string;
  children: (id: string) => ReactNode;
}

function EnvolturaCampo({ etiqueta, error, children }: Envoltura) {
  const id = useId();
  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
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
}

export function CampoTexto({ etiqueta, error, ...props }: CampoTextoProps) {
  return (
    <EnvolturaCampo etiqueta={etiqueta} error={error}>
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
  /** Texto de la primera opción vacía (ej. "Todos", "Todas"). */
  vacio?: string;
}

export function CampoSeleccion({ etiqueta, opciones, vacio, ...props }: CampoSeleccionProps) {
  return (
    <EnvolturaCampo etiqueta={etiqueta}>
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
