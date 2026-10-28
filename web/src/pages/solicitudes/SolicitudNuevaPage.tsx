import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { BotonIcono } from '../../components/ui/BotonIcono';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { librosService } from '../../services/libros.service';
import { solicitudesService } from '../../services/solicitudes.service';
import type { LineaSolicitud } from '../../types/modelos';
import { folioSolicitud, formatoMoneda } from '../../utils/formato';

interface LineaVista extends LineaSolicitud {
  titulo: string;
  autor: string;
}

const NUEVO_VACIO = { titulo: '', autor: '', isbn: '', ejemplares: '', costo: '' };

/** Valida ejemplares (entero > 0) y costo (>= 0). Devuelve un mensaje o null. */
function validarCantidades(ejemplares: string, costo: string): string | null {
  const n = Number(ejemplares);
  const c = Number(costo);
  if (!ejemplares || !Number.isInteger(n) || n < 1)
    return 'Los ejemplares deben ser un número entero mayor a 0.';
  if (costo === '' || Number.isNaN(c) || c < 0)
    return 'El costo unitario debe ser un número mayor o igual a 0.';
  return null;
}

export function SolicitudNuevaPage() {
  const navegar = useNavigate();
  const libros = useConsulta(() => librosService.opciones(), []);
  const [lineas, setLineas] = useState<LineaVista[]>([]);
  const [existente, setExistente] = useState({ isbn: '', ejemplares: '', costo: '' });
  const [nuevo, setNuevo] = useState(NUEVO_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const total = lineas.reduce((suma, l) => suma + l.numEjemplares * l.costoUnitario, 0);

  const agregar = (linea: LineaVista) => {
    if (lineas.some((l) => l.isbn === linea.isbn)) {
      setError('Ese libro ya está en la solicitud. Quítalo y agrégalo con la cantidad total.');
      return false;
    }
    setLineas([...lineas, linea]);
    setError(null);
    return true;
  };

  const agregarExistente = async () => {
    if (!existente.isbn) return setError('Selecciona un libro del catálogo.');
    const problema = validarCantidades(existente.ejemplares, existente.costo);
    if (problema) return setError(problema);
    const libro = await librosService.obtener(existente.isbn);
    const agregado = agregar({
      isbn: libro.isbn,
      titulo: libro.titulo,
      autor: libro.autores.map((a) => a.nombre).join(', '),
      numEjemplares: Number(existente.ejemplares),
      costoUnitario: Number(existente.costo),
    });
    if (agregado) setExistente({ isbn: '', ejemplares: '', costo: '' });
  };

  const agregarNuevo = () => {
    if (!nuevo.titulo.trim() || !nuevo.autor.trim() || !nuevo.isbn.trim()) {
      return setError('Para un libro nuevo captura título, autor e ISBN.');
    }
    if (libros.datos?.some((l) => l.isbn === nuevo.isbn.trim())) {
      return setError('Ese ISBN ya existe en el catálogo. Agrégalo desde "Libro existente".');
    }
    const problema = validarCantidades(nuevo.ejemplares, nuevo.costo);
    if (problema) return setError(problema);
    const agregado = agregar({
      isbn: nuevo.isbn.trim(),
      titulo: nuevo.titulo.trim(),
      autor: nuevo.autor.trim(),
      numEjemplares: Number(nuevo.ejemplares),
      costoUnitario: Number(nuevo.costo),
      libroNuevo: { titulo: nuevo.titulo.trim(), autor: nuevo.autor.trim() },
    });
    if (agregado) setNuevo(NUEVO_VACIO);
  };

  const generar = async () => {
    if (!lineas.length) return setError('Agrega al menos un libro para generar la solicitud.');
    setEnviando(true);
    try {
      const solicitud = await solicitudesService.crear(
        lineas.map(({ isbn, numEjemplares, costoUnitario, libroNuevo }) => ({
          isbn,
          numEjemplares,
          costoUnitario,
          libroNuevo,
        })),
      );
      navegar(`/solicitudes/${solicitud.idSolicitud}`, {
        state: {
          aviso: `Solicitud ${folioSolicitud(solicitud.idSolicitud)} registrada y enviada a Tesorería.`,
        },
      });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const columnas: Columna<LineaVista>[] = [
    { clave: 'titulo', titulo: 'Título', render: (l) => l.titulo },
    { clave: 'autor', titulo: 'Autor', render: (l) => l.autor },
    { clave: 'isbn', titulo: 'ISBN', render: (l) => l.isbn },
    { clave: 'ejemplares', titulo: 'Ejemplares', render: (l) => l.numEjemplares },
    { clave: 'costo', titulo: 'Costo unitario', render: (l) => formatoMoneda(l.costoUnitario) },
    {
      clave: 'subtotal',
      titulo: 'Subtotal',
      render: (l) => formatoMoneda(l.numEjemplares * l.costoUnitario),
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (l) => (
        <BotonIcono
          icono="basura"
          variante="peligro"
          etiqueta={`Quitar ${l.titulo}`}
          onClick={() => setLineas(lineas.filter((x) => x.isbn !== l.isbn))}
        />
      ),
    },
  ];

  return (
    <Pantalla migas={[{ texto: 'Solicitud de compra', ruta: '/solicitudes' }, { texto: 'Nueva solicitud' }]}>
      <EncabezadoPagina
        titulo="Solicitud de compra"
        descripcion="Genera el detalle de libros, ejemplares y costo total para Tesorería. El sistema no realiza la compra."
      >
        <Link to="/solicitudes" className="btn btn--secundario">
          Consultar solicitudes
        </Link>
      </EncabezadoPagina>

      {error && <Alerta tipo="error">{error}</Alerta>}

      <div className="panel">
        <h2 className="seccion-titulo">Libro existente (del catálogo)</h2>
        <div className="fila" style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <CampoSeleccion
            etiqueta="Libro del catálogo"
            vacio="Selecciona un libro"
            opciones={(libros.datos ?? []).map((l) => ({ valor: l.isbn, texto: l.titulo }))}
            value={existente.isbn}
            onChange={(e) => setExistente({ ...existente, isbn: e.target.value })}
          />
          <CampoTexto
            etiqueta="Ejemplares"
            type="number"
            min={1}
            value={existente.ejemplares}
            onChange={(e) => setExistente({ ...existente, ejemplares: e.target.value })}
          />
          <CampoTexto
            etiqueta="Costo unitario (MXN)"
            type="number"
            min={0}
            step="0.01"
            value={existente.costo}
            onChange={(e) => setExistente({ ...existente, costo: e.target.value })}
          />
          <Boton variante="suave" onClick={agregarExistente}>
            Agregar libro +
          </Boton>
        </div>
      </div>

      <div className="panel">
        <h2 className="seccion-titulo">Libro nuevo (no existe en el catálogo)</h2>
        <div className="fila">
          <CampoTexto
            etiqueta="Título"
            value={nuevo.titulo}
            onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
          />
          <CampoTexto
            etiqueta="Autor"
            value={nuevo.autor}
            onChange={(e) => setNuevo({ ...nuevo, autor: e.target.value })}
          />
          <CampoTexto
            etiqueta="ISBN"
            value={nuevo.isbn}
            onChange={(e) => setNuevo({ ...nuevo, isbn: e.target.value })}
          />
        </div>
        <div className="fila" style={{ gridTemplateColumns: '1fr 1fr 2fr auto' }}>
          <CampoTexto
            etiqueta="Ejemplares"
            type="number"
            min={1}
            value={nuevo.ejemplares}
            onChange={(e) => setNuevo({ ...nuevo, ejemplares: e.target.value })}
          />
          <CampoTexto
            etiqueta="Costo unitario (MXN)"
            type="number"
            min={0}
            step="0.01"
            value={nuevo.costo}
            onChange={(e) => setNuevo({ ...nuevo, costo: e.target.value })}
          />
          <span />
          <Boton variante="suave" onClick={agregarNuevo}>
            Agregar libro +
          </Boton>
        </div>
        <p className="texto-ayuda">
          Al generar la solicitud, el libro nuevo se da de alta en el catálogo con 0 ejemplares.
        </p>
      </div>

      <h2 className="seccion-titulo">Libros de la solicitud</h2>
      <Tabla columnas={columnas} filas={lineas} clave={(l) => l.isbn} mensajeVacio="Aún no agregas libros." />
      <div className="total">
        Costo total: <strong>{formatoMoneda(total)} MXN</strong>
      </div>
      <div className="acciones">
        <Boton onClick={generar} disabled={enviando}>
          Generar solicitud
        </Boton>
        <Boton variante="secundario" onClick={() => navegar('/solicitudes')}>
          Cancelar
        </Boton>
      </div>
    </Pantalla>
  );
}
