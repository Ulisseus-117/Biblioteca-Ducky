import { useIonRouter } from '@ionic/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { useTemas } from '../../hooks/useTemas';
import type { OrdenLibros } from '../../services/libros.service';
import {
  aBusqueda,
  ETIQUETA_ORDEN_LIBROS,
  leerFiltrosLibros,
  POR_DEFECTO_LIBROS,
} from '../../utils/criterios';
import { numeroOVacio } from '../../utils/formato';

const VACIOS = leerFiltrosLibros('');

/** M05 Filtros de libros: todos los criterios de búsqueda, orden y dirección. */
export function FiltrosLibrosPage() {
  const router = useIonRouter();
  const { search } = useLocation();
  const temas = useTemas();
  const [filtros, setFiltros] = useState(() => leerFiltrosLibros(search));

  const aplicar = (evento: FormEvent) => {
    evento.preventDefault();
    router.push(`/consulta/resultados${aBusqueda({ ...filtros, pagina: 1 }, POR_DEFECTO_LIBROS)}`);
  };

  const texto = (campo: 'titulo' | 'autor' | 'isbn' | 'editorial', etiqueta: string) => (
    <CampoTexto
      etiqueta={etiqueta}
      value={filtros[campo]}
      onChange={(e) => setFiltros({ ...filtros, [campo]: e.target.value })}
    />
  );

  const numero = (campo: 'anio' | 'ejemplaresMin' | 'ejemplaresMax', etiqueta: string) => (
    <CampoTexto
      etiqueta={etiqueta}
      type="number"
      inputMode="numeric"
      min={0}
      value={filtros[campo]}
      onChange={(e) => setFiltros({ ...filtros, [campo]: numeroOVacio(e.target.value) })}
    />
  );

  return (
    <Pantalla titulo="Filtros de libros">
      <EnlaceVolver texto="Volver" ruta="/consulta" />
      <form className="tarjeta formulario" onSubmit={aplicar}>
        {texto('titulo', 'Título')}
        {texto('autor', 'Autor')}
        <CampoSeleccion
          etiqueta="Tema"
          vacio="Todos"
          opciones={temas.map((t) => ({ valor: t.idTema, texto: t.nombre }))}
          value={filtros.idTema}
          onChange={(e) => setFiltros({ ...filtros, idTema: numeroOVacio(e.target.value) })}
        />
        {texto('isbn', 'ISBN')}
        {texto('editorial', 'Editorial')}
        {numero('anio', 'Año de publicación')}
        {numero('ejemplaresMin', 'Ejemplares mínimo')}
        {numero('ejemplaresMax', 'Ejemplares máximo')}
        <CampoSeleccion
          etiqueta="Ordenar por"
          opciones={Object.entries(ETIQUETA_ORDEN_LIBROS).map(([valor, texto]) => ({ valor, texto }))}
          value={filtros.orden}
          onChange={(e) => setFiltros({ ...filtros, orden: e.target.value as OrdenLibros })}
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
          <Boton variante="secundario" onClick={() => setFiltros(VACIOS)}>
            Limpiar
          </Boton>
        </div>
      </form>
    </Pantalla>
  );
}
