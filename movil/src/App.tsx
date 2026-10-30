import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { BotonAtrasAndroid } from './components/layout/BotonAtrasAndroid';
import { MenuLateral } from './components/layout/MenuLateral';
import { RutaProtegida } from './components/layout/RutaProtegida';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { BuscarLibrosPage } from './pages/consulta/BuscarLibrosPage';
import { EjemplaresPage } from './pages/consulta/EjemplaresPage';
import { FichaLibroPage } from './pages/consulta/FichaLibroPage';
import { FiltrosEjemplaresPage } from './pages/consulta/FiltrosEjemplaresPage';
import { FiltrosLibrosPage } from './pages/consulta/FiltrosLibrosPage';
import { ResultadosLibrosPage } from './pages/consulta/ResultadosLibrosPage';
import { VistaPreviaPdfPage } from './pages/consulta/VistaPreviaPdfPage';
import { InicioRedirect } from './pages/sistema/InicioRedirect';
import { NoEncontradoPage } from './pages/sistema/NoEncontradoPage';

const protegida = (pagina: ReactElement) => <RutaProtegida>{pagina}</RutaProtegida>;

/** La app móvil solo tiene la consulta de libros (sección "Móvil" del prototipo de Figma). */
function Rutas() {
  const { cargando } = useAuth();

  // Mientras se lee el token guardado en el dispositivo
  if (cargando) {
    return (
      <div className="cargando cargando--pantalla">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  return (
    <IonReactRouter>
      <BotonAtrasAndroid />
      <MenuLateral />
      <IonRouterOutlet id="contenido-principal">
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<InicioRedirect />} />
        <Route path="/consulta" element={protegida(<BuscarLibrosPage />)} />
        <Route path="/consulta/filtros" element={protegida(<FiltrosLibrosPage />)} />
        <Route path="/consulta/resultados" element={protegida(<ResultadosLibrosPage />)} />
        <Route path="/consulta/pdf" element={protegida(<VistaPreviaPdfPage />)} />
        <Route path="/consulta/libros/:isbn" element={protegida(<FichaLibroPage />)} />
        <Route path="/consulta/libros/:isbn/ejemplares" element={protegida(<EjemplaresPage />)} />
        <Route
          path="/consulta/libros/:isbn/ejemplares/filtros"
          element={protegida(<FiltrosEjemplaresPage />)}
        />
        <Route path="*" element={<NoEncontradoPage />} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

export function App() {
  return (
    <IonApp>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </IonApp>
  );
}
