import { Interruptor } from '../../components/ui/Interruptor';
import { FUNCIONES } from '../../config/permisos';

/** Lista de funciones con su interruptor, compartida por "Permisos · Perfil" y "Nuevo perfil". */
export function ListaFunciones({
  activas,
  alCambiar,
}: {
  activas: Set<string>;
  alCambiar: (clave: string, activa: boolean) => void;
}) {
  return (
    <ul className="lista-funciones">
      {FUNCIONES.map((f) => (
        <li key={f.clave} className="lista-funciones__fila">
          <div>
            <span className="lista-funciones__titulo">{f.titulo}</span>
            <span className="lista-funciones__descripcion">{f.descripcion}</span>
          </div>
          <Interruptor
            activo={activas.has(f.clave)}
            etiqueta={f.titulo}
            alCambiar={(activa) => alCambiar(f.clave, activa)}
          />
        </li>
      ))}
    </ul>
  );
}
