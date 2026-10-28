import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { registrarExpiracionSesion, sesionStorage } from '../services/http';
import type { UsuarioSesion } from '../types/modelos';

interface ValorAuth {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  sesionExpirada: boolean;
  iniciarSesion: (matricula: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  tienePermiso: (...permisos: string[]) => boolean;
}

const AuthContext = createContext<ValorAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(() => Boolean(sesionStorage.obtenerToken()));
  const [sesionExpirada, setSesionExpirada] = useState(false);

  const cerrarSesion = useCallback(() => {
    sesionStorage.borrarToken();
    setUsuario(null);
  }, []);

  // Al recargar la página, recupera la sesión con el token guardado
  useEffect(() => {
    registrarExpiracionSesion(() => {
      cerrarSesion();
      setSesionExpirada(true);
    });
    if (!sesionStorage.obtenerToken()) return;
    authService
      .perfil()
      .then(({ usuario: perfil }) => setUsuario(perfil))
      .catch(() => sesionStorage.borrarToken())
      .finally(() => setCargando(false));
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (matricula: string, contrasena: string) => {
    const { token, usuario: sesion } = await authService.login(matricula, contrasena);
    sesionStorage.guardarToken(token);
    setSesionExpirada(false);
    setUsuario(sesion);
  }, []);

  const tienePermiso = useCallback(
    (...permisos: string[]) => permisos.some((p) => usuario?.permisos.includes(p)),
    [usuario],
  );

  const valor = useMemo(
    () => ({ usuario, cargando, sesionExpirada, iniciarSesion, cerrarSesion, tienePermiso }),
    [usuario, cargando, sesionExpirada, iniciarSesion, cerrarSesion, tienePermiso],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth(): ValorAuth {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
