/** Interruptor encendido/apagado (switch) con su etiqueta accesible. */
export function Interruptor({
  activo,
  etiqueta,
  alCambiar,
  deshabilitado = false,
}: {
  activo: boolean;
  etiqueta: string;
  alCambiar: (activo: boolean) => void;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      className={`interruptor ${activo ? 'interruptor--activo' : ''}`}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
    >
      <span className="interruptor__perilla" />
    </button>
  );
}
