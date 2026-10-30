import { useIonRouter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { Cargando } from '../../components/ui/Cargando';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { FilaDato } from '../../components/ui/FilaDato';
import { Insignia } from '../../components/ui/Insignia';
import { useConsulta } from '../../hooks/useConsulta';
import { librosService } from '../../services/libros.service';
import { rutaResultados } from '../../utils/criterios';

/** M08 Ficha del libro y M08b Ficha del libro · Sin ejemplares. */
export function FichaLibroPage() {
  const router = useIonRouter();
  const { isbn = '' } = useParams();
  const { datos: libro, cargando, error } = useConsulta(() => librosService.obtener(isbn), [isbn]);
  const volver = () => router.push(rutaResultados(), 'back', 'push');

  return (
    <Pantalla titulo="Detalle del libro">
      <EnlaceVolver texto="Resultados" ruta={rutaResultados()} />
      {error && <Alerta>{error}</Alerta>}
      {cargando && <Cargando />}
      {libro && (
        <>
          <section className="tarjeta ficha">
            <h2 className="ficha__titulo">{libro.titulo}</h2>
            <FilaDato etiqueta="Autor" valor={libro.autores.map((a) => a.nombre).join(', ')} />
            <FilaDato etiqueta="Editorial" valor={libro.editorial} />
            <FilaDato etiqueta="Año" valor={libro.anio} />
            <FilaDato etiqueta="ISBN" valor={libro.isbn} />
            <FilaDato etiqueta="Ejemplares totales" valor={libro.numEjemplares} />
            <FilaDato etiqueta="Disponibles" valor={libro.disponibles} />
            {libro.temas.length > 0 && (
              <div className="badges">
                {libro.temas.map((t) => (
                  <Insignia key={t.idTema} color="ambar">
                    {t.nombre}
                  </Insignia>
                ))}
              </div>
            )}
          </section>

          {libro.numEjemplares === 0 ? (
            <>
              <p className="texto-ayuda">Este libro no tiene ejemplares registrados por el momento.</p>
              <Boton variante="secundario" ancho onClick={volver}>
                Volver a resultados
              </Boton>
            </>
          ) : (
            <div className="acciones">
              <Boton onClick={() => router.push(`/consulta/libros/${encodeURIComponent(isbn)}/ejemplares`)}>
                Ver ejemplares
              </Boton>
              <Boton variante="secundario" onClick={volver}>
                Volver
              </Boton>
            </div>
          )}
        </>
      )}
    </Pantalla>
  );
}
