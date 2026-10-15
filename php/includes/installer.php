<?php
/**
 * ControlRap Aprendiz - Instalación del esquema y datos de demostración
 */
require_once __DIR__ . '/repository.php';

/**
 * Crea la base de datos y ejecuta schema.sql (DESTRUYE las tablas existentes).
 */
function install_schema(): void {
    global $DB_CONFIG;
    $dsn = sprintf('mysql:host=%s;port=%d;charset=%s', $DB_CONFIG['host'], $DB_CONFIG['port'], $DB_CONFIG['charset']);
    $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $sql = file_get_contents(__DIR__ . '/../database/schema.sql');
    // Quitar comentarios de línea y dividir por sentencias
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    $sql = str_replace('controlrap_aprendiz', $DB_CONFIG['name'], $sql);
    foreach (preg_split('/;\s*(\r?\n|$)/', $sql) as $stmt) {
        if (trim($stmt) !== '') {
            $pdo->exec($stmt);
        }
    }
}

/**
 * Carga datos de demostración: 2 cursos, 4 aprendices, 1 aprendiz en ambos cursos.
 */
function seed_demo_data(): array {
    $raps = json_decode(file_get_contents(__DIR__ . '/../data/default_raps.json'), true) ?: [];

    $cursoAdso = create_curso([
        'codigo_ficha' => '2670189',
        'nombre'       => 'ADSO - Ficha 2670189',
        'programa'     => 'Tecnólogo en Análisis y Desarrollo de Software',
        'modalidad'    => 'Presencial',
        'fecha_inicio' => '2025-07-14',
        'fecha_fin'    => '2027-07-13',
    ]);
    $cursoProg = create_curso([
        'codigo_ficha' => '2758341',
        'nombre'       => 'Programación de Software - Ficha 2758341',
        'programa'     => 'Técnico en Programación de Software',
        'modalidad'    => 'Virtual',
        'fecha_inicio' => '2026-01-20',
        'fecha_fin'    => '2026-12-18',
    ]);

    $aprendices = [
        ['documento' => '1020456789', 'nombres' => 'Laura Valentina', 'apellidos' => 'Gómez Ríos',   'email' => 'laura.gomez@misena.edu.co'],
        ['documento' => '1032987654', 'nombres' => 'Andrés Felipe',   'apellidos' => 'Martínez Cruz', 'email' => 'andres.martinez@misena.edu.co'],
        ['documento' => '1001234567', 'nombres' => 'Camila',          'apellidos' => 'Rodríguez Peña', 'email' => 'camila.rodriguez@misena.edu.co'],
        ['documento' => '1098765432', 'nombres' => 'Santiago',        'apellidos' => 'López Herrera', 'email' => 'santiago.lopez@misena.edu.co'],
    ];
    $ids = array_map('upsert_aprendiz', $aprendices);

    // Variaciones deterministas de estado por aprendiz para que cada uno tenga un avance distinto
    $estados = ['Aprobado', 'Por Mejorar', 'Pendiente', 'No Evaluado'];
    $buildRows = function (array $source, int $variant) use ($estados): array {
        $rows = [];
        foreach ($source as $i => $r) {
            $estado = $r['status'];
            if ($variant > 0 && ($i * 7 + $variant * 3) % 5 === 0) {
                $estado = $estados[($i + $variant) % 4];
            }
            $rows[] = [
                'codigo_rap'         => $r['id'],
                'codigo_oficial'     => $r['code'] ?? '',
                'codigo_competencia' => '',
                'competencia'        => $r['competency'],
                'descripcion'        => $r['description'],
                'horas'              => (int)$r['hours'],
                'fase'               => $r['phase'] ?? '',
                'estado'             => $estado,
                'fecha'              => parse_date_value($r['evaluationDate'] ?? null),
                'instructor'         => $r['evaluator'] ?? '',
                'observaciones'      => $r['evaluatorFeedback'] ?? '',
            ];
        }
        return $rows;
    };

    // Curso ADSO: 3 aprendices con los 48 RAPs
    import_rows($cursoAdso, $ids[0], $buildRows($raps, 0), 'semilla_adso_laura.json');
    import_rows($cursoAdso, $ids[1], $buildRows($raps, 1), 'semilla_adso_andres.json');
    import_rows($cursoAdso, $ids[2], $buildRows($raps, 2), 'semilla_adso_camila.json');

    // Curso Programación: subconjunto de 20 RAPs, Laura (también en ADSO) y Santiago
    $subset = array_slice($raps, 0, 20);
    import_rows($cursoProg, $ids[0], $buildRows($subset, 3), 'semilla_prog_laura.json');
    import_rows($cursoProg, $ids[3], $buildRows($subset, 4), 'semilla_prog_santiago.json');

    return ['cursos' => 2, 'aprendices' => count($ids), 'raps_adso' => count($raps), 'raps_prog' => count($subset)];
}
