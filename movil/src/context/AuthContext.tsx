import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { inicializarHttp, registrarExpiracionSesion, sesionHttp } from '../services/http';
import type { UsuarioSesion } from '../types/modelos';

interface ValorAuth {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  sesionExpirada: boolean;
  iniciarSesion: (matricula: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<ValorAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sesionExpirada, setSesionExpirada] = useState(false);

  const cerrarSesion = useCallback(async () => {
    await sesionHttp.borrarToken();
    setUsuario(null);
  }, []);

  // Al abrir la app, recupera la sesión con el token guardado en el dispositivo
  useEffect(() => {
    registrarExpiracionSesion(() => {
      void cerrarSesion();
      setSesionExpirada(true);
    });
    const recuperar = async () => {
      await inicializarHttp();
      if (!sesionHttp.hayToken()) return;
      try {
        const { usuario: perfil } = await authService.perfil();
        setUsuario(perfil);
      } catch {
        await sesionHttp.borrarToken();
      }
    };
    void recuperar().finally(() => setCargando(false));
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (matricula: string, contrasena: string) => {
    const { token, usuario: sesion } = await authService.login(matricula, contrasena);
    await sesionHttp.guardarToken(token);
    setSesionExpirada(false);
    setUsuario(sesion);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, sesionExpirada, iniciarSesion, cerrarSesion }),
    [usuario, cargando, sesionExpirada, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth(): ValorAuth {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
