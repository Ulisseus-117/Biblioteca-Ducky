import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logoDucky from '../../assets/logo-ducky.png';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { Cargando } from '../../components/ui/Cargando';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { Insignia } from '../../components/ui/Insignia';
import { COLOR_ESTADO_EJEMPLAR } from '../../config/colores';
import { useConsulta } from '../../hooks/useConsulta';
import { useTemas } from '../../hooks/useTemas';
import { mensajeDeError } from '../../services/http';
import { obtenerListadoLibros } from '../../services/listado.service';
import {
  compartirPdf,
  descargarPdf,
  detalleLibro,
  generarPdfListado,
  imprimirListado,
  NOMBRE_PDF,
  tamanoLegible,
} from '../../services/pdf.service';
import { leerFiltrosLibros, rutaResultados, textoCriterioPdf } from '../../utils/criterios';
import { fechaDeHoy, folioEjemplar, textoUbicacion } from '../../utils/formato';
import { DescargaCompletada } from './DescargaCompletada';
import { HojaCompartir } from './HojaCompartir';

/** M11 Vista previa PDF del listado de libros: descargar, imprimir o enviar por WhatsApp. */
export function VistaPreviaPdfPage() {
  const { search } = useLocation();
  const temas = useTemas();
  const filtros = useMemo(() => leerFiltrosLibros(search), [search]);
  const imprimirAlAbrir = new URLSearchParams(search).has('imprimir');
  const listado = useConsulta(() => obtenerListadoLibros(filtros), [filtros]);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descargado, setDescargado] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const yaImprimio = useRef(false);

  const fecha = fechaDeHoy();
  const encabezado = listado.datos ? textoCriterioPdf(filtros, temas, fecha, listado.datos.length) : '';

  useEffect(() => {
    if (!listado.datos) return;
    generarPdfListado(listado.datos, encabezado)
      .then(setPdf)
      .catch(() => setError('No se pudo generar el PDF.'));
  }, [listado.datos, encabezado]);

  // "Imprimir" en los resultados abre esta vista y lanza la impresión en cuanto el PDF está listo
  useEffect(() => {
    if (pdf && imprimirAlAbrir && !yaImprimio.current) {
      yaImprimio.current = true;
      void imprimirListado(pdf);
    }
  }, [pdf, imprimirAlAbrir]);

  const ejecutar = async (accion: (blob: Blob) => Promise<unknown>) => {
    if (!pdf) return;
    setError(null);
    try {
      await accion(pdf);
    } catch (e) {
      // Cerrar la hoja de compartir sin elegir una app no es un error
      if (!(e instanceof Error && /cancel|abort/i.test(e.message + e.name))) setError(mensajeDeError(e));
    }
  };

  return (
    <Pantalla titulo="Vista previa PDF">
      <EnlaceVolver texto="Volver" ruta={rutaResultados()} />
      {(listado.error || error) && <Alerta>{listado.error ?? error}</Alerta>}
      {listado.cargando && <Cargando />}

      {listado.datos && (
        <>
          <article className="hoja-pdf" aria-label="Vista previa del PDF">
            <header className="hoja-pdf__encabezado">
              <img src={logoDucky} alt="" />
              <div>
                <span className="hoja-pdf__institucion">Universidad Ducky · Biblioteca</span>
                <h2>Listado de libros</h2>
              </div>
            </header>
            <p className="hoja-pdf__criterio">{encabezado}</p>
            {listado.datos.map((item) => (
              <section key={item.libro.isbn} className="hoja-pdf__libro">
                <h3>{item.libro.titulo}</h3>
                <p className="hoja-pdf__detalle">{detalleLibro(item)}</p>
                {item.ejemplares.length === 0 ? (
                  <p className="hoja-pdf__sin-ejemplares">Sin ejemplares registrados</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Ejemplar</th>
                        <th>Estado</th>
                        <th>Modalidad</th>
                        <th>Ubicación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.ejemplares.map((e) => (
                        <tr key={e.idEjemplar}>
                          <td>{folioEjemplar(e.idEjemplar)}</td>
                          <td>
                            <Insignia color={COLOR_ESTADO_EJEMPLAR[e.estado]}>{e.estado}</Insignia>
                          </td>
                          <td>{e.modalidad}</td>
                          <td>{textoUbicacion(e)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            ))}
          </article>

          <div className="acciones">
            <Boton
              disabled={!pdf}
              onClick={() => void ejecutar((blob) => descargarPdf(blob).then(() => setDescargado(true)))}
            >
              Descargar PDF
            </Boton>
            <Boton variante="secundario" disabled={!pdf} onClick={() => void ejecutar(imprimirListado)}>
              Imprimir
            </Boton>
          </div>
          <Boton variante="secundario" ancho disabled={!pdf} onClick={() => setCompartiendo(true)}>
            Enviar por WhatsApp
          </Boton>
        </>
      )}

      {pdf && (
        <>
          <DescargaCompletada
            abierta={descargado}
            nombre={NOMBRE_PDF}
            tamano={tamanoLegible(pdf)}
            alCerrar={() => setDescargado(false)}
          />
          <HojaCompartir
            abierta={compartiendo}
            nombre={NOMBRE_PDF}
            tamano={tamanoLegible(pdf)}
            alCerrar={() => setCompartiendo(false)}
            alCompartir={() => {
              setCompartiendo(false);
              void ejecutar(compartirPdf);
            }}
          />
        </>
      )}
    </Pantalla>
  );
}
