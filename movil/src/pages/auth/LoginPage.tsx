import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import logoDucky from '../../assets/logo-ducky.png';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoTexto } from '../../components/ui/Campo';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/http';

interface ErrorLogin {
  mensaje: string;
  usuario?: string;
  contrasena?: string;
}

/** M01 Login y M02 Login · Credenciales incorrectas. */
export function LoginPage() {
  const { usuario, iniciarSesion, sesionExpirada } = useAuth();
  const ubicacion = useLocation();
  const [matricula, setMatricula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<ErrorLogin | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Con la sesión iniciada, regresa a la pantalla que se pidió o a la consulta (una sola redirección)
  if (usuario) {
    const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/consulta';
    return <Navigate to={destino} replace />;
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!matricula.trim() || !contrasena) {
      setError({
        mensaje: 'Completa usuario y contraseña para iniciar sesión.',
        usuario: matricula.trim() ? undefined : 'Campo obligatorio',
        contrasena: contrasena ? undefined : 'Campo obligatorio',
      });
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(matricula.trim(), contrasena);
      setContrasena('');
    } catch (e) {
      const apiError = e instanceof ApiError ? e : null;
      if (apiError?.status === 401) {
        setError({
          mensaje: 'Matrícula/nómina o contraseña incorrectos. Verifica tus datos.',
          usuario: 'Verifica tu matrícula o nómina',
          contrasena: 'Verifica tu contraseña',
        });
      } else {
        setError({ mensaje: apiError?.message ?? 'No se pudo conectar con el servidor' });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="pantalla">
        <div className="login__barra">
          <img src={logoDucky} alt="Logo Universidad Ducky" />
        </div>
        <div className="login__cuerpo">
          <h1 className="login__titulo">Biblioteca Universidad Ducky</h1>
          <form className="tarjeta login__tarjeta" onSubmit={enviar} noValidate>
            {sesionExpirada && !error && <Alerta>Tu sesión expiró. Inicia sesión de nuevo.</Alerta>}
            {error && <Alerta>{error.mensaje}</Alerta>}
            <h2 className="tarjeta__titulo">Iniciar sesión</h2>
            <CampoTexto
              etiqueta="Usuario (Matrícula/Nómina)"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              autoComplete="username"
              autoCapitalize="off"
              error={error?.usuario}
            />
            <CampoTexto
              etiqueta="Contraseña"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              error={error?.contrasena}
            />
            <p className="texto-ayuda">¿Olvidaste tu contraseña? Acude a la biblioteca.</p>
            <Boton type="submit" ancho disabled={enviando}>
              {enviando ? 'Validando…' : 'Iniciar sesión'}
            </Boton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
}
