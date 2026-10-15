<?php
/**
 * ControlRap Aprendiz - Descarga de Plantillas y Exportación de Datos
 */
require_once __DIR__ . '/includes/functions.php';

$type = $_GET['type'] ?? 'template';

if ($type === 'template') {
    $filePath = __DIR__ . '/data/plantilla_resultados_aprendizaje.csv';
    $downloadName = 'plantilla_resultados_aprendizaje.csv';
    
    if (file_exists($filePath)) {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $downloadName . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        // Imprimir BOM para que Excel en Windows lo abra con acentos correctos
        echo "\xEF\xBB\xBF";
        readfile($filePath);
        exit;
    }
} elseif ($type === 'sample') {
    $filePath = __DIR__ . '/data/datos_muestra_adso_48_raps.csv';
    $downloadName = 'ADSO_2670189_Muestra_48_RAPs.csv';
    
    if (file_exists($filePath)) {
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $downloadName . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        echo "\xEF\xBB\xBF";
        readfile($filePath);
        exit;
    }
} elseif ($type === 'active_csv') {
    $raps = get_active_raps();
    $downloadName = 'Consolidado_RAPs_Exportado_' . date('Ymd_His') . '.csv';
    
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $out = fopen('php://output', 'w');
    // Escribir BOM UTF-8
    fputs($out, "\xEF\xBB\xBF");
    
    // Escribir cabeceras
    fputcsv($out, [
        'id_rap',
        'codigo_competencia',
        'competencia_modulo',
        'descripcion_rap',
        'horas',
        'fase',
        'estado',
        'fecha_evaluacion',
        'instructor_evaluador',
        'observaciones'
    ]);
    
    foreach ($raps as $r) {
        fputcsv($out, [
            $r['id'] ?? '',
            $r['code'] ?? '',
            $r['competency'] ?? '',
            $r['description'] ?? '',
            $r['hours'] ?? 20,
            $r['phase'] ?? 'Fase 1',
            $r['status'] ?? 'No Evaluado',
            $r['evaluationDate'] ?? '',
            $r['evaluator'] ?? '',
            $r['evaluatorFeedback'] ?? ''
        ]);
    }
    fclose($out);
    exit;
}

header('Location: index.php');
exit;
