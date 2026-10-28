import { useState } from 'react';
import { Boton } from './Boton';
import { BotonIcono } from './BotonIcono';
import type { Opcion } from './Campo';

interface Props {
  etiqueta: string;
  /** Texto en singular para "Agregar otro ___" y "Selecciona un ___". */
  sustantivo: string;
  opciones: Opcion[];
  valores: number[];
  error?: string;
  alCambiar: (valores: number[]) => void;
  /** Si se indica, permite dar de alta una opción nueva sin salir del formulario. */
  alCrear?: (nombre: string) => Promise<number>;
}

/** Varios <select> encadenados con "Agregar otro …" (autores y temas del libro). */
export function SelectorMultiple({
  etiqueta,
  sustantivo,
  opciones,
  valores,
  error,
  alCambiar,
  alCrear,
}: Props) {
  const [filas, setFilas] = useState<(number | '')[]>(valores.length ? valores : ['']);
  const [nuevo, setNuevo] = useState('');
  const [creando, setCreando] = useState(false);

  // Sincroniza cuando el formulario carga datos de un libro existente
  const firma = valores.join(',');
  const [firmaPrevia, setFirmaPrevia] = useState(firma);
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma);
    if (valores.length) setFilas(valores);
  }

  const actualizar = (nuevasFilas: (number | '')[]) => {
    setFilas(nuevasFilas);
    alCambiar(nuevasFilas.filter((v): v is number => v !== ''));
  };

  const crear = async () => {
    if (!alCrear || !nuevo.trim()) return;
    setCreando(true);
    try {
      const id = await alCrear(nuevo.trim());
      const sinVacios = filas.filter((f) => f !== '');
      actualizar([...sinVacios, id]);
      setNuevo('');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
      <span className="campo__etiqueta">{etiqueta}</span>
      {filas.map((valor, indice) => (
        <div key={indice} className="acciones">
          <select
            className="campo__control"
            aria-label={`${etiqueta} ${indice + 1}`}
            value={valor}
            onChange={(e) => {
              const copia = [...filas];
              copia[indice] = e.target.value ? Number(e.target.value) : '';
              actualizar(copia);
            }}
          >
            <option value="">Selecciona un {sustantivo}</option>
            {opciones.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
          {filas.length > 1 && (
            <BotonIcono
              icono="basura"
              variante="peligro"
              etiqueta={`Quitar ${sustantivo}`}
              onClick={() => actualizar(filas.filter((_, i) => i !== indice))}
            />
          )}
        </div>
      ))}
      {error && <span className="campo__mensaje">{error}</span>}
      <button type="button" className="btn-link" onClick={() => setFilas([...filas, ''])}>
        Agregar otro {sustantivo}
      </button>
      {alCrear && (
        <div className="acciones">
          <input
            className="campo__control"
            placeholder={`¿No está en la lista? Escribe el nuevo ${sustantivo}`}
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
          />
          <Boton variante="suave" chico onClick={crear} disabled={creando || !nuevo.trim()}>
            Crear
          </Boton>
        </div>
      )}
    </div>
  );
}
