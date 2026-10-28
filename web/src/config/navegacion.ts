import type { NombreIcono } from '../components/ui/Icono';

export interface ElementoMenu {
  etiqueta: string;
  ruta: string;
  icono: NombreIcono;
  /** El elemento se muestra si el rol tiene alguno de estos permisos (tabla rol_permiso). */
  permisos: string[];
}

export const MENU: ElementoMenu[] = [
  { etiqueta: 'Gestión de usuarios', ruta: '/usuarios', icono: 'usuario', permisos: ['usuarios.gestionar'] },
  { etiqueta: 'Gestión de libros', ruta: '/libros', icono: 'libro', permisos: ['libros.gestionar'] },
  { etiqueta: 'Ejemplares', ruta: '/ejemplares', icono: 'copias', permisos: ['ejemplares.gestionar'] },
  {
    etiqueta: 'Solicitud de compra',
    ruta: '/solicitudes',
    icono: 'carrito',
    permisos: ['solicitudes.gestionar'],
  },
  { etiqueta: 'Consulta de libros', ruta: '/consulta', icono: 'buscar', permisos: ['catalogo.consultar'] },
];
