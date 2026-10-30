import { COLOR_ESTADO_EJEMPLAR } from '../../config/colores';
import type { Ejemplar } from '../../types/modelos';
import { folioEjemplar, formatoFecha, textoUbicacion } from '../../utils/formato';
import { FilaDato } from './FilaDato';
import { Insignia } from './Insignia';

/** CopyCard del prototipo (M09). En móvil no hay PDF ni impresión de ejemplares. */
export function TarjetaEjemplar({ ejemplar }: { ejemplar: Ejemplar }) {
  return (
    <article className="tarjeta tarjeta-ejemplar">
      <div className="tarjeta-ejemplar__encabezado">
        <h2>{folioEjemplar(ejemplar.idEjemplar)}</h2>
        <Insignia color={COLOR_ESTADO_EJEMPLAR[ejemplar.estado]}>{ejemplar.estado}</Insignia>
      </div>
      <FilaDato etiqueta="Modalidad" valor={ejemplar.modalidad} />
      <FilaDato etiqueta="Ubicación física" valor={textoUbicacion(ejemplar)} />
      <FilaDato
        etiqueta="Devolución esperada"
        valor={ejemplar.fechaDevolucionEsperada ? formatoFecha(ejemplar.fechaDevolucionEsperada) : 'N/A'}
      />
    </article>
  );
}
