import { IonIcon, useIonRouter } from '@ionic/react';
import { arrowDown, arrowUp, swapVertical } from 'ionicons/icons';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { Cargando } from '../../components/ui/Cargando';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { Paginacion } from '../../components/ui/Paginacion';
import { TarjetaLibro } from '../../components/ui/TarjetaLibro';
import { useConsulta } from '../../hooks/useConsulta';
import { useTemas } from '../../hooks/useTemas';
import { librosService, type OrdenLibros } from '../../services/libros.service';
import {
  aBusqueda,
  ETIQUETA_ORDEN_LIBROS,
  leerFiltrosLibros,
  POR_DEFECTO_LIBROS,
  recordarBusquedaLibros,
  textoCriterios,
} from '../../utils/criterios';
import { plural } from '../../utils/formato';

/** M06/M07 Resultados de libros y M06b sin coincidencias. */
export function ResultadosLibrosPage() {
  const router = useIonRouter();
  const { search } = useLocation();
  const temas = useTemas();
  const filtros = leerFiltrosLibros(search);
  const { datos, cargando, error, recargar } = useConsulta(() => librosService.listar(filtros), [search]);

  useEffect(() => recordarBusquedaLibros(search), [search]);

  const irA = (cambios: Partial<typeof filtros>) =>
    router.push(
      `/consulta/resultados${aBusqueda({ ...filtros, ...cambios }, POR_DEFECTO_LIBROS)}`,
      'none',
      'replace',
    );

  const ordenarPor = (orden: OrdenLibros) =>
    irA({ orden, dir: filtros.orden === orden && filtros.dir === 'asc' ? 'desc' : 'asc', pagina: 1 });

  const busqueda = aBusqueda(filtros, POR_DEFECTO_LIBROS);
  const sinCoincidencias = datos?.total === 0;

  return (
    <Pantalla titulo="Consulta de libros">
      <EnlaceVolver texto="Nueva búsqueda" ruta="/consulta" />
      <section className="criterios">
        <span className="criterios__titulo">Criterios de búsqueda</span>
        <p>
          {sinCoincidencias
            ? 'Sin coincidencias · revisa el título, autor o los filtros'
            : textoCriterios(filtros, temas)}
        </p>
      </section>

      <div className="resumen">
        <span>{datos ? plural(datos.total, 'libro encontrado', 'libros encontrados') : ''}</span>
        <Boton variante="secundario" chico onClick={() => router.push(`/consulta/filtros${busqueda}`)}>
          Filtros
        </Boton>
      </div>

      {error && (
        <Alerta>
          {error}{' '}
          <button type="button" className="enlace" onClick={() => void recargar()}>
            Reintentar
          </button>
        </Alerta>
      )}
      {cargando && <Cargando />}

      {sinCoincidencias && (
        <p className="texto-ayuda">
          No se encontraron libros con esos criterios. Regresa y modifica la búsqueda.
        </p>
      )}

      {datos && datos.total > 0 && (
        <>
          <span className="texto-ayuda">Ordenar por</span>
          <div className="orden">
            {(Object.keys(ETIQUETA_ORDEN_LIBROS) as OrdenLibros[]).map((orden) => {
              const activo = filtros.orden === orden;
              return (
                <button
                  key={orden}
                  type="button"
                  className={`orden__chip ${activo ? 'orden__chip--activo' : ''}`}
                  onClick={() => ordenarPor(orden)}
                >
                  {ETIQUETA_ORDEN_LIBROS[orden]}
                  <IonIcon icon={!activo ? swapVertical : filtros.dir === 'asc' ? arrowUp : arrowDown} />
                </button>
              );
            })}
          </div>

          {datos.datos.map((libro) => (
            <TarjetaLibro
              key={libro.isbn}
              libro={libro}
              alVerDetalles={() => router.push(`/consulta/libros/${encodeURIComponent(libro.isbn)}`)}
            />
          ))}

          <Paginacion
            pagina={datos.pagina}
            total={datos.total}
            tamanoPagina={datos.tamanoPagina}
            singular="libro"
            pluralTexto="libros"
            alCambiar={(pagina) => irA({ pagina })}
          />

          <div className="acciones">
            <Boton onClick={() => router.push(`/consulta/pdf${busqueda}`)}>Generar PDF</Boton>
            <Boton
              variante="secundario"
              onClick={() =>
                router.push(`/consulta/pdf${aBusqueda({ ...filtros, imprimir: 1 }, POR_DEFECTO_LIBROS)}`)
              }
            >
              Imprimir
            </Boton>
          </div>
        </>
      )}
    </Pantalla>
  );
}
