import { useIonRouter } from '@ionic/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import type { OrdenEjemplares } from '../../services/ejemplares.service';
import { ESTADOS_EJEMPLAR, MODALIDADES, type EstadoEjemplar, type Modalidad } from '../../types/modelos';
import {
  aBusqueda,
  ETIQUETA_ORDEN_EJEMPLARES,
  leerFiltrosEjemplares,
  POR_DEFECTO_EJEMPLARES,
} from '../../utils/criterios';
import { folioEjemplar, idDeFolio, numeroOVacio, textoUbicacion } from '../../utils/formato';

/** M10 Filtros de ejemplares: ID, estado, modalidad, ubicación, orden y dirección. */
export function FiltrosEjemplaresPage() {
  const router = useIonRouter();
  const { isbn = '' } = useParams();
  const { search } = useLocation();
  const ubicaciones = useConsulta(() => catalogosService.ubicaciones(), []);
  const [filtros, setFiltros] = useState(() => leerFiltrosEjemplares(search));
  const [folio, setFolio] = useState(filtros.idEjemplar === '' ? '' : folioEjemplar(filtros.idEjemplar));
  const rutaEjemplares = `/consulta/libros/${encodeURIComponent(isbn)}/ejemplares`;

  const aplicar = (evento: FormEvent) => {
    evento.preventDefault();
    const nuevos = { ...filtros, idEjemplar: idDeFolio(folio), pagina: 1 };
    router.push(`${rutaEjemplares}${aBusqueda(nuevos, POR_DEFECTO_EJEMPLARES)}`, 'back', 'push');
  };

  const limpiar = () => {
    setFolio('');
    setFiltros(leerFiltrosEjemplares(''));
  };

  return (
    <Pantalla titulo="Filtros de ejemplares">
      <EnlaceVolver texto="Volver" ruta={`${rutaEjemplares}${aBusqueda(filtros, POR_DEFECTO_EJEMPLARES)}`} />
      <form className="tarjeta formulario" onSubmit={aplicar}>
        <CampoTexto
          etiqueta="ID de ejemplar"
          placeholder="EJ-000000"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
        />
        <CampoSeleccion
          etiqueta="Estado"
          vacio="Todos"
          opciones={ESTADOS_EJEMPLAR.map((e) => ({ valor: e, texto: e }))}
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoEjemplar | '' })}
        />
        <CampoSeleccion
          etiqueta="Modalidad"
          vacio="Todas"
          opciones={MODALIDADES.map((m) => ({ valor: m, texto: m }))}
          value={filtros.modalidad}
          onChange={(e) => setFiltros({ ...filtros, modalidad: e.target.value as Modalidad | '' })}
        />
        <CampoSeleccion
          etiqueta="Ubicación física"
          vacio="Todas"
          opciones={(ubicaciones.datos ?? []).map((u) => ({
            valor: u.idUbicacion,
            texto: textoUbicacion(u),
          }))}
          value={filtros.idUbicacion}
          onChange={(e) => setFiltros({ ...filtros, idUbicacion: numeroOVacio(e.target.value) })}
        />
        <CampoSeleccion
          etiqueta="Ordenar por"
          opciones={Object.entries(ETIQUETA_ORDEN_EJEMPLARES).map(([valor, texto]) => ({ valor, texto }))}
          value={filtros.orden}
          onChange={(e) => setFiltros({ ...filtros, orden: e.target.value as OrdenEjemplares })}
        />
        <CampoSeleccion
          etiqueta="Dirección"
          opciones={[
            { valor: 'asc', texto: 'Ascendente' },
            { valor: 'desc', texto: 'Descendente' },
          ]}
          value={filtros.dir}
          onChange={(e) => setFiltros({ ...filtros, dir: e.target.value as 'asc' | 'desc' })}
        />
        <div className="acciones">
          <Boton type="submit">Aplicar filtros</Boton>
          <Boton variante="secundario" onClick={limpiar}>
            Limpiar
          </Boton>
        </div>
      </form>
    </Pantalla>
  );
}
