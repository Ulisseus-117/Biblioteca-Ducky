import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import logoDucky from '../../assets/logo-ducky.png';
import logoDuckTech from '../../assets/logo-duck-tech.png';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoTexto } from '../../components/ui/Campo';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/http';

export function LoginPage() {
  const { usuario, iniciarSesion, sesionExpirada } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [matricula, setMatricula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<{ mensaje: string; bloqueo: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!matricula.trim() || !contrasena) {
      setError({ mensaje: 'Completa usuario y contraseña para iniciar sesión.', bloqueo: false });
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(matricula.trim(), contrasena);
      navegar((ubicacion.state as { desde?: string } | null)?.desde ?? '/', { replace: true });
    } catch (e) {
      const apiError = e instanceof ApiError ? e : null;
      setError({
        mensaje: apiError?.message ?? 'No se pudo conectar con el servidor',
        bloqueo: apiError?.codigo === 'BLOQUEO_TEMPORAL',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <div className="login__barra">
        <img src={logoDucky} alt="Logo Universidad Ducky" />
      </div>
      <div className="login__cuerpo">
        <h1 className="login__titulo">Biblioteca Universidad Ducky</h1>
        <form className="login__tarjeta" onSubmit={enviar} noValidate>
          <h2 className="seccion-titulo">Iniciar sesión</h2>
          {sesionExpirada && !error && (
            <Alerta tipo="advertencia">Tu sesión expiró por inactividad. Inicia sesión de nuevo.</Alerta>
          )}
          {error && <Alerta tipo={error.bloqueo ? 'advertencia' : 'error'}>{error.mensaje}</Alerta>}
          <CampoTexto
            etiqueta="Usuario (Matrícula/Nómina)"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <CampoTexto
            etiqueta="Contraseña"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
          />
          <p className="texto-ayuda">
            ¿Olvidaste tu contraseña? Acude con el administrador de la biblioteca para que te genere una
            nueva.
          </p>
          <div className="acciones" style={{ justifyContent: 'center' }}>
            <Boton type="submit" disabled={enviando}>
              {enviando ? 'Validando…' : 'Iniciar sesión'}
            </Boton>
          </div>
        </form>
        <div className="login__creditos">
          Desarrollado por
          <img src={logoDuckTech} alt="Logo Duck Tech" />
        </div>
      </div>
    </div>
  );
}
