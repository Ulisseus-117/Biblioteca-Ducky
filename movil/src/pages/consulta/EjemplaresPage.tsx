import { useIonRouter } from '@ionic/react';
import { useLocation, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { Cargando } from '../../components/ui/Cargando';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { Paginacion } from '../../components/ui/Paginacion';
import { TarjetaEjemplar } from '../../components/ui/TarjetaEjemplar';
import { useConsulta } from '../../hooks/useConsulta';
import { ejemplaresService } from '../../services/ejemplares.service';
import { librosService } from '../../services/libros.service';
import { aBusqueda, leerFiltrosEjemplares, POR_DEFECTO_EJEMPLARES } from '../../utils/criterios';
import { plural } from '../../utils/formato';

/** M09 Consulta de ejemplares de un libro y M09b sin coincidencias. */
export function EjemplaresPage() {
  const router = useIonRouter();
  const { isbn = '' } = useParams();
  const { search } = useLocation();
  const filtros = leerFiltrosEjemplares(search);
  const libro = useConsulta(() => librosService.obtener(isbn), [isbn]);
  const { datos, cargando, error } = useConsulta(
    () => ejemplaresService.listar({ ...filtros, isbn }),
    [isbn, search],
  );

  const base = `/consulta/libros/${encodeURIComponent(isbn)}`;
  const busqueda = aBusqueda(filtros, POR_DEFECTO_EJEMPLARES);
  const sinCoincidencias = datos?.total === 0;

  return (
    <Pantalla titulo="Consulta de ejemplares">
      <EnlaceVolver texto="Ficha del libro" ruta={base} />
      <div className="resumen">
        <span>
          {sinCoincidencias
            ? 'Sin ejemplares para los criterios indicados'
            : datos && libro.datos
              ? `${libro.datos.titulo} · ${plural(datos.total, 'ejemplar', 'ejemplares')}`
              : ''}
        </span>
        <Boton
          variante="secundario"
          chico
          onClick={() => router.push(`${base}/ejemplares/filtros${busqueda}`)}
        >
          Filtros
        </Boton>
      </div>

      {error && <Alerta>{error}</Alerta>}
      {cargando && <Cargando />}
      {sinCoincidencias && (
        <p className="texto-ayuda">No se encontraron ejemplares con esos criterios. Modifica los filtros.</p>
      )}

      {datos && datos.total > 0 && (
        <>
          {datos.datos.map((ejemplar) => (
            <TarjetaEjemplar key={ejemplar.idEjemplar} ejemplar={ejemplar} />
          ))}
          <Paginacion
            pagina={datos.pagina}
            total={datos.total}
            tamanoPagina={datos.tamanoPagina}
            singular="ejemplar"
            pluralTexto="ejemplares"
            alCambiar={(pagina) =>
              router.push(
                `${base}/ejemplares${aBusqueda({ ...filtros, pagina }, POR_DEFECTO_EJEMPLARES)}`,
                'none',
                'replace',
              )
            }
          />
        </>
      )}
    </Pantalla>
  );
}
