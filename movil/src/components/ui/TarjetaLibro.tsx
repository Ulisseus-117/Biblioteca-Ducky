import type { LibroResumen } from '../../types/modelos';
import { Boton } from './Boton';
import { Insignia } from './Insignia';

/** BookCard del prototipo (M06): título, autores, ISBN, temas, ejemplares y "Ver detalles". */
export function TarjetaLibro({ libro, alVerDetalles }: { libro: LibroResumen; alVerDetalles: () => void }) {
  return (
    <article className="tarjeta tarjeta-libro">
      <h2 className="tarjeta-libro__titulo">{libro.titulo}</h2>
      <p className="tarjeta-libro__autores">{libro.autores.join(', ')}</p>
      <div className="tarjeta-libro__meta">
        <span>{libro.isbn}</span>
        {libro.temas.map((t) => (
          <Insignia key={t} color="ambar">
            {t}
          </Insignia>
        ))}
      </div>
      <div className="tarjeta-libro__pie">
        <span>
          {libro.numEjemplares === 0
            ? 'Sin ejemplares'
            : `Ejemplares: ${libro.disponibles} de ${libro.numEjemplares}`}
        </span>
        <Boton chico onClick={alVerDetalles}>
          Ver detalles
        </Boton>
      </div>
    </article>
  );
}
