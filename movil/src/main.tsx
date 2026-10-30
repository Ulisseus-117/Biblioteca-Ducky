import { setupIonicReact } from '@ionic/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { configurarPlataforma } from './config/plataforma';

/* Estilos base de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Design System de Biblioteca Ducky */
import './styles/tema.css';
import './styles/global.css';

setupIonicReact({ mode: 'md' });
void configurarPlataforma();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
