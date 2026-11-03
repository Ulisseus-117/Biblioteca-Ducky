import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoDucky from '../../assets/logo-ducky.png';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Aviso } from '../../components/ui/Aviso';
import { Boton } from '../../components/ui/Boton';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { Insignia } from '../../components/ui/Insignia';
import { COLOR_ESTADO_EJEMPLAR } from '../../config/colores';
import { useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import type { FiltrosLibros } from '../../services/libros.service';
import { obtenerListadoLibros } from '../../services/listado.service';
import {
  abrirWhatsappWeb,
  descargarPdf,
  detalleLibro,
  generarPdfListado,
  NOMBRE_PDF,
  tamanoLegible,
  textoWhatsapp,
} from '../../services/pdf.service';
import { folioEjemplar, textoUbicacion } from '../../utils/formato';
import { fechaDeHoy, textoCriterio } from '../../utils/listado';

type Dialogo = 'descarga' | 'whatsapp' | null;

/** 80 Listado de libros · Vista previa PDF: descargar, imprimir o enviar por WhatsApp. */
export function ListadoPdfPage() {
  const estado = useLocation().state as { filtros?: FiltrosLibros } | null;
  const filtros = useMemo(() => estado?.filtros ?? {}, [estado]);
  const temas = useConsulta(() => catalogosService.temas(), []);
  const listado = useConsulta(() => obtenerListadoLibros(filtros), [filtros]);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const encabezado = listado.datos
    ? textoCriterio(filtros, temas.datos ?? [], fechaDeHoy(), listado.datos.length)
    : '';

  useEffect(() => {
    if (!listado.datos || !temas.datos) return;
    generarPdfListado(listado.datos, encabezado)
      .then(setPdf)
      .catch(() => setError('No se pudo generar el PDF.'));
  }, [listado.datos, temas.datos, encabezado]);

  const descargar = () => {
    if (!pdf) return;
    descargarPdf(pdf);
    setDialogo('descarga');
  };

  const enviarWhatsapp = () => {
    if (!listado.datos) return;
    abrirWhatsappWeb(textoWhatsapp(listado.datos, encabezado));
    setDialogo('whatsapp');
  };

  return (
    <Pantalla migas={[{ texto: 'Consulta de libros', ruta: '/consulta' }, { texto: 'Listado en PDF' }]}>
      <EncabezadoPagina
        titulo="Listado de libros"
        descripcion="Vista previa del PDF generado a partir de tu búsqueda."
      >
        <Link to="/consulta" state={{ filtros }} className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver a resultados
        </Link>
      </EncabezadoPagina>

      <div className="acciones no-imprimir">
        <Boton onClick={descargar} disabled={!pdf}>
          Descargar PDF
        </Boton>
        <Boton variante="secundario" onClick={() => window.print()} disabled={!listado.datos}>
          Imprimir
        </Boton>
        <Boton variante="secundario" onClick={enviarWhatsapp} disabled={!listado.datos}>
          Enviar por WhatsApp
        </Boton>
      </div>

      {(listado.error || error) && <Alerta tipo="error">{listado.error ?? error}</Alerta>}

      <div className="visor-pdf">
        {listado.cargando && <p className="texto-secundario">Generando listado…</p>}
        {listado.datos && (
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
                  <div className="tabla-contenedor">
                    <table className="tabla">
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
                              <Insignia color={COLOR_ESTADO_EJEMPLAR[e.estado] ?? 'gris'}>
                                {e.estado}
                              </Insignia>
                            </td>
                            <td>{e.modalidad}</td>
                            <td>{textoUbicacion(e)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </article>
        )}
      </div>

      {dialogo === 'descarga' && pdf && (
        <Aviso titulo="Descarga completada" alAceptar={() => setDialogo(null)}>
          <div className="aviso__archivo">
            <span className="aviso__icono-pdf">PDF</span>
            <div>
              <strong>{NOMBRE_PDF}</strong>
              <span>Guardado en Descargas · {tamanoLegible(pdf)}</span>
            </div>
          </div>
        </Aviso>
      )}
      {dialogo === 'whatsapp' && listado.datos && (
        <Aviso titulo="Se abrió WhatsApp Web en una pestaña nueva" alAceptar={() => setDialogo(null)}>
          <p className="aviso__texto">
            Elige el chat en WhatsApp Web y envía el mensaje. Si no has iniciado sesión, vincula tu cuenta con
            el código QR y el mensaje seguirá listo. Este es el texto que se envía:
          </p>
          <pre className="aviso__mensaje">{textoWhatsapp(listado.datos, encabezado)}</pre>
        </Aviso>
      )}
    </Pantalla>
  );
}
