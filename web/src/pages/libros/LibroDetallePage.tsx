import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pantalla, type Miga } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { COLOR_ESTADO_EJEMPLAR } from '../../config/colores';
import { Insignia } from '../../components/ui/Insignia';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { useAuth } from '../../context/AuthContext';
import { useConsulta } from '../../hooks/useConsulta';
import { ejemplaresService } from '../../services/ejemplares.service';
import { librosService } from '../../services/libros.service';
import type { Ejemplar } from '../../types/modelos';
import { folioEjemplar, textoUbicacion } from '../../utils/formato';

const COLUMNAS: Columna<Ejemplar>[] = [
  { clave: 'id', titulo: 'ID de ejemplar', render: (e) => folioEjemplar(e.idEjemplar) },
  {
    clave: 'estado',
    titulo: 'Estado',
    render: (e) => <Insignia color={COLOR_ESTADO_EJEMPLAR[e.estado]}>{e.estado}</Insignia>,
  },
  { clave: 'modalidad', titulo: 'Modalidad', render: (e) => e.modalidad },
  { clave: 'ubicacion', titulo: 'Ubicación física', render: (e) => textoUbicacion(e) },
];

/** Ficha completa del libro con sus ejemplares. Se usa desde Gestión de libros y desde Consulta. */
export function LibroDetallePage({ desdeConsulta = false }: { desdeConsulta?: boolean }) {
  const { isbn = '' } = useParams();
  const { tienePermiso } = useAuth();
  const [pagina, setPagina] = useState(1);
  const libro = useConsulta(() => librosService.obtener(isbn), [isbn]);
  const ejemplares = useConsulta(() => ejemplaresService.listar({ isbn, pagina }), [isbn, pagina]);

  const base: Miga = desdeConsulta
    ? { texto: 'Consulta de libros', ruta: '/consulta' }
    : { texto: 'Gestión de libros', ruta: '/libros' };
  const l = libro.datos;

  return (
    <Pantalla migas={[base, { texto: 'Ficha del libro' }]}>
      <EncabezadoPagina
        titulo={l?.titulo ?? 'Ficha del libro'}
        descripcion={l ? `ISBN ${l.isbn}` : undefined}
      >
        {l && !desdeConsulta && tienePermiso('libros.gestionar') && (
          <Link to={`/libros/${encodeURIComponent(l.isbn)}/editar`} className="btn btn--secundario">
            Editar
          </Link>
        )}
        <Link to={base.ruta ?? '/'} className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      {libro.error && <Alerta tipo="error">{libro.error}</Alerta>}
      {l && (
        <div className="ficha">
          <Dato etiqueta="Autor(es)" valor={l.autores.map((a) => a.nombre).join(', ')} />
          <Dato etiqueta="Editorial" valor={l.editorial} />
          <Dato etiqueta="Año de publicación" valor={l.anio} />
          <Dato etiqueta="Idioma" valor={l.idioma} />
          <Dato
            etiqueta="Tema(s)"
            valor={
              l.temas.length ? (
                <div className="badges">
                  {l.temas.map((t) => (
                    <Insignia key={t.idTema} color="ambar">
                      {t.nombre}
                    </Insignia>
                  ))}
                </div>
              ) : null
            }
          />
          <Dato etiqueta="Disponibilidad" valor={`${l.disponibles} de ${l.numEjemplares} disponibles`} />
        </div>
      )}

      <h2 className="seccion-titulo">Ejemplares</h2>
      {l && l.numEjemplares === 0 ? (
        <Alerta tipo="info">Este libro todavía no tiene ejemplares registrados.</Alerta>
      ) : (
        <>
          <Tabla
            columnas={COLUMNAS}
            filas={ejemplares.datos?.datos ?? []}
            clave={(e) => e.idEjemplar}
            cargando={ejemplares.cargando}
          />
          {ejemplares.datos && (
            <Paginacion
              pagina={ejemplares.datos.pagina}
              total={ejemplares.datos.total}
              tamanoPagina={ejemplares.datos.tamanoPagina}
              sustantivo="ejemplares"
              alCambiar={setPagina}
            />
          )}
        </>
      )}
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div className="ficha__dato">
      <span className="ficha__etiqueta">{etiqueta}</span>
      <span>{valor ?? '—'}</span>
    </div>
  );
}
