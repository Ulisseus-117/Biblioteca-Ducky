import { useIonRouter } from '@ionic/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pantalla } from '../../components/layout/Pantalla';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { useTemas } from '../../hooks/useTemas';
import { aBusqueda } from '../../utils/criterios';
import { numeroOVacio } from '../../utils/formato';

/** M04 Consulta de libros · Inicio: búsqueda por título, autor y tema. */
export function BuscarLibrosPage() {
  const router = useIonRouter();
  const temas = useTemas();
  const [criterios, setCriterios] = useState({ titulo: '', autor: '', idTema: '' as number | '' });

  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    router.push(`/consulta/resultados${aBusqueda(criterios)}`);
  };

  return (
    <Pantalla titulo="Consulta de libros">
      <form className="tarjeta formulario" onSubmit={buscar}>
        <h2 className="tarjeta__titulo">Buscar libros</h2>
        <CampoTexto
          etiqueta="Título"
          value={criterios.titulo}
          onChange={(e) => setCriterios({ ...criterios, titulo: e.target.value })}
        />
        <CampoTexto
          etiqueta="Autor"
          value={criterios.autor}
          onChange={(e) => setCriterios({ ...criterios, autor: e.target.value })}
        />
        <CampoSeleccion
          etiqueta="Tema"
          vacio="Todos"
          opciones={temas.map((t) => ({ valor: t.idTema, texto: t.nombre }))}
          value={criterios.idTema}
          onChange={(e) => setCriterios({ ...criterios, idTema: numeroOVacio(e.target.value) })}
        />
        <div className="acciones">
          <Boton type="submit">Buscar</Boton>
          <Boton
            variante="secundario"
            onClick={() => router.push(`/consulta/filtros${aBusqueda(criterios)}`)}
          >
            Más filtros
          </Boton>
        </div>
      </form>
      <p className="texto-ayuda">
        Usa los filtros para consultar el catálogo de la biblioteca. Esta vista es solo de consulta.
      </p>
    </Pantalla>
  );
}
