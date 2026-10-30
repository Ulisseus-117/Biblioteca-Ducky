import { Capacitor } from '@capacitor/core';
import { Boton } from '../../components/ui/Boton';

interface Props {
  abierta: boolean;
  nombre: string;
  tamano: string;
  alCerrar: () => void;
}

/** Aviso "Descarga completada" del prototipo (PDF enviado a Descargas). */
export function DescargaCompletada({ abierta, nombre, tamano, alCerrar }: Props) {
  if (!abierta) return null;
  // En Android el archivo se guarda en Documentos; en el navegador, en Descargas
  const carpeta = Capacitor.isNativePlatform() ? 'Documentos' : 'Descargas';
  return (
    <div
      className="fondo-modal fondo-modal--centro"
      role="dialog"
      aria-modal="true"
      aria-label="Descarga completada"
    >
      <div className="aviso">
        <h2 className="aviso__titulo">Descarga completada</h2>
        <div className="aviso__archivo">
          <span className="aviso__icono-pdf">PDF</span>
          <div>
            <strong>{nombre}</strong>
            <span>
              Guardado en {carpeta} · {tamano}
            </span>
          </div>
        </div>
        <Boton onClick={alCerrar}>Aceptar</Boton>
      </div>
    </div>
  );
}
