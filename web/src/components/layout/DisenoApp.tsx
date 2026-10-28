import { Outlet } from 'react-router-dom';
import { BarraLateral } from './BarraLateral';

export function DisenoApp() {
  return (
    <div className="app-layout">
      <BarraLateral />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
