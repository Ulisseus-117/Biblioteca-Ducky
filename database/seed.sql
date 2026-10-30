-- =====================================================================
--  Datos semilla (demo) · Biblioteca Universidad Ducky
--  Ejecutar DESPUÉS de schema.sql.
--  Todas las cuentas demo usan la contraseña 1234 (guardada como hash bcrypt).
-- =====================================================================
USE biblioteca_ducky;
-- Evita acentos rotos (ej. "FicciÃ³n") si la terminal no usa UTF-8
SET NAMES utf8mb4;

-- ---------- Roles ----------
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
  (1, 'Administrador', 'Acceso total: usuarios, perfiles, libros, ejemplares, solicitudes de compra y consulta.'),
  (2, 'Bibliotecario', 'Gestión de libros, ejemplares, préstamos, devoluciones, multas y consulta.'),
  (3, 'Alumno',        'Solo consulta: catálogo, sus préstamos y sus multas.'),
  (4, 'Profesor',      'Solo consulta, con reglas de préstamo propias.');

-- ---------- Permisos ----------
INSERT INTO permiso (id_permiso, nombre_permiso, descripcion_permiso) VALUES
  (1,  'usuarios.gestionar',     'Alta, baja, cambio, reactivación y consulta de usuarios'),
  (2,  'perfiles.gestionar',     'Administrar roles y permisos'),
  (3,  'libros.gestionar',       'Alta, edición y baja de libros'),
  (4,  'ejemplares.gestionar',   'Registrar, editar y dar de baja ejemplares'),
  (5,  'solicitudes.gestionar',  'Crear y consultar solicitudes de compra'),
  (6,  'catalogo.consultar',     'Buscar libros y ver disponibilidad'),
  (7,  'prestamos.gestionar',    'Prestar, devolver y renovar (Sprint 3)'),
  (8,  'renovaciones.autorizar', 'Autorizar renovaciones (Sprint 3)'),
  (9,  'multas.gestionar',       'Generar multas y registrar pagos (Sprint 3)'),
  (10, 'reportes.generar',       'Reporte de deudores para Servicios Escolares (Sprint 3)'),
  (11, 'cuenta.consultar',       'Ver sus propios préstamos y multas');

INSERT INTO rol_permiso (id_rol, id_permiso) VALUES
  -- Administrador: todo
  (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),
  -- Bibliotecario
  (2,3),(2,4),(2,6),(2,7),(2,9),(2,10),(2,11),
  -- Alumno y Profesor: solo consulta
  (3,6),(3,11),
  (4,6),(4,11);

-- ---------- Reglas de préstamo por rol ----------
-- Profesor.max_libros queda NULL: PENDIENTE de confirmar con el Product Owner.
INSERT INTO regla_prestamo (id_rol, dias_prestamo, max_renovaciones, max_libros) VALUES
  (3, 5, 2, 2),
  (4, 10, 3, NULL);

-- ---------- Usuarios (contraseña: 1234) ----------
SET @hash_1234 = '$2b$10$uT1IdL0JJoU/h1y3tfdFK.F6wB3C/XlzL9.EvnEpJ.ImkZYUfoao6';
INSERT INTO usuario (matricula, contrasena, id_rol, activo) VALUES
  ('admin',         @hash_1234, 1, TRUE),
  ('bibliotecario', @hash_1234, 2, TRUE),
  ('alumno',        @hash_1234, 3, TRUE),
  ('prof',          @hash_1234, 4, TRUE),
  ('N00000001', @hash_1234, 1, TRUE),
  ('N00031207', @hash_1234, 2, TRUE),
  ('N00045123', @hash_1234, 2, TRUE),
  ('N00012345', @hash_1234, 4, TRUE),
  ('N00023871', @hash_1234, 4, TRUE),
  ('A01234567', @hash_1234, 3, TRUE),
  ('A01234890', @hash_1234, 3, TRUE),
  ('A01235011', @hash_1234, 3, TRUE),
  ('A01236102', @hash_1234, 3, TRUE),
  ('A01236455', @hash_1234, 3, TRUE),
  ('A01237777', @hash_1234, 3, FALSE);

-- ---------- Ubicaciones ----------
INSERT INTO ubicacion (id_ubicacion, estante, seccion) VALUES
  (1,1,1),(2,1,2),(3,1,3),(4,2,1),(5,2,2),(6,3,1),(7,3,2);

-- ---------- Temas ----------
INSERT INTO tema (id_tema, nombre) VALUES
  (1,'Distopía'),(2,'Computación'),(3,'Matemáticas'),(4,'Ficción'),
  (5,'Ingeniería'),(6,'Bases de datos'),(7,'Política'),(8,'Clásicos');

-- ---------- Autores ----------
INSERT INTO autor (id_autor, nombre) VALUES
  (1,'George Orwell'),(2,'Niklaus Wirth'),(3,'James Stewart'),(4,'Gabriel García Márquez'),
  (5,'Robert C. Martin'),(6,'Fiódor Dostoyevski'),(7,'Erich Gamma'),(8,'Richard Helm'),
  (9,'Miguel de Cervantes'),(10,'Antoine de Saint-Exupéry'),(11,'Abraham Silberschatz'),
  (12,'Harper Lee'),(13,'Karl Marx'),(14,'Friedrich Engels');

-- ---------- Libros ----------
INSERT INTO libro (isbn, titulo, editorial, anio, idioma, precio_ultima_compra_usd) VALUES
  ('978-0-452-28423-4','1984','Signet Classics',1949,'Inglés',12.50),
  ('978-0-13-022418-7','Algoritmos y estructuras de datos','Prentice Hall',1986,'Español',45.00),
  ('978-607-481-845-0','Cálculo de una variable','Cengage Learning',2012,'Español',85.00),
  ('978-0-06-088328-7','Cien años de soledad','Harper Perennial',1967,'Español',18.00),
  ('978-0-13-235088-4','Clean Code','Prentice Hall',2008,'Inglés',40.00),
  ('978-0-14-044913-6','Crimen y castigo','Penguin Classics',1866,'Español',15.00),
  ('978-0-201-63361-0','Design Patterns','Addison-Wesley',1994,'Inglés',55.00),
  ('978-84-204-8325-6','Don Quijote de la Mancha','Alfaguara',1605,'Español',30.00),
  ('978-0-15-601219-5','El principito','Harcourt',1943,'Español',10.00),
  ('978-0-07-802215-9','Fundamentos de bases de datos','McGraw-Hill',2010,'Español',90.00),
  ('978-0-06-112008-4','To Kill a Mockingbird','Harper Perennial',1960,'Inglés',14.00),
  ('978-0-14-044757-6','Manifiesto del Partido Comunista','Penguin Classics',1848,'Español',8.00);

INSERT INTO libro_autor (isbn, id_autor) VALUES
  ('978-0-452-28423-4',1),('978-0-13-022418-7',2),('978-607-481-845-0',3),('978-0-06-088328-7',4),
  ('978-0-13-235088-4',5),('978-0-14-044913-6',6),('978-0-201-63361-0',7),('978-0-201-63361-0',8),
  ('978-84-204-8325-6',9),('978-0-15-601219-5',10),('978-0-07-802215-9',11),('978-0-06-112008-4',12),
  ('978-0-14-044757-6',13),('978-0-14-044757-6',14);

INSERT INTO libro_tema (isbn, id_tema) VALUES
  ('978-0-452-28423-4',1),('978-0-452-28423-4',8),('978-0-13-022418-7',2),('978-0-13-022418-7',5),
  ('978-607-481-845-0',3),('978-0-06-088328-7',4),('978-0-13-235088-4',2),('978-0-13-235088-4',5),
  ('978-0-14-044913-6',4),('978-0-201-63361-0',5),('978-0-201-63361-0',2),('978-84-204-8325-6',4),
  ('978-84-204-8325-6',8),('978-0-15-601219-5',4),('978-0-07-802215-9',2),('978-0-07-802215-9',6),
  ('978-0-06-112008-4',4),('978-0-14-044757-6',7);

-- ---------- Ejemplares (el trigger actualiza libro.num_ejemplares) ----------
INSERT INTO ejemplar (isbn, id_ubicacion, modalidad, estado) VALUES
  ('978-0-06-112008-4',3,'Consulta externa','Disponible'),
  ('978-0-06-112008-4',3,'Consulta externa','Prestado'),
  ('978-0-06-112008-4',4,'Consulta interna','Reservado'),
  ('978-0-06-112008-4',3,'Consulta externa','Dañado'),
  ('978-0-06-112008-4',3,'Consulta externa','Perdido'),
  ('978-0-06-112008-4',3,'Consulta externa','Disponible'),
  ('978-0-06-112008-4',4,'Consulta interna','Disponible'),
  ('978-0-452-28423-4',1,'Consulta externa','Disponible'),
  ('978-0-452-28423-4',1,'Consulta externa','Disponible'),
  ('978-0-452-28423-4',1,'Consulta interna','Disponible'),
  ('978-0-13-022418-7',2,'Consulta externa','Disponible'),
  ('978-0-13-022418-7',2,'Consulta externa','Disponible'),
  ('978-0-13-022418-7',2,'Consulta interna','Disponible'),
  ('978-607-481-845-0',5,'Consulta externa','Disponible'),
  ('978-607-481-845-0',5,'Consulta externa','Prestado'),
  ('978-607-481-845-0',5,'Consulta interna','Disponible'),
  ('978-607-481-845-0',5,'Consulta interna','Disponible'),
  ('978-0-06-088328-7',6,'Consulta externa','Disponible'),
  ('978-0-06-088328-7',6,'Consulta externa','Disponible'),
  ('978-0-06-088328-7',6,'Consulta interna','Disponible'),
  ('978-0-13-235088-4',2,'Consulta externa','Disponible'),
  ('978-0-13-235088-4',2,'Consulta externa','Disponible'),
  ('978-0-13-235088-4',2,'Consulta externa','Disponible'),
  ('978-0-13-235088-4',2,'Consulta interna','Disponible'),
  ('978-0-14-044913-6',6,'Consulta externa','Disponible'),
  ('978-0-14-044913-6',6,'Consulta interna','Disponible'),
  ('978-0-201-63361-0',7,'Consulta externa','Disponible'),
  ('978-0-201-63361-0',7,'Consulta interna','Disponible'),
  ('978-84-204-8325-6',6,'Consulta externa','Disponible'),
  ('978-84-204-8325-6',6,'Consulta externa','Disponible'),
  ('978-84-204-8325-6',6,'Consulta interna','Disponible'),
  ('978-0-15-601219-5',6,'Consulta externa','Disponible'),
  ('978-0-15-601219-5',6,'Consulta externa','Disponible'),
  ('978-0-15-601219-5',6,'Consulta externa','Disponible'),
  ('978-0-15-601219-5',6,'Consulta externa','Disponible'),
  ('978-0-15-601219-5',6,'Consulta interna','Disponible'),
  ('978-0-15-601219-5',6,'Consulta interna','Disponible'),
  ('978-0-07-802215-9',2,'Consulta externa','Disponible'),
  ('978-0-07-802215-9',2,'Consulta externa','Disponible'),
  ('978-0-07-802215-9',2,'Consulta externa','Disponible'),
  ('978-0-07-802215-9',2,'Consulta interna','Disponible'),
  ('978-0-14-044757-6',7,'Consulta externa','Disponible'),
  ('978-0-14-044757-6',7,'Consulta externa','Obsoleto'),
  ('978-0-14-044757-6',7,'Consulta externa','Dañado'),
  ('978-0-14-044757-6',7,'Consulta interna','Perdido'),
  ('978-0-14-044757-6',7,'Consulta interna','Robado');

-- ---------- Préstamos y multas de ejemplo ----------
-- A01234890 tiene un préstamo activo (no se puede dar de baja).
-- A01235011 tiene una multa sin pagar (no se puede dar de baja).
INSERT INTO prestamo (id_prestamo, matricula, matricula_bibliotecario_autoriza, matricula_bibliotecario_recibe,
                      id_ejemplar, fecha_inicio, fecha_devolucion_esperada, fecha_devolucion_real, numero_renovaciones) VALUES
  (1, 'A01234890', 'bibliotecario', NULL, 2, CURDATE(), fn_sumar_dias_habiles(CURDATE(), 5), NULL, 0),
  (2, 'A01235011', 'bibliotecario', 'bibliotecario', 15, '2026-09-01', '2026-09-08', '2026-09-11', 0),
  (3, 'N00012345', 'bibliotecario', NULL, 15, CURDATE(), fn_sumar_dias_habiles(CURDATE(), 10), NULL, 0);

INSERT INTO multa (id_multa, id_prestamo, pagada) VALUES (1, 2, FALSE);
INSERT INTO detalle_multa (id_multa, infraccion, importe) VALUES (1, 'Retraso', 30.00);

-- ---------- Solicitudes de compra de ejemplo ----------
INSERT INTO solicitud_compra (id_solicitud, matricula, fecha, estado) VALUES
  (1, 'admin', '2026-09-22', 'Aceptado'),
  (2, 'admin', '2026-10-05', 'Enviado a tesorería');
INSERT INTO detalle_solicitud (id_solicitud, isbn, num_ejemplares, costo_unitario) VALUES
  (1, '978-0-13-235088-4', 2, 850.00),
  (1, '978-0-201-63361-0', 1, 1100.00),
  (2, '978-0-452-28423-4', 3, 300.00),
  (2, '978-0-07-802215-9', 2, 1750.00);
