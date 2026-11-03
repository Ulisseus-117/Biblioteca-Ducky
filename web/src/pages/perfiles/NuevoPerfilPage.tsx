import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { permisosDeFunciones } from '../../config/permisos';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { perfilesService } from '../../services/perfiles.service';
import { ListaFunciones } from './ListaFunciones';

export function NuevoPerfilPage() {
  const navegar = useNavigate();
  const { datos: catalogo } = useConsulta(() => perfilesService.permisos(), []);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activas, setActivas] = useState<Set<string>>(new Set());
  const [errorNombre, setErrorNombre] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (clave: string, activa: boolean) => {
    const nuevas = new Set(activas);
    if (activa) nuevas.add(clave);
    else nuevas.delete(clave);
    setActivas(nuevas);
  };

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorNombre('El nombre del perfil es obligatorio');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await perfilesService.crear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        permisos: permisosDeFunciones(activas, catalogo ?? []),
      });
      navegar('/usuarios/perfiles', { state: { aviso: 'El perfil se creó correctamente.' } });
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla migas={[{ texto: 'Gestión de usuarios', ruta: '/usuarios' }, { texto: 'Nuevo perfil' }]}>
      <EncabezadoPagina
        titulo="Nuevo perfil"
        descripcion="Define el nombre del perfil y las funciones a las que tendrá acceso."
      >
        <Link to="/usuarios/perfiles" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      <form className="formulario formulario--completo" onSubmit={crear} noValidate>
        <Alerta tipo="info">El perfil nuevo no afecta los permisos absolutos del administrador.</Alerta>
        {error && <Alerta tipo="error">{error}</Alerta>}
        <CampoTexto
          etiqueta="Nombre del perfil"
          ancho={320}
          maxLength={100}
          value={nombre}
          error={errorNombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrorNombre(undefined);
          }}
        />
        <CampoTexto
          etiqueta="Descripción de permisos"
          ancho={320}
          maxLength={500}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <ListaFunciones activas={activas} alCambiar={cambiar} />
        <div className="acciones">
          <Boton type="submit" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear perfil'}
          </Boton>
          <Link to="/usuarios/perfiles" className="btn btn--secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </Pantalla>
  );
}
