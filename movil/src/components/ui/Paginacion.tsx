import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { plural } from '../../utils/formato';

interface Props {
  pagina: number;
  total: number;
  tamanoPagina: number;
  singular: string;
  pluralTexto: string;
  alCambiar: (pagina: number) => void;
}

/** "‹  Página 1 de 1 · 5 ejemplares  ›" (Mobile/Pagination del prototipo). */
export function Paginacion({ pagina, total, tamanoPagina, singular, pluralTexto, alCambiar }: Props) {
  const paginas = Math.max(Math.ceil(total / tamanoPagina), 1);
  return (
    <nav className="paginacion" aria-label="Paginación">
      <button
        type="button"
        className="paginacion__boton"
        aria-label="Página anterior"
        disabled={pagina <= 1}
        onClick={() => alCambiar(pagina - 1)}
      >
        <IonIcon icon={chevronBack} />
      </button>
      <span>
        Página {pagina} de {paginas} · {plural(total, singular, pluralTexto)}
      </span>
      <button
        type="button"
        className="paginacion__boton"
        aria-label="Página siguiente"
        disabled={pagina >= paginas}
        onClick={() => alCambiar(pagina + 1)}
      >
        <IonIcon icon={chevronForward} />
      </button>
    </nav>
  );
}
