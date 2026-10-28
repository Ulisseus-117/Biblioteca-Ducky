# Estándar de codificación · Duck Tech

Aplica a `api/` y `web/`. Las herramientas lo revisan de forma automática:
**Prettier** (formato), **ESLint** en la API y **oxlint** en el cliente web, y **TypeScript estricto** (`strict: true`).

## Idioma y nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Dominio (variables, funciones, tablas, columnas) | Español, sin abreviar | `contarPrestamosActivos`, `fecha_devolucion_real` |
| Variables y funciones | `camelCase` | `idUbicacion`, `obtenerLibro()` |
| Componentes React, tipos e interfaces | `PascalCase` | `LibroFormPage`, `FiltrosLibro` |
| Constantes globales | `UPPER_SNAKE_CASE` | `TAMANO_PAGINA`, `ESTADOS_EJEMPLAR` |
| Tablas y columnas MySQL | `snake_case` en minúsculas | `regla_prestamo.max_renovaciones` |
| Restricciones MySQL | prefijo + tabla | `pk_`, `fk_`, `uq_`, `ck_`, `ix_`, `trg_`, `sp_`, `fn_`, `vw_` |
| Archivos de la API | `recurso.capa.ts` | `libro.model.ts`, `libro.controller.ts` |
| Archivos de páginas | `NombrePage.tsx` | `UsuariosPage.tsx` |
| Rutas REST | sustantivo en plural, minúsculas | `/api/ejemplares/:id` |

Los términos técnicos de las librerías se dejan en inglés (`req`, `res`, `router`, `props`).

## Formato (Prettier)

- 2 espacios, comillas simples, punto y coma, coma final, líneas de máximo 110 caracteres.
- `npm run format` en `api/` y en `web/`.

## Reglas de diseño

1. **MVC estricto**: el SQL solo vive en `models/`; las reglas de negocio en `services/`;
   los controladores solo traducen HTTP ↔ servicio. La vista (React) no decide reglas.
2. **Un módulo por recurso**: cada recurso (usuarios, libros, ejemplares, solicitudes) tiene su modelo, servicio,
   controlador, rutas, validador y servicio del cliente.
3. **Seguridad**
   - Consultas siempre parametrizadas (`?`); el `ORDER BY` solo acepta columnas de una lista blanca.
   - Contraseñas con bcrypt (10 rondas); nunca se devuelven ni se registran.
   - Toda ruta (salvo login y salud) exige token JWT y permiso por rol leído de `rol_permiso`.
   - Secretos en `.env`, que no se sube al repositorio.
4. **Validación** de toda entrada con zod en `validators/` antes de llegar al controlador.
5. **Errores**: lanzar `HttpError` con mensaje en español para el usuario y un `codigo` estable para el cliente.
6. **Sin borrado físico** de usuarios ni de ejemplares con historial: se usa `activo` o el estado.
7. **Componentes reutilizables** en `web/src/components/ui/`; colores y medidas solo desde `styles/tokens.css`
   (variables del Design System de Figma), nunca valores sueltos.
8. **Comentarios** solo para explicar el *porqué* (una regla de negocio, una decisión). JSDoc corto en funciones públicas.

## Git

- Ramas: `main` (estable), `feature/<modulo>-<descripcion>` (ej. `feature/usuarios-reactivar`).
- Commits en español, en imperativo y con prefijo: `feat:`, `fix:`, `refactor:`, `docs:`, `db:`.
  Ejemplo: `feat: agregar baja lógica de usuarios`.
- Antes de cada commit: `npm run lint` y que compile (`npm run build`).
