import { Icono } from './Icono';

interface Props {
  pagina: number;
  total: number;
  tamanoPagina: number;
  sustantivo: string;
  nota?: string;
  alCambiar: (pagina: number) => void;
}

export function Paginacion({ pagina, total, tamanoPagina, sustantivo, nota, alCambiar }: Props) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));
  const desde = total === 0 ? 0 : (pagina - 1) * tamanoPagina + 1;
  const hasta = Math.min(pagina * tamanoPagina, total);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="paginacion">
      <span className="paginacion__texto">
        Mostrando {desde}–{hasta} de {total} {sustantivo}
        {nota ? ` · ${nota}` : ''}
      </span>
      <div className="paginacion__controles">
        <button
          type="button"
          className="pagina-btn"
          disabled={pagina <= 1}
          onClick={() => alCambiar(pagina - 1)}
          aria-label="Página anterior"
        >
          <Icono nombre="chevronIzquierda" tamano={16} />
        </button>
        {paginas.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagina-btn ${p === pagina ? 'pagina-btn--activa' : ''}`}
            onClick={() => alCambiar(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="pagina-btn"
          disabled={pagina >= totalPaginas}
          onClick={() => alCambiar(pagina + 1)}
          aria-label="Página siguiente"
        >
          <Icono nombre="chevronDerecha" tamano={16} />
        </button>
      </div>
    </div>
  );
}
