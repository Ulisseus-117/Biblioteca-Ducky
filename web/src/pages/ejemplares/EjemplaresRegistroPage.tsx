import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { ejemplaresService } from '../../services/ejemplares.service';
import { librosService } from '../../services/libros.service';
import { MODALIDADES, type Modalidad } from '../../types/modelos';
import { textoUbicacion } from '../../utils/formato';

export function EjemplaresRegistroPage() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [isbn, setIsbn] = useState(parametros.get('isbn') ?? '');
  const [cantidad, setCantidad] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad | ''>('');
  const [idUbicacion, setIdUbicacion] = useState<number | ''>('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const libros = useConsulta(() => librosService.opciones(), []);
  const ubicaciones = useConsulta(() => catalogosService.ubicaciones(), []);
  const libro = libros.datos?.find((l) => l.isbn === isbn);

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    const nuevos: Record<string, string> = {};
    const numero = Number(cantidad);
    if (!isbn) nuevos.isbn = 'Selecciona un libro';
    if (!Number.isInteger(numero) || numero < 1 || numero > 50) {
      nuevos.cantidad = 'La cantidad debe ser un número entero entre 1 y 50';
    }
    if (!modalidad) nuevos.modalidad = 'Selecciona una modalidad';
    if (!idUbicacion) nuevos.idUbicacion = 'Selecciona una ubicación';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) {
      setErrorGeneral(
        nuevos.cantidad && Object.keys(nuevos).length === 1
          ? nuevos.cantidad
          : 'Completa los campos obligatorios.',
      );
      return;
    }
    setErrorGeneral(null);
    setGuardando(true);
    try {
      const { ids } = await ejemplaresService.registrar({
        isbn,
        cantidad: numero,
        modalidad: modalidad as Modalidad,
        idUbicacion: Number(idUbicacion),
      });
      navegar(`/ejemplares?isbn=${encodeURIComponent(isbn)}`, {
        state: {
          aviso: `Se registraron ${ids.length} ejemplares de "${libro?.titulo}" con estado Disponible.`,
        },
      });
    } catch (e) {
      setErrorGeneral(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla migas={[{ texto: 'Ejemplares', ruta: '/ejemplares' }, { texto: 'Registrar ejemplares' }]}>
      <EncabezadoPagina
        titulo="Registrar ejemplares"
        descripcion={`Da de alta las copias físicas${libro ? ` de "${libro.titulo}"` : ''}. Cada ejemplar recibe un identificador único y estado Disponible.`}
      >
        <Link to="/ejemplares" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      <form className="formulario formulario--angosto" onSubmit={guardar} noValidate>
        {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}
        <CampoSeleccion
          etiqueta="Libro *"
          vacio="Selecciona un libro"
          opciones={(libros.datos ?? []).map((l) => ({ valor: l.isbn, texto: `${l.titulo} · ${l.isbn}` }))}
          value={isbn}
          error={errores.isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <CampoTexto
          etiqueta="Cantidad de ejemplares *"
          type="number"
          min={1}
          max={50}
          value={cantidad}
          error={errores.cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
        <CampoSeleccion
          etiqueta="Modalidad *"
          vacio="Selecciona una modalidad"
          opciones={MODALIDADES.map((m) => ({ valor: m, texto: m }))}
          value={modalidad}
          error={errores.modalidad}
          onChange={(e) => setModalidad(e.target.value as Modalidad | '')}
        />
        <CampoSeleccion
          etiqueta="Ubicación física *"
          vacio="Selecciona una ubicación"
          opciones={(ubicaciones.datos ?? []).map((u) => ({
            valor: u.idUbicacion,
            texto: textoUbicacion(u),
          }))}
          value={idUbicacion}
          error={errores.idUbicacion}
          onChange={(e) => setIdUbicacion(e.target.value ? Number(e.target.value) : '')}
        />
        <div className="acciones">
          <Boton type="submit" disabled={guardando}>
            Registrar ejemplares
          </Boton>
          <Boton variante="secundario" onClick={() => navegar('/ejemplares')}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Pantalla>
  );
}
