import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DisenoApp } from './components/layout/DisenoApp';
import { RutaProtegida } from './components/layout/RutaProtegida';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { ConsultaPage } from './pages/consulta/ConsultaPage';
import { EjemplarEditarPage } from './pages/ejemplares/EjemplarEditarPage';
import { EjemplaresPage } from './pages/ejemplares/EjemplaresPage';
import { EjemplaresRegistroPage } from './pages/ejemplares/EjemplaresRegistroPage';
import { LibroDetallePage } from './pages/libros/LibroDetallePage';
import { LibroFormPage } from './pages/libros/LibroFormPage';
import { LibrosPage } from './pages/libros/LibrosPage';
import { InicioRedirect } from './pages/sistema/InicioRedirect';
import { NoEncontradoPage } from './pages/sistema/NoEncontradoPage';
import { SolicitudDetallePage } from './pages/solicitudes/SolicitudDetallePage';
import { SolicitudesPage } from './pages/solicitudes/SolicitudesPage';
import { SolicitudNuevaPage } from './pages/solicitudes/SolicitudNuevaPage';
import { UsuarioFormPage } from './pages/usuarios/UsuarioFormPage';
import { UsuariosPage } from './pages/usuarios/UsuariosPage';

const conPermiso = (permiso: string, pagina: ReactNode) => (
  <RutaProtegida permisos={[permiso]}>{pagina}</RutaProtegida>
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RutaProtegida>
                <DisenoApp />
              </RutaProtegida>
            }
          >
            <Route index element={<InicioRedirect />} />

            <Route path="usuarios" element={conPermiso('usuarios.gestionar', <UsuariosPage />)} />
            <Route path="usuarios/nuevo" element={conPermiso('usuarios.gestionar', <UsuarioFormPage />)} />
            <Route
              path="usuarios/:matricula/editar"
              element={conPermiso('usuarios.gestionar', <UsuarioFormPage />)}
            />

            <Route path="libros" element={conPermiso('libros.gestionar', <LibrosPage />)} />
            <Route path="libros/nuevo" element={conPermiso('libros.gestionar', <LibroFormPage />)} />
            <Route path="libros/:isbn" element={conPermiso('libros.gestionar', <LibroDetallePage />)} />
            <Route path="libros/:isbn/editar" element={conPermiso('libros.gestionar', <LibroFormPage />)} />

            <Route path="ejemplares" element={conPermiso('ejemplares.gestionar', <EjemplaresPage />)} />
            <Route
              path="ejemplares/registrar"
              element={conPermiso('ejemplares.gestionar', <EjemplaresRegistroPage />)}
            />
            <Route
              path="ejemplares/:id/editar"
              element={conPermiso('ejemplares.gestionar', <EjemplarEditarPage />)}
            />

            <Route path="solicitudes" element={conPermiso('solicitudes.gestionar', <SolicitudesPage />)} />
            <Route
              path="solicitudes/nueva"
              element={conPermiso('solicitudes.gestionar', <SolicitudNuevaPage />)}
            />
            <Route
              path="solicitudes/:id"
              element={conPermiso('solicitudes.gestionar', <SolicitudDetallePage />)}
            />

            <Route path="consulta" element={conPermiso('catalogo.consultar', <ConsultaPage />)} />
            <Route
              path="consulta/:isbn"
              element={conPermiso('catalogo.consultar', <LibroDetallePage desdeConsulta />)}
            />

            <Route path="*" element={<NoEncontradoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
