import type { Perfil, Permiso } from '../types/modelos';

/**
 * Funciones que se activan o desactivan en "Perfiles y permisos" (pantallas 29.x del Figma).
 * Cada función agrupa uno o más permisos de la tabla `permiso`. Los permisos que no aparecen
 * aquí (préstamos, multas, etc. del Sprint 3) se conservan sin cambios al guardar.
 */
export interface Funcion {
  clave: string;
  titulo: string;
  descripcion: string;
  permisos: string[];
}

export const FUNCIONES: Funcion[] = [
  {
    clave: 'usuarios',
    titulo: 'Gestión de usuarios',
    descripcion: 'Altas, cambios, bajas y perfiles',
    permisos: ['usuarios.gestionar', 'perfiles.gestionar'],
  },
  {
    clave: 'libros',
    titulo: 'Gestionar libros',
    descripcion: 'Alta, edición y baja de libros',
    permisos: ['libros.gestionar'],
  },
  {
    clave: 'ejemplares',
    titulo: 'Ejemplares',
    descripcion: 'Registro y control de copias físicas',
    permisos: ['ejemplares.gestionar'],
  },
  {
    clave: 'solicitudes',
    titulo: 'Solicitud de compra',
    descripcion: 'Compra de nuevos títulos',
    permisos: ['solicitudes.gestionar'],
  },
  {
    clave: 'consulta',
    titulo: 'Consulta de libros',
    descripcion: 'Búsqueda de libros y ejemplares',
    permisos: ['catalogo.consultar'],
  },
];

export const PERFIL_ADMINISTRADOR = 'Administrador';

/** Función que el Administrador nunca puede desactivar. */
export const FUNCION_BLOQUEADA_ADMIN = 'usuarios';

/** Traduce nombres de permiso a ids según el catálogo de la API. */
function idsDe(nombres: string[], catalogo: Permiso[]): number[] {
  return catalogo.filter((p) => nombres.includes(p.nombre)).map((p) => p.idPermiso);
}

/** Claves de las funciones que el perfil tiene activas (todas sus permisos asignados). */
export function funcionesActivas(perfil: Perfil, catalogo: Permiso[]): Set<string> {
  return new Set(
    FUNCIONES.filter((f) => {
      const ids = idsDe(f.permisos, catalogo);
      return ids.length > 0 && ids.every((id) => perfil.permisos.includes(id));
    }).map((f) => f.clave),
  );
}

/**
 * Lista final de ids de permisos: los de las funciones activas más los permisos
 * del perfil que no pertenecen a ninguna función (se conservan tal cual).
 */
export function permisosDeFunciones(
  activas: Set<string>,
  catalogo: Permiso[],
  actuales: number[] = [],
): number[] {
  const deFunciones = new Set(
    idsDe(
      FUNCIONES.flatMap((f) => f.permisos),
      catalogo,
    ),
  );
  const conservados = actuales.filter((id) => !deFunciones.has(id));
  const elegidos = FUNCIONES.filter((f) => activas.has(f.clave)).flatMap((f) => idsDe(f.permisos, catalogo));
  return [...conservados, ...elegidos];
}
