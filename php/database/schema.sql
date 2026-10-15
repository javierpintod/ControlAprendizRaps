-- =====================================================================
-- ControlRap Aprendiz - Modelo de Base de Datos (MySQL / MariaDB XAMPP)
-- Soporta múltiples cursos (fichas/programas) y múltiples aprendices.
--
-- Modelo:
--   cursos 1─N competencias 1─N raps          (catálogo curricular del curso)
--   aprendices N─M cursos  vía matriculas      (inscripción)
--   matriculas 1─N evaluaciones N─1 raps       (juicio de cada aprendiz por RAP)
--   evaluaciones 1─N historial_evaluaciones    (auditoría de cambios de juicio)
--   cargas                                     (bitácora de archivos importados)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS controlrap_aprendiz
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controlrap_aprendiz;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS historial_evaluaciones;
DROP TABLE IF EXISTS evaluaciones;
DROP TABLE IF EXISTS cargas;
DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS raps;
DROP TABLE IF EXISTS competencias;
DROP TABLE IF EXISTS aprendices;
DROP TABLE IF EXISTS cursos;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Cursos (ficha / grupo de un programa de formación)
-- ---------------------------------------------------------------------
CREATE TABLE cursos (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_ficha   VARCHAR(30)  NOT NULL,
  nombre         VARCHAR(200) NOT NULL,
  programa       VARCHAR(200) NULL,
  modalidad      VARCHAR(50)  NULL DEFAULT 'Presencial',
  fecha_inicio   DATE NULL,
  fecha_fin      DATE NULL,
  activo         TINYINT(1) NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cursos_ficha (codigo_ficha)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Aprendices
-- ---------------------------------------------------------------------
CREATE TABLE aprendices (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_documento   VARCHAR(10)  NOT NULL DEFAULT 'CC',
  documento        VARCHAR(30)  NOT NULL,
  nombres          VARCHAR(120) NOT NULL,
  apellidos        VARCHAR(120) NOT NULL DEFAULT '',
  email            VARCHAR(160) NULL,
  telefono         VARCHAR(30)  NULL,
  creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_aprendices_documento (documento)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Matrículas: relación N:M aprendiz <-> curso
-- ---------------------------------------------------------------------
CREATE TABLE matriculas (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  aprendiz_id      INT UNSIGNED NOT NULL,
  curso_id         INT UNSIGNED NOT NULL,
  estado           ENUM('Activo','Retirado','Certificado','Aplazado') NOT NULL DEFAULT 'Activo',
  fecha_matricula  DATE NULL,
  creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_matricula (aprendiz_id, curso_id),
  CONSTRAINT fk_mat_aprendiz FOREIGN KEY (aprendiz_id) REFERENCES aprendices(id) ON DELETE CASCADE,
  CONSTRAINT fk_mat_curso    FOREIGN KEY (curso_id)    REFERENCES cursos(id)     ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Competencias / módulos de cada curso
-- ---------------------------------------------------------------------
CREATE TABLE competencias (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id   INT UNSIGNED NOT NULL,
  codigo     VARCHAR(40)  NULL,
  nombre     VARCHAR(200) NOT NULL,
  UNIQUE KEY uq_comp_curso_nombre (curso_id, nombre),
  CONSTRAINT fk_comp_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Resultados de aprendizaje (catálogo por curso)
-- ---------------------------------------------------------------------
CREATE TABLE raps (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id        INT UNSIGNED NOT NULL,
  competencia_id  INT UNSIGNED NOT NULL,
  codigo_rap      VARCHAR(40)  NOT NULL,
  codigo_oficial  VARCHAR(40)  NULL,
  descripcion     TEXT         NOT NULL,
  horas           SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  fase            VARCHAR(60)  NULL,
  UNIQUE KEY uq_rap_curso_codigo (curso_id, codigo_rap),
  KEY idx_rap_comp (competencia_id),
  CONSTRAINT fk_rap_curso FOREIGN KEY (curso_id)       REFERENCES cursos(id)       ON DELETE CASCADE,
  CONSTRAINT fk_rap_comp  FOREIGN KEY (competencia_id) REFERENCES competencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Evaluaciones: juicio vigente de un aprendiz (matrícula) sobre un RAP
-- ---------------------------------------------------------------------
CREATE TABLE evaluaciones (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricula_id      INT UNSIGNED NOT NULL,
  rap_id            INT UNSIGNED NOT NULL,
  estado            ENUM('Aprobado','Por Mejorar','Pendiente','No Evaluado') NOT NULL DEFAULT 'No Evaluado',
  fecha_evaluacion  DATE NULL,
  instructor        VARCHAR(160) NULL,
  observaciones     TEXT NULL,
  actualizado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_eval (matricula_id, rap_id),
  KEY idx_eval_estado (estado),
  CONSTRAINT fk_eval_mat FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_eval_rap FOREIGN KEY (rap_id)       REFERENCES raps(id)       ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Historial de cambios de juicio (auditoría)
-- ---------------------------------------------------------------------
CREATE TABLE historial_evaluaciones (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  evaluacion_id    INT UNSIGNED NOT NULL,
  estado_anterior  VARCHAR(20) NULL,
  estado_nuevo     VARCHAR(20) NOT NULL,
  origen           ENUM('carga','manual','sistema') NOT NULL DEFAULT 'manual',
  nota             VARCHAR(500) NULL,
  creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_hist_eval (evaluacion_id),
  CONSTRAINT fk_hist_eval FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Bitácora de cargas de archivos Excel / CSV
-- ---------------------------------------------------------------------
CREATE TABLE cargas (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  curso_id           INT UNSIGNED NOT NULL,
  aprendiz_id        INT UNSIGNED NULL,           -- NULL = archivo multi-aprendiz
  nombre_archivo     VARCHAR(255) NOT NULL,
  total_filas        INT UNSIGNED NOT NULL DEFAULT 0,
  aprendices_afectados INT UNSIGNED NOT NULL DEFAULT 0,
  celdas_normalizadas  INT UNSIGNED NOT NULL DEFAULT 0,
  creado_en          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carga_curso    FOREIGN KEY (curso_id)    REFERENCES cursos(id)     ON DELETE CASCADE,
  CONSTRAINT fk_carga_aprendiz FOREIGN KEY (aprendiz_id) REFERENCES aprendices(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Vista de avance por matrícula (avance ponderado y nominal)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_avance_matricula AS
SELECT
  m.id                                   AS matricula_id,
  m.curso_id,
  m.aprendiz_id,
  COUNT(r.id)                            AS total_raps,
  COALESCE(SUM(r.horas),0)               AS total_horas,
  SUM(e.estado = 'Aprobado')             AS raps_aprobados,
  SUM(e.estado = 'Por Mejorar')          AS raps_por_mejorar,
  SUM(e.estado = 'Pendiente')            AS raps_pendientes,
  SUM(e.estado IS NULL OR e.estado = 'No Evaluado') AS raps_no_evaluados,
  COALESCE(SUM(CASE WHEN e.estado = 'Aprobado' THEN r.horas END),0) AS horas_aprobadas,
  ROUND(100 * COALESCE(SUM(CASE WHEN e.estado = 'Aprobado' THEN r.horas END),0)
        / NULLIF(SUM(r.horas),0), 1)     AS avance_ponderado
FROM matriculas m
JOIN raps r            ON r.curso_id = m.curso_id
LEFT JOIN evaluaciones e ON e.matricula_id = m.id AND e.rap_id = r.id
GROUP BY m.id, m.curso_id, m.aprendiz_id;
