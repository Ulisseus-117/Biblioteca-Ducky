import { Boton } from '../../components/ui/Boton';

interface Props {
  abierta: boolean;
  nombre: string;
  tamano: string;
  alCerrar: () => void;
  alCompartir: () => void;
}

const DESTINOS = [
  { letra: 'W', nombre: 'WhatsApp', clase: 'whatsapp' },
  { letra: 'C', nombre: 'Correo', clase: 'correo' },
  { letra: 'D', nombre: 'Drive', clase: 'drive' },
  { letra: '···', nombre: 'Más', clase: 'mas' },
];

/**
 * Hoja "Compartir listado (móvil)" del prototipo. Cada opción abre la hoja para compartir
 * del sistema con el PDF adjunto, donde se elige la app (WhatsApp, correo, Drive…) y el contacto.
 */
export function HojaCompartir({ abierta, nombre, tamano, alCerrar, alCompartir }: Props) {
  if (!abierta) return null;
  return (
    <div className="fondo-modal" role="dialog" aria-modal="true" aria-label="Compartir" onClick={alCerrar}>
      <div className="hoja-compartir" onClick={(e) => e.stopPropagation()}>
        <span className="hoja-compartir__asa" />
        <h2>Compartir «{nombre}»</h2>
        <p>PDF · {tamano} · Elige WhatsApp y después el contacto</p>
        <div className="hoja-compartir__destinos">
          {DESTINOS.map((d) => (
            <button key={d.nombre} type="button" className="hoja-compartir__destino" onClick={alCompartir}>
              <span className={`hoja-compartir__circulo hoja-compartir__circulo--${d.clase}`}>{d.letra}</span>
              {d.nombre}
            </button>
          ))}
        </div>
        <Boton variante="secundario" ancho onClick={alCerrar}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}
