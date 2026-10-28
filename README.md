# Sistema de Préstamos · Biblioteca Universidad Ducky

Equipo **Duck Tech** · SC2234 Ingeniería de Software · Sprint 1 (gestión de usuarios y gestión de libros)

Aplicación web basada en el prototipo de Figma, con patrón **MVC**, código modular y estándar de codificación,
conectada a una base de datos **MySQL local**.

| Capa | Tecnología | Carpeta |
|---|---|---|
| Base de datos | MySQL 8 | `database/` |
| Servidor / API REST | Node.js 22 + Express 5 + TypeScript | `api/` |
| Cliente web | React 19 + TypeScript + Vite | `web/` |

---

## 1. Qué incluye

**Pantallas (del Figma, sección "3 · Prototipo")**

- Login con validación de campos vacíos, credenciales incorrectas, bloqueo temporal tras 5 intentos y sesión expirada.
- Gestión de usuarios: consulta con filtros (matrícula, rol, estado), orden por columna, paginación, alta, cambio,
  baja lógica (desactivar) con sus rechazos (multas pendientes, préstamos activos, último administrador) y reactivación.
- Gestión de libros: lista con búsqueda y "Más filtros", nuevo libro, editar (incluye ISBN duplicado), ficha y baja
  (rechazada si hay ejemplares prestados o reservados).
- Ejemplares: lista con filtros por libro, ID, estado, modalidad y ubicación; registrar N ejemplares; cambio de ejemplar
  (Prestado y Reservado no se cambian a mano) y baja.
- Solicitud de compra: nueva solicitud con libros del catálogo o libros nuevos, consulta con filtros y detalle.
- Consulta de libros (todos los roles): búsqueda combinada por título, autor, tema, ISBN, editorial, año y existencias.
- Menú lateral según el rol: el administrador ve todo; el bibliotecario, libros, ejemplares y consulta;
  alumno y profesor, solo consulta. El permiso se valida en la API, no solo en la pantalla.

**Base de datos (`database/`)**

- `schema.sql`: modelo v4 + REGLA_PRESTAMO completo (17 tablas), llaves, `CHECK`, índices recomendados,
  triggers para campos calculados (`num_ejemplares`, `costo_multa`, totales de solicitud), función
  `fn_sumar_dias_habiles` (para el Sprint 3) y vista `vw_usuarios_con_adeudo`.
- `seed.sql`: roles, permisos, reglas de préstamo, usuarios demo, ubicaciones, 12 libros con autores y temas,
  46 ejemplares, préstamos, una multa y solicitudes de ejemplo.
- `create-user.sql`: usuario de MySQL exclusivo para la app (`ducky_app`).

---

## 2. Instalación paso a paso (en tu computadora)

### Paso 1. Instala Node.js

1. Entra a <https://nodejs.org> y descarga la versión **LTS** (22 o más reciente).
2. Instálalo con las opciones por defecto.
3. Abre una terminal nueva (PowerShell en Windows, Terminal en macOS) y comprueba:

   ```bash
   node -v    # debe mostrar v22.x o mayor
   npm -v
   ```

### Paso 2. Instala MySQL Server 8

**Windows**

1. Descarga **MySQL Installer** desde <https://dev.mysql.com/downloads/installer/>.
2. Elige **Custom** y selecciona *MySQL Server 8.x* y *MySQL Workbench*.
3. En *Accounts and Roles* define una contraseña para `root` y **anótala**.
4. Deja el puerto **3306** y marca "Start the MySQL Server at System Startup".

**macOS** (con Homebrew)

```bash
brew install mysql
brew services start mysql
mysql_secure_installation   # define la contraseña de root
```

Comprueba que funciona:

```bash
mysql -u root -p -e "SELECT VERSION();"
```

> Si en Windows `mysql` "no se reconoce como comando", usa **MySQL Workbench** para los pasos siguientes
> (File → Open SQL Script → botón del rayo ⚡ para ejecutar), o agrega
> `C:\Program Files\MySQL\MySQL Server 8.0\bin` a la variable PATH.

### Paso 3. Crea la base de datos

Desde la carpeta del proyecto, ejecuta los tres scripts **en este orden**:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/create-user.sql
```

En PowerShell el símbolo `<` no funciona; usa en su lugar:

```powershell
Get-Content database/schema.sql | mysql -u root -p
Get-Content database/seed.sql | mysql -u root -p
Get-Content database/create-user.sql | mysql -u root -p
```

Comprueba:

```bash
mysql -u root -p -e "USE biblioteca_ducky; SELECT titulo, num_ejemplares FROM libro LIMIT 5;"
```

> `schema.sql` **borra y vuelve a crear** la base `biblioteca_ducky`. Úsalo también para reiniciar los datos demo.

### Paso 4. Configura y arranca el servidor (API)

```bash
cd api
npm install
```

Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows
```

Abre `api/.env` y revisa los datos. Si no cambiaste nada en `create-user.sql`, ya funcionan tal cual:

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=ducky_app
DB_PASSWORD=DuckyApp2026!
DB_NAME=biblioteca_ducky
JWT_SECRET=cambia-esta-clave-por-una-larga-y-secreta
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

Arranca la API en modo desarrollo:

```bash
npm run dev
```

Debes ver:

```
Conectado a MySQL (localhost:3306/biblioteca_ducky)
API de la Biblioteca Ducky escuchando en http://localhost:3000/api
```

Prueba en el navegador: <http://localhost:3000/api/salud> → `{"estado":"ok"}`. **Deja esta terminal abierta.**

### Paso 5. Arranca el cliente web

En **otra** terminal:

```bash
cd web
npm install
npm run dev
```

Abre <http://localhost:5173>. Vite reenvía las llamadas `/api` al servidor del paso 4.

### Paso 6. Inicia sesión

Todas las cuentas demo usan la contraseña **`1234`** (igual que en el prototipo de Figma):

| Usuario | Rol | Qué ve |
|---|---|---|
| `admin` | Administrador | Todo |
| `bibliotecario` | Bibliotecario | Libros, ejemplares y consulta |
| `alumno` | Alumno | Solo consulta |
| `prof` | Profesor | Solo consulta |

Datos útiles para probar los rechazos: `A01235011` tiene una multa sin pagar, `A01234890` tiene un préstamo activo,
y "To Kill a Mockingbird" tiene ejemplares prestados y reservados.

---

## 3. Arquitectura (MVC)

```
Navegador (React)  ──HTTP/JSON──▶  Rutas ─▶ Middlewares ─▶ Controlador ─▶ Servicio ─▶ Modelo ─▶ MySQL
      VISTA                                 (auth, permisos,  (HTTP)       (reglas de    (SQL)
                                             validación)                    negocio)
```

| Rol MVC | Dónde | Responsabilidad |
|---|---|---|
| **Modelo** | `api/src/models/` | Único lugar con SQL. Usa consultas parametrizadas (`?`) contra MySQL. |
| **Controlador** | `api/src/controllers/` | Recibe la petición HTTP, llama al servicio y responde JSON. Sin SQL ni reglas. |
| **Vista** | `web/src/pages/` y `web/src/components/` | Pantallas del Figma. Solo presenta; las reglas viven en el servidor. |
| Servicios | `api/src/services/` | Reglas de negocio (ej. no desactivar a un usuario con multas). Separan el controlador del modelo. |
| Rutas y middlewares | `api/src/routes/`, `api/src/middlewares/` | URL → controlador, sesión JWT, permisos por rol (`rol_permiso`), validación con zod y errores uniformes. |

```
biblioteca-ducky/
├── database/            schema.sql · seed.sql · create-user.sql
├── api/src/
│   ├── config/          env.ts (variables) · database.ts (pool MySQL)
│   ├── models/          usuario · rol · libro · ejemplar · solicitud · catalogo
│   ├── services/        auth · usuario · libro · ejemplar · solicitud
│   ├── controllers/     un controlador por recurso
│   ├── routes/          un router por recurso + index.ts
│   ├── middlewares/     auth · validate · error
│   ├── validators/      esquemas zod de entrada
│   ├── utils/           http-error · pagination
│   ├── app.ts           arma la app de Express
│   └── server.ts        prueba la BD y levanta el servidor
└── web/src/
    ├── pages/           una carpeta por módulo (usuarios, libros, ejemplares, solicitudes, consulta, auth)
    ├── components/ui/   Boton, Campo, Tabla, Paginacion, Modal, Alerta, Insignia, Icono…
    ├── components/layout/ BarraLateral, Pantalla (topbar + tarjeta), RutaProtegida
    ├── services/        cliente HTTP y un servicio por recurso de la API
    ├── context/         AuthContext (sesión y permisos)
    ├── config/          menú por permiso y colores de insignias
    └── styles/          tokens.css (variables del Design System) · global.css
```

### Endpoints principales

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/auth/perfil` | sesión |
| GET · POST | `/api/usuarios` | `usuarios.gestionar` |
| GET · PUT | `/api/usuarios/:matricula` | `usuarios.gestionar` |
| PATCH | `/api/usuarios/:matricula/desactivar` · `/reactivar` | `usuarios.gestionar` |
| GET | `/api/libros` · `/api/libros/:isbn` | `catalogo.consultar` o `libros.gestionar` |
| POST · PUT · DELETE | `/api/libros[/:isbn]` | `libros.gestionar` |
| GET | `/api/ejemplares` | `catalogo.consultar` o `ejemplares.gestionar` |
| POST · PUT · DELETE | `/api/ejemplares[/:id]` | `ejemplares.gestionar` |
| GET · POST | `/api/solicitudes` · PATCH `/api/solicitudes/:id/estado` | `solicitudes.gestionar` |
| GET | `/api/catalogos/roles · autores · temas · ubicaciones` | sesión |

Errores siempre con la forma `{ "error": { "mensaje": "...", "codigo": "..." } }`.

---

## 4. Estándar de codificación

Ver [`docs/CONVENCIONES.md`](docs/CONVENCIONES.md). Comandos:

```bash
cd api && npm run lint && npm run format     # ESLint + Prettier
cd web && npm run lint && npm run format     # oxlint + Prettier
```

---

## 5. Problemas comunes

| Síntoma | Solución |
|---|---|
| `No se pudo conectar a MySQL` al arrancar la API | Verifica que el servicio MySQL esté encendido (Windows: *Servicios → MySQL80*; macOS: `brew services list`) y que `DB_USER`/`DB_PASSWORD` de `.env` coincidan con `create-user.sql`. |
| `Access denied for user 'ducky_app'` | Vuelve a ejecutar `database/create-user.sql` como root. |
| `ER_NOT_SUPPORTED_AUTH_MODE` | Ejecuta como root: `ALTER USER 'ducky_app'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'DuckyApp2026!';` |
| `Falta la variable de entorno ...` | No copiaste `.env.example` a `.env` dentro de `api/`. |
| La página carga pero dice "No se pudo conectar con el servidor" | La API no está corriendo: abre otra terminal y ejecuta `cd api && npm run dev`. |
| El puerto 3000 o 5173 está ocupado | Cambia `PORT` en `api/.env` (y el proxy en `web/vite.config.ts`), o cierra el programa que lo usa. |
| Quiero reiniciar los datos demo | Ejecuta de nuevo `schema.sql`, `seed.sql` y `create-user.sql`. |
| Quiero crear un usuario a mano en SQL | Genera el hash con `cd api && npm run hash -- MiContrasena` y úsalo en el `INSERT`. |

---

## 6. Pendientes (de la sección 11 del documento de contexto)

- `REGLA_PRESTAMO.max_libros` del profesor queda en `NULL` hasta que el Product Owner lo defina.
- El modelo no guarda nombre de la persona; la barra superior muestra matrícula y rol.
- "Perfiles y permisos" (pantallas 29.x del Figma) y la app móvil no están en este entregable;
  los permisos se administran por ahora desde `seed.sql` (tablas `permiso` y `rol_permiso`).
- Préstamos, devoluciones, renovaciones, multas y reportes corresponden al Sprint 3; la BD ya tiene las tablas,
  la función de días hábiles y la vista de adeudos.
