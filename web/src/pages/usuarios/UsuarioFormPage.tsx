import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { usuariosService } from '../../services/usuarios.service';

/** Alta (/usuarios/nuevo) y cambio (/usuarios/:matricula/editar) de usuario. */
export function UsuarioFormPage() {
  const { matricula: matriculaParam } = useParams();
  const esEdicion = Boolean(matriculaParam);
  const navegar = useNavigate();

  const [matricula, setMatricula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idRol, setIdRol] = useState<number | ''>('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { datos: roles } = useConsulta(() => catalogosService.roles(), []);

  useEffect(() => {
    if (!matriculaParam) return;
    usuariosService
      .obtener(matriculaParam)
      .then((u) => {
        setMatricula(u.matricula);
        setIdRol(u.idRol);
      })
      .catch((e) => setErrorGeneral(mensajeDeError(e)));
  }, [matriculaParam]);

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!matricula.trim()) nuevos.matricula = 'La matrícula o nómina es obligatoria';
    if (!esEdicion && !contrasena) nuevos.contrasena = 'La contraseña es obligatoria';
    if (contrasena && contrasena.length < 4) nuevos.contrasena = 'Mínimo 4 caracteres';
    if (!idRol) nuevos.idRol = 'Selecciona un rol';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) setErrorGeneral('Completa los campos obligatorios para continuar.');
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;
    setGuardando(true);
    try {
      if (esEdicion && matriculaParam) {
        await usuariosService.actualizar(matriculaParam, {
          idRol: Number(idRol),
          contrasena: contrasena || undefined,
        });
        navegar('/usuarios', { state: { aviso: `Se actualizó el usuario ${matriculaParam}.` } });
      } else {
        await usuariosService.crear({ matricula: matricula.trim(), contrasena, idRol: Number(idRol) });
        navegar('/usuarios', { state: { aviso: `Se registró el usuario ${matricula.trim()}.` } });
      }
    } catch (e) {
      setErrorGeneral(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const titulo = esEdicion ? 'Cambio de usuario' : 'Alta de usuario';

  return (
    <Pantalla migas={[{ texto: 'Gestión de usuarios', ruta: '/usuarios' }, { texto: titulo }]}>
      <EncabezadoPagina
        titulo={titulo}
        descripcion={
          esEdicion
            ? 'Cambia el rol o genera una nueva contraseña. La matrícula no se puede modificar.'
            : 'Registra la cuenta de una persona ya validada con la información externa (CIA).'
        }
      >
        <Link to="/usuarios" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      <form className="formulario formulario--angosto" onSubmit={guardar} noValidate>
        {!esEdicion && (
          <Alerta tipo="info">
            Antes de registrar, valida la identidad y el rol de la persona con la información externa (CIA).
            El sistema solo guarda matrícula, contraseña (almacenada como hash, nunca en texto plano) y rol.
          </Alerta>
        )}
        {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}
        <CampoTexto
          etiqueta="Matrícula / Nómina"
          value={matricula}
          disabled={esEdicion}
          error={errores.matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />
        <CampoTexto
          etiqueta={esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          type="password"
          value={contrasena}
          error={errores.contrasena}
          autoComplete="new-password"
          onChange={(e) => setContrasena(e.target.value)}
        />
        <CampoSeleccion
          etiqueta="Rol"
          vacio="Selecciona un rol"
          opciones={(roles ?? []).map((r) => ({ valor: r.idRol, texto: r.nombre }))}
          value={idRol}
          error={errores.idRol}
          onChange={(e) => setIdRol(e.target.value ? Number(e.target.value) : '')}
        />
        <div className="acciones">
          <Boton type="submit" disabled={guardando}>
            {esEdicion ? 'Guardar cambios' : 'Registrar usuario'}
          </Boton>
          <Boton variante="secundario" onClick={() => navegar('/usuarios')}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Pantalla>
  );
}
