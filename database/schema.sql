-- =====================================================================
--  Sistema de Gestión de Préstamos · Biblioteca Universidad Ducky
--  schema.sql  ·  Modelo v4 + REGLA_PRESTAMO  ·  MySQL 8.0+
--  Equipo Duck Tech
--
--  Convenciones:
--    * Nombres de tablas y columnas en minúsculas (snake_case) para que el
--      script funcione igual en Windows, macOS y Linux
--      (MySQL distingue mayúsculas en nombres de tabla según el sistema).
--    * InnoDB + utf8mb4. ON DELETE RESTRICT por defecto.
--    * Contraseñas SIEMPRE como hash bcrypt, nunca en texto plano.
-- =====================================================================

DROP DATABASE IF EXISTS biblioteca_ducky;
CREATE DATABASE biblioteca_ducky
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE biblioteca_ducky;

-- =========================
-- ROLES Y PERMISOS
-- =========================

CREATE TABLE rol (
  id_rol       INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(100) NOT NULL,
  descripcion  TEXT         NULL COMMENT 'Qué puede hacer este rol, ej. Alumno: solo consulta',
  CONSTRAINT pk_rol PRIMARY KEY (id_rol),
  CONSTRAINT uq_rol_nombre UNIQUE (nombre)
) ENGINE = InnoDB;

CREATE TABLE permiso (
  id_permiso           INT          NOT NULL AUTO_INCREMENT,
  nombre_permiso       VARCHAR(100) NOT NULL,
  descripcion_permiso  TEXT         NULL,
  CONSTRAINT pk_permiso PRIMARY KEY (id_permiso),
  CONSTRAINT uq_permiso_nombre UNIQUE (nombre_permiso)
) ENGINE = InnoDB;

CREATE TABLE rol_permiso (
  id_rol      INT NOT NULL,
  id_permiso  INT NOT NULL,
  CONSTRAINT pk_rol_permiso PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rol_permiso_rol FOREIGN KEY (id_rol)
    REFERENCES rol (id_rol) ON DELETE CASCADE,
  CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (id_permiso)
    REFERENCES permiso (id_permiso) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE regla_prestamo (
  id_regla          INT NOT NULL AUTO_INCREMENT,
  id_rol            INT NOT NULL COMMENT 'Una regla por rol',
  dias_prestamo     INT NOT NULL COMMENT 'Días hábiles (sin sábado ni domingo)',
  max_renovaciones  INT NOT NULL,
  max_libros        INT NULL COMMENT 'Máximo de libros prestados a la vez (Profesor: PENDIENTE)',
  CONSTRAINT pk_regla_prestamo PRIMARY KEY (id_regla),
  CONSTRAINT uq_regla_prestamo_rol UNIQUE (id_rol),
  CONSTRAINT fk_regla_prestamo_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol),
  CONSTRAINT ck_regla_dias CHECK (dias_prestamo > 0),
  CONSTRAINT ck_regla_renov CHECK (max_renovaciones >= 0),
  CONSTRAINT ck_regla_libros CHECK (max_libros IS NULL OR max_libros > 0)
) ENGINE = InnoDB;

-- =========================
-- USUARIOS
-- =========================

CREATE TABLE usuario (
  matricula   VARCHAR(30)  NOT NULL COMMENT 'Es el usuario de acceso',
  contrasena  VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  id_rol      INT          NOT NULL,
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT pk_usuario PRIMARY KEY (matricula),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
) ENGINE = InnoDB;

-- =========================
-- LIBROS, AUTORES Y TEMAS
-- =========================

CREATE TABLE libro (
  isbn                      VARCHAR(20)   NOT NULL,
  titulo                    VARCHAR(255)  NOT NULL,
  editorial                 VARCHAR(150)  NULL,
  anio                      INT           NULL,
  idioma                    VARCHAR(60)   NULL,
  precio_ultima_compra_usd  DECIMAL(10,2) NULL COMMENT 'Costo de reposición = precio USD x tipo de cambio',
  num_ejemplares            INT           NOT NULL DEFAULT 0 COMMENT 'Calculado (trigger)',
  CONSTRAINT pk_libro PRIMARY KEY (isbn),
  CONSTRAINT ck_libro_precio CHECK (precio_ultima_compra_usd IS NULL OR precio_ultima_compra_usd >= 0)
) ENGINE = InnoDB;

CREATE TABLE autor (
  id_autor  INT          NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(200) NOT NULL,
  CONSTRAINT pk_autor PRIMARY KEY (id_autor)
) ENGINE = InnoDB;

CREATE TABLE libro_autor (
  isbn      VARCHAR(20) NOT NULL,
  id_autor  INT         NOT NULL,
  CONSTRAINT pk_libro_autor PRIMARY KEY (isbn, id_autor),
  CONSTRAINT fk_libro_autor_libro FOREIGN KEY (isbn)
    REFERENCES libro (isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_libro_autor_autor FOREIGN KEY (id_autor) REFERENCES autor (id_autor)
) ENGINE = InnoDB;

CREATE TABLE tema (
  id_tema  INT          NOT NULL AUTO_INCREMENT,
  nombre   VARCHAR(150) NOT NULL,
  CONSTRAINT pk_tema PRIMARY KEY (id_tema),
  CONSTRAINT uq_tema_nombre UNIQUE (nombre)
) ENGINE = InnoDB;

CREATE TABLE libro_tema (
  isbn     VARCHAR(20) NOT NULL,
  id_tema  INT         NOT NULL,
  CONSTRAINT pk_libro_tema PRIMARY KEY (isbn, id_tema),
  CONSTRAINT fk_libro_tema_libro FOREIGN KEY (isbn)
    REFERENCES libro (isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_libro_tema_tema FOREIGN KEY (id_tema) REFERENCES tema (id_tema)
) ENGINE = InnoDB;

-- =========================
-- UBICACIONES Y EJEMPLARES
-- =========================

CREATE TABLE ubicacion (
  id_ubicacion  INT NOT NULL AUTO_INCREMENT,
  estante       INT NOT NULL,
  seccion       INT NOT NULL,
  CONSTRAINT pk_ubicacion PRIMARY KEY (id_ubicacion),
  CONSTRAINT uq_ubicacion UNIQUE (estante, seccion)
) ENGINE = InnoDB;

CREATE TABLE ejemplar (
  id_ejemplar   INT         NOT NULL AUTO_INCREMENT,
  isbn          VARCHAR(20) NOT NULL,
  id_ubicacion  INT         NOT NULL,
  modalidad     ENUM('Consulta interna', 'Consulta externa') NOT NULL,
  estado        ENUM('Disponible', 'Prestado', 'Reservado', 'Perdido', 'Robado', 'Dañado', 'Obsoleto')
                NOT NULL DEFAULT 'Disponible',
  CONSTRAINT pk_ejemplar PRIMARY KEY (id_ejemplar),
  CONSTRAINT fk_ejemplar_libro FOREIGN KEY (isbn)
    REFERENCES libro (isbn) ON UPDATE CASCADE,
  CONSTRAINT fk_ejemplar_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES ubicacion (id_ubicacion),
  INDEX ix_ejemplar_isbn_estado (isbn, estado)
) ENGINE = InnoDB;

-- =========================
-- PRÉSTAMOS
-- =========================

CREATE TABLE prestamo (
  id_prestamo                       INT         NOT NULL AUTO_INCREMENT,
  matricula                         VARCHAR(30) NOT NULL COMMENT 'Usuario que recibe el préstamo',
  matricula_bibliotecario_autoriza  VARCHAR(30) NOT NULL,
  matricula_bibliotecario_recibe    VARCHAR(30) NULL COMMENT 'Nulo mientras no se devuelva',
  id_ejemplar                       INT         NOT NULL,
  fecha_inicio                      DATE        NOT NULL,
  fecha_devolucion_esperada         DATE        NOT NULL,
  fecha_devolucion_real             DATE        NULL,
  numero_renovaciones               INT         NOT NULL DEFAULT 0,
  CONSTRAINT pk_prestamo PRIMARY KEY (id_prestamo),
  CONSTRAINT fk_prestamo_usuario FOREIGN KEY (matricula) REFERENCES usuario (matricula),
  CONSTRAINT fk_prestamo_autoriza FOREIGN KEY (matricula_bibliotecario_autoriza) REFERENCES usuario (matricula),
  CONSTRAINT fk_prestamo_recibe FOREIGN KEY (matricula_bibliotecario_recibe) REFERENCES usuario (matricula),
  CONSTRAINT fk_prestamo_ejemplar FOREIGN KEY (id_ejemplar) REFERENCES ejemplar (id_ejemplar),
  CONSTRAINT ck_prestamo_fechas CHECK (fecha_devolucion_esperada >= fecha_inicio),
  CONSTRAINT ck_prestamo_renov CHECK (numero_renovaciones >= 0),
  INDEX ix_prestamo_usuario (matricula, fecha_devolucion_real),
  INDEX ix_prestamo_ejemplar (id_ejemplar, fecha_devolucion_real)
) ENGINE = InnoDB;

-- =========================
-- RESERVAS Y LISTA DE ESPERA
-- =========================

CREATE TABLE reserva_espera (
  id_reserva            INT         NOT NULL AUTO_INCREMENT,
  matricula             VARCHAR(30) NOT NULL,
  isbn                  VARCHAR(20) NOT NULL,
  fecha_solicitud       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Orden de atención',
  estado                ENUM('En espera', 'Pendiente de recoger', 'Recogida', 'No aceptada')
                        NOT NULL DEFAULT 'En espera',
  fecha_limite_recoger  DATE        NULL COMMENT '3 días desde que queda disponible',
  CONSTRAINT pk_reserva_espera PRIMARY KEY (id_reserva),
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (matricula) REFERENCES usuario (matricula),
  CONSTRAINT fk_reserva_libro FOREIGN KEY (isbn) REFERENCES libro (isbn) ON UPDATE CASCADE,
  INDEX ix_reserva_cola (isbn, estado, fecha_solicitud)
) ENGINE = InnoDB;

-- =========================
-- MULTAS
-- =========================

CREATE TABLE multa (
  id_multa     INT           NOT NULL AUTO_INCREMENT,
  id_prestamo  INT           NOT NULL COMMENT 'Máximo una multa por préstamo',
  costo_multa  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Suma de detalle_multa (trigger)',
  pagada       BOOLEAN       NOT NULL DEFAULT FALSE COMMENT 'Tesorería valida el pago',
  fecha_pago   DATE          NULL,
  CONSTRAINT pk_multa PRIMARY KEY (id_multa),
  CONSTRAINT uq_multa_prestamo UNIQUE (id_prestamo),
  CONSTRAINT fk_multa_prestamo FOREIGN KEY (id_prestamo) REFERENCES prestamo (id_prestamo),
  INDEX ix_multa_pagada (pagada)
) ENGINE = InnoDB;

CREATE TABLE detalle_multa (
  id_detalle_multa  INT           NOT NULL AUTO_INCREMENT,
  id_multa          INT           NOT NULL,
  infraccion        ENUM('Retraso', 'Pérdida', 'Daño') NOT NULL,
  importe           DECIMAL(10,2) NOT NULL,
  CONSTRAINT pk_detalle_multa PRIMARY KEY (id_detalle_multa),
  CONSTRAINT fk_detalle_multa_multa FOREIGN KEY (id_multa) REFERENCES multa (id_multa) ON DELETE CASCADE,
  CONSTRAINT ck_detalle_multa_importe CHECK (importe >= 0)
) ENGINE = InnoDB;

-- =========================
-- SOLICITUDES DE COMPRA
-- =========================

CREATE TABLE solicitud_compra (
  id_solicitud            INT           NOT NULL AUTO_INCREMENT,
  matricula               VARCHAR(30)   NOT NULL COMMENT 'Administrador que crea la solicitud',
  fecha                   DATE          NOT NULL,
  estado                  ENUM('Enviado a tesorería', 'Aceptado', 'Rechazado')
                          NOT NULL DEFAULT 'Enviado a tesorería',
  num_libros_diferentes   INT           NOT NULL DEFAULT 0 COMMENT 'Calculado (trigger)',
  num_ejemplares_totales  INT           NOT NULL DEFAULT 0 COMMENT 'Calculado (trigger)',
  total                   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Calculado (trigger)',
  CONSTRAINT pk_solicitud_compra PRIMARY KEY (id_solicitud),
  CONSTRAINT fk_solicitud_usuario FOREIGN KEY (matricula) REFERENCES usuario (matricula)
) ENGINE = InnoDB;

CREATE TABLE detalle_solicitud (
  id_detalle_solicitud  INT           NOT NULL AUTO_INCREMENT,
  id_solicitud          INT           NOT NULL,
  isbn                  VARCHAR(20)   NOT NULL,
  num_ejemplares        INT           NOT NULL,
  costo_unitario        DECIMAL(10,2) NOT NULL,
  subtotal              DECIMAL(12,2) GENERATED ALWAYS AS (num_ejemplares * costo_unitario) STORED,
  CONSTRAINT pk_detalle_solicitud PRIMARY KEY (id_detalle_solicitud),
  CONSTRAINT fk_detalle_solicitud_solicitud FOREIGN KEY (id_solicitud)
    REFERENCES solicitud_compra (id_solicitud) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_solicitud_libro FOREIGN KEY (isbn) REFERENCES libro (isbn) ON UPDATE CASCADE,
  CONSTRAINT ck_detalle_solicitud_num CHECK (num_ejemplares > 0),
  CONSTRAINT ck_detalle_solicitud_costo CHECK (costo_unitario >= 0)
) ENGINE = InnoDB;

-- =====================================================================
--  TRIGGERS: campos derivados
-- =====================================================================
DELIMITER $$

-- libro.num_ejemplares = ejemplares registrados del título
CREATE TRIGGER trg_ejemplar_ai AFTER INSERT ON ejemplar FOR EACH ROW
BEGIN
  UPDATE libro SET num_ejemplares = num_ejemplares + 1 WHERE isbn = NEW.isbn;
END$$

CREATE TRIGGER trg_ejemplar_ad AFTER DELETE ON ejemplar FOR EACH ROW
BEGIN
  UPDATE libro SET num_ejemplares = num_ejemplares - 1 WHERE isbn = OLD.isbn;
END$$

-- multa.costo_multa = suma de importes de sus infracciones
CREATE TRIGGER trg_detalle_multa_ai AFTER INSERT ON detalle_multa FOR EACH ROW
BEGIN
  UPDATE multa
     SET costo_multa = (SELECT COALESCE(SUM(importe), 0) FROM detalle_multa WHERE id_multa = NEW.id_multa)
   WHERE id_multa = NEW.id_multa;
END$$

CREATE TRIGGER trg_detalle_multa_ad AFTER DELETE ON detalle_multa FOR EACH ROW
BEGIN
  UPDATE multa
     SET costo_multa = (SELECT COALESCE(SUM(importe), 0) FROM detalle_multa WHERE id_multa = OLD.id_multa)
   WHERE id_multa = OLD.id_multa;
END$$

-- Totales de solicitud_compra
CREATE PROCEDURE sp_recalcular_solicitud(IN p_id_solicitud INT)
BEGIN
  UPDATE solicitud_compra s
     SET s.num_libros_diferentes  = (SELECT COUNT(DISTINCT d.isbn) FROM detalle_solicitud d WHERE d.id_solicitud = p_id_solicitud),
         s.num_ejemplares_totales = (SELECT COALESCE(SUM(d.num_ejemplares), 0) FROM detalle_solicitud d WHERE d.id_solicitud = p_id_solicitud),
         s.total                  = (SELECT COALESCE(SUM(d.subtotal), 0) FROM detalle_solicitud d WHERE d.id_solicitud = p_id_solicitud)
   WHERE s.id_solicitud = p_id_solicitud;
END$$

CREATE TRIGGER trg_detalle_solicitud_ai AFTER INSERT ON detalle_solicitud FOR EACH ROW
BEGIN
  CALL sp_recalcular_solicitud(NEW.id_solicitud);
END$$

CREATE TRIGGER trg_detalle_solicitud_au AFTER UPDATE ON detalle_solicitud FOR EACH ROW
BEGIN
  CALL sp_recalcular_solicitud(NEW.id_solicitud);
END$$

CREATE TRIGGER trg_detalle_solicitud_ad AFTER DELETE ON detalle_solicitud FOR EACH ROW
BEGIN
  CALL sp_recalcular_solicitud(OLD.id_solicitud);
END$$

-- =====================================================================
--  FUNCIÓN: sumar días hábiles (sin sábado ni domingo). Se usará en el
--  Sprint 3 para calcular fecha_devolucion_esperada.
-- =====================================================================
CREATE FUNCTION fn_sumar_dias_habiles(p_fecha DATE, p_dias INT)
RETURNS DATE
DETERMINISTIC
BEGIN
  DECLARE v_fecha DATE DEFAULT p_fecha;
  DECLARE v_restantes INT DEFAULT p_dias;
  WHILE v_restantes > 0 DO
    SET v_fecha = DATE_ADD(v_fecha, INTERVAL 1 DAY);
    -- DAYOFWEEK: 1 = domingo, 7 = sábado
    IF DAYOFWEEK(v_fecha) NOT IN (1, 7) THEN
      SET v_restantes = v_restantes - 1;
    END IF;
  END WHILE;
  RETURN v_fecha;
END$$

DELIMITER ;

-- =====================================================================
--  VISTA: usuarios con adeudos (reporte para Servicios Escolares).
--  "Suspendido de exámenes" NO se guarda: se consulta.
-- =====================================================================
CREATE VIEW vw_usuarios_con_adeudo AS
SELECT u.matricula,
       r.nombre AS rol,
       (SELECT COUNT(*) FROM multa m JOIN prestamo p ON p.id_prestamo = m.id_prestamo
         WHERE p.matricula = u.matricula AND m.pagada = FALSE) AS multas_sin_pagar,
       (SELECT COUNT(*) FROM prestamo p
         WHERE p.matricula = u.matricula AND p.fecha_devolucion_real IS NULL
           AND p.fecha_devolucion_esperada < CURDATE()) AS prestamos_vencidos
  FROM usuario u
  JOIN rol r ON r.id_rol = u.id_rol
HAVING multas_sin_pagar > 0 OR prestamos_vencidos > 0;
