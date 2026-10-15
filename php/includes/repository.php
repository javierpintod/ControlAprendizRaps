<?php
/**
 * ControlRap Aprendiz - Repositorio de datos (MySQL)
 * Todas las consultas SQL de la aplicación viven aquí.
 */
require_once __DIR__ . '/db.php';

/* =====================================================================
 * CURSOS
 * ===================================================================== */

function list_cursos(): array {
    $sql = "SELECT c.*,
                   (SELECT COUNT(*) FROM matriculas m WHERE m.curso_id = c.id) AS total_aprendices,
                   (SELECT COUNT(*) FROM raps r WHERE r.curso_id = c.id)       AS total_raps,
                   (SELECT COALESCE(SUM(r.horas),0) FROM raps r WHERE r.curso_id = c.id) AS total_horas,
                   (SELECT ROUND(AVG(v.avance_ponderado),1) FROM v_avance_matricula v WHERE v.curso_id = c.id) AS avance_promedio
            FROM cursos c
            ORDER BY c.activo DESC, c.nombre";
    return db()->query($sql)->fetchAll();
}

function get_curso(int $id): ?array {
    $st = db()->prepare('SELECT * FROM cursos WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

function create_curso(array $d): int {
    $st = db()->prepare(
        'INSERT INTO cursos (codigo_ficha, nombre, programa, modalidad, fecha_inicio, fecha_fin)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $st->execute([
        trim($d['codigo_ficha']),
        trim($d['nombre']),
        trim($d['programa'] ?? '') ?: null,
        trim($d['modalidad'] ?? 'Presencial') ?: 'Presencial',
        parse_date_value($d['fecha_inicio'] ?? null),
        parse_date_value($d['fecha_fin'] ?? null),
    ]);
    return (int)db()->lastInsertId();
}

function delete_curso(int $id): void {
    db()->prepare('DELETE FROM cursos WHERE id = ?')->execute([$id]);
}

/* =====================================================================
 * APRENDICES Y MATRÍCULAS
 * ===================================================================== */

/**
 * Lista aprendices. Si se indica curso, solo los matriculados en él,
 * incluyendo su avance calculado desde la vista v_avance_matricula.
 */
function list_aprendices(?int $cursoId = null): array {
    if ($cursoId) {
        $st = db()->prepare(
            "SELECT a.*, m.id AS matricula_id, m.estado AS estado_matricula,
                    COALESCE(v.avance_ponderado,0) AS avance_ponderado,
                    COALESCE(v.raps_aprobados,0)   AS raps_aprobados,
                    COALESCE(v.raps_por_mejorar,0) AS raps_por_mejorar,
                    COALESCE(v.raps_pendientes,0)  AS raps_pendientes,
                    COALESCE(v.total_raps,0)       AS total_raps,
                    COALESCE(v.horas_aprobadas,0)  AS horas_aprobadas,
                    COALESCE(v.total_horas,0)      AS total_horas
             FROM matriculas m
             JOIN aprendices a ON a.id = m.aprendiz_id
             LEFT JOIN v_avance_matricula v ON v.matricula_id = m.id
             WHERE m.curso_id = ?
             ORDER BY a.apellidos, a.nombres"
        );
        $st->execute([$cursoId]);
        return $st->fetchAll();
    }
    return db()->query(
        "SELECT a.*,
                (SELECT COUNT(*) FROM matriculas m WHERE m.aprendiz_id = a.id) AS total_cursos,
                (SELECT GROUP_CONCAT(c.codigo_ficha ORDER BY c.codigo_ficha SEPARATOR ', ')
                   FROM matriculas m JOIN cursos c ON c.id = m.curso_id
                  WHERE m.aprendiz_id = a.id) AS fichas
         FROM aprendices a ORDER BY a.apellidos, a.nombres"
    )->fetchAll();
}

function get_aprendiz(int $id): ?array {
    $st = db()->prepare('SELECT * FROM aprendices WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

/**
 * Crea o actualiza un aprendiz identificado por su documento. Devuelve su id.
 */
function upsert_aprendiz(array $d): int {
    $documento = trim((string)$d['documento']);
    $st = db()->prepare(
        'INSERT INTO aprendices (tipo_documento, documento, nombres, apellidos, email, telefono)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            nombres   = IF(VALUES(nombres) <> \'\', VALUES(nombres), nombres),
            apellidos = IF(VALUES(apellidos) <> \'\', VALUES(apellidos), apellidos),
            email     = COALESCE(VALUES(email), email),
            telefono  = COALESCE(VALUES(telefono), telefono),
            id = LAST_INSERT_ID(id)'
    );
    $st->execute([
        trim($d['tipo_documento'] ?? 'CC') ?: 'CC',
        $documento,
        trim($d['nombres'] ?? '') ?: 'Aprendiz ' . $documento,
        trim($d['apellidos'] ?? ''),
        trim($d['email'] ?? '') ?: null,
        trim($d['telefono'] ?? '') ?: null,
    ]);
    return (int)db()->lastInsertId();
}

function delete_aprendiz(int $id): void {
    db()->prepare('DELETE FROM aprendices WHERE id = ?')->execute([$id]);
}

/**
 * Matricula un aprendiz en un curso (idempotente). Devuelve el id de matrícula.
 */
function matricular(int $aprendizId, int $cursoId): int {
    $st = db()->prepare(
        'INSERT INTO matriculas (aprendiz_id, curso_id, fecha_matricula)
         VALUES (?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)'
    );
    $st->execute([$aprendizId, $cursoId]);
    return (int)db()->lastInsertId();
}

function desmatricular(int $aprendizId, int $cursoId): void {
    db()->prepare('DELETE FROM matriculas WHERE aprendiz_id = ? AND curso_id = ?')
        ->execute([$aprendizId, $cursoId]);
}

function get_matricula_id(int $aprendizId, int $cursoId): ?int {
    $st = db()->prepare('SELECT id FROM matriculas WHERE aprendiz_id = ? AND curso_id = ?');
    $st->execute([$aprendizId, $cursoId]);
    $id = $st->fetchColumn();
    return $id ? (int)$id : null;
}

/* =====================================================================
 * CATÁLOGO CURRICULAR (competencias y RAPs)
 * ===================================================================== */

function upsert_competencia(int $cursoId, string $nombre, ?string $codigo = null): int {
    $st = db()->prepare(
        'INSERT INTO competencias (curso_id, nombre, codigo) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE codigo = COALESCE(VALUES(codigo), codigo), id = LAST_INSERT_ID(id)'
    );
    $st->execute([$cursoId, $nombre, $codigo ?: null]);
    return (int)db()->lastInsertId();
}

function upsert_rap(int $cursoId, int $competenciaId, array $r): int {
    $st = db()->prepare(
        'INSERT INTO raps (curso_id, competencia_id, codigo_rap, codigo_oficial, descripcion, horas, fase)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            competencia_id = VALUES(competencia_id),
            codigo_oficial = COALESCE(VALUES(codigo_oficial), codigo_oficial),
            descripcion    = VALUES(descripcion),
            horas          = VALUES(horas),
            fase           = VALUES(fase),
            id = LAST_INSERT_ID(id)'
    );
    $st->execute([
        $cursoId, $competenciaId, $r['codigo_rap'], $r['codigo_oficial'] ?: null,
        $r['descripcion'], $r['horas'], $r['fase'] ?: null,
    ]);
    return (int)db()->lastInsertId();
}

/* =====================================================================
 * EVALUACIONES
 * ===================================================================== */

/**
 * Crea o actualiza el juicio de una matrícula sobre un RAP.
 * Registra en historial cuando el estado cambia.
 */
function upsert_evaluacion(int $matriculaId, int $rapId, string $estado, ?string $fecha,
                           ?string $instructor, ?string $observaciones, string $origen = 'carga'): void {
    $pdo = db();
    $st = $pdo->prepare('SELECT id, estado FROM evaluaciones WHERE matricula_id = ? AND rap_id = ?');
    $st->execute([$matriculaId, $rapId]);
    $prev = $st->fetch();

    if ($prev) {
        $pdo->prepare(
            'UPDATE evaluaciones SET estado = ?, fecha_evaluacion = ?,
                    instructor = COALESCE(?, instructor), observaciones = COALESCE(?, observaciones)
             WHERE id = ?'
        )->execute([$estado, $fecha, $instructor ?: null, $observaciones ?: null, $prev['id']]);
        $evalId = (int)$prev['id'];
        $anterior = $prev['estado'];
    } else {
        $pdo->prepare(
            'INSERT INTO evaluaciones (matricula_id, rap_id, estado, fecha_evaluacion, instructor, observaciones)
             VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$matriculaId, $rapId, $estado, $fecha, $instructor ?: null, $observaciones ?: null]);
        $evalId = (int)$pdo->lastInsertId();
        $anterior = null;
    }

    if ($anterior !== $estado) {
        $pdo->prepare(
            'INSERT INTO historial_evaluaciones (evaluacion_id, estado_anterior, estado_nuevo, origen)
             VALUES (?, ?, ?, ?)'
        )->execute([$evalId, $anterior, $estado, $origen]);
    }
}

/**
 * Devuelve todos los RAPs del curso con el juicio de la matrícula indicada,
 * en el formato de arreglo que consume el dashboard.
 */
function get_raps_for_matricula(int $matriculaId): array {
    $st = db()->prepare(
        "SELECT r.codigo_rap AS id, r.codigo_oficial AS code, c.nombre AS competency,
                r.descripcion AS description, r.horas AS hours, r.fase AS phase,
                COALESCE(e.estado, 'No Evaluado') AS status,
                e.fecha_evaluacion AS evaluationDate,
                e.instructor AS evaluator, e.observaciones AS evaluatorFeedback
         FROM matriculas m
         JOIN raps r          ON r.curso_id = m.curso_id
         JOIN competencias c  ON c.id = r.competencia_id
         LEFT JOIN evaluaciones e ON e.rap_id = r.id AND e.matricula_id = m.id
         WHERE m.id = ?
         ORDER BY r.id"
    );
    $st->execute([$matriculaId]);
    return $st->fetchAll();
}

/**
 * Actualiza el estado de un RAP (por código) para una matrícula. Uso: simulador del modal.
 */
function update_evaluacion_by_code(int $matriculaId, string $codigoRap, string $estado, ?string $obs = null): bool {
    $st = db()->prepare(
        'SELECT r.id FROM raps r JOIN matriculas m ON m.curso_id = r.curso_id
         WHERE m.id = ? AND r.codigo_rap = ?'
    );
    $st->execute([$matriculaId, $codigoRap]);
    $rapId = $st->fetchColumn();
    if (!$rapId) return false;
    upsert_evaluacion($matriculaId, (int)$rapId, $estado, date('Y-m-d'), null, $obs, 'manual');
    return true;
}

/* =====================================================================
 * IMPORTACIÓN DE ARCHIVOS
 * ===================================================================== */

/**
 * Importa filas normalizadas a un curso dentro de una transacción.
 *
 * Cada fila debe venir con las claves:
 *   codigo_rap, codigo_oficial, competencia, descripcion, horas, fase,
 *   estado, fecha, instructor, observaciones,
 *   documento_aprendiz (opcional), nombre_aprendiz (opcional)
 *
 * Si la fila trae documento_aprendiz, el juicio se asigna a ese aprendiz
 * (creándolo y matriculándolo si no existe). Si no, se usa $aprendizIdDefecto.
 */
function import_rows(int $cursoId, ?int $aprendizIdDefecto, array $rows, string $filename, int $normalizadas = 0): array {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $compCache = [];
        $matCache = [];
        $aprendicesAfectados = [];
        $sinAprendiz = 0;
        $evaluaciones = 0;

        if ($aprendizIdDefecto) {
            $matCache['__default'] = matricular($aprendizIdDefecto, $cursoId);
        }

        foreach ($rows as $row) {
            $compKey = mb_strtolower($row['competencia']);
            if (!isset($compCache[$compKey])) {
                $compCache[$compKey] = upsert_competencia($cursoId, $row['competencia'], $row['codigo_competencia'] ?? null);
            }
            $rapId = upsert_rap($cursoId, $compCache[$compKey], $row);

            // Resolver matrícula destino
            $matriculaId = null;
            if (!empty($row['documento_aprendiz'])) {
                $doc = $row['documento_aprendiz'];
                if (!isset($matCache[$doc])) {
                    [$nom, $ape] = split_full_name($row['nombre_aprendiz'] ?? '');
                    $aid = upsert_aprendiz(['documento' => $doc, 'nombres' => $nom, 'apellidos' => $ape]);
                    $matCache[$doc] = matricular($aid, $cursoId);
                }
                $matriculaId = $matCache[$doc];
                $aprendicesAfectados[$doc] = true;
            } elseif (isset($matCache['__default'])) {
                $matriculaId = $matCache['__default'];
                $aprendicesAfectados['__default'] = true;
            }

            if ($matriculaId) {
                upsert_evaluacion($matriculaId, $rapId, $row['estado'], $row['fecha'],
                                  $row['instructor'], $row['observaciones'], 'carga');
                $evaluaciones++;
            } else {
                $sinAprendiz++;
            }
        }

        $pdo->prepare(
            'INSERT INTO cargas (curso_id, aprendiz_id, nombre_archivo, total_filas, aprendices_afectados, celdas_normalizadas)
             VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$cursoId, $aprendizIdDefecto, $filename, count($rows), count($aprendicesAfectados), $normalizadas]);

        $pdo->commit();
        return [
            'raps'          => count($rows),
            'evaluaciones'  => $evaluaciones,
            'aprendices'    => count($aprendicesAfectados),
            'sin_aprendiz'  => $sinAprendiz,
        ];
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function list_cargas(int $limit = 10): array {
    $st = db()->prepare(
        "SELECT g.*, c.codigo_ficha, c.nombre AS curso_nombre,
                CONCAT(a.nombres, ' ', a.apellidos) AS aprendiz_nombre
         FROM cargas g
         JOIN cursos c ON c.id = g.curso_id
         LEFT JOIN aprendices a ON a.id = g.aprendiz_id
         ORDER BY g.id DESC LIMIT ?"
    );
    $st->bindValue(1, $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

/* =====================================================================
 * UTILIDADES
 * ===================================================================== */

/**
 * Convierte un valor de fecha (Y-m-d, d/m/Y, serial de Excel) a 'Y-m-d' o null.
 */
function parse_date_value($v): ?string {
    if ($v === null) return null;
    $v = trim((string)$v);
    if ($v === '') return null;
    if (is_numeric($v) && (float)$v > 20000 && (float)$v < 80000) {
        // Serial de Excel (días desde 1899-12-30)
        return date('Y-m-d', (int)(((float)$v - 25569) * 86400));
    }
    foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d', 'm/d/Y'] as $fmt) {
        $dt = DateTime::createFromFormat('!' . $fmt, $v);
        if ($dt && $dt->format($fmt) === $v) return $dt->format('Y-m-d');
    }
    return null;
}

/**
 * Divide "Nombres Apellidos" en [nombres, apellidos] (heurística: 2 últimas palabras = apellidos).
 */
function split_full_name(string $full): array {
    $parts = preg_split('/\s+/', trim($full), -1, PREG_SPLIT_NO_EMPTY);
    if (count($parts) <= 1) return [$parts[0] ?? '', ''];
    if (count($parts) === 2) return [$parts[0], $parts[1]];
    $ape = array_splice($parts, -2);
    return [implode(' ', $parts), implode(' ', $ape)];
}
