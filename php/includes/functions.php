<?php
/**
 * ControlRap Aprendiz - Funciones de Procesamiento y Lógica de Negocio
 * Sistema de Seguimiento Formativo de Resultados de Aprendizaje
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Normaliza el estado de un juicio evaluativo a uno de los 4 estados canónicos:
 * 'Aprobado', 'Por Mejorar', 'Pendiente', 'No Evaluado'
 */
function normalize_status($status) {
    if ($status === null) return 'No Evaluado';
    $s = trim(mb_strtolower((string)$status, 'UTF-8'));
    
    // Homologación de Aprobado
    if (in_array($s, ['aprobado', 'aprobada', 'superado', 'superada', 'a', 'si', 'sí', 'pass', '1', 'competente'])) {
        return 'Aprobado';
    }
    
    // Homologación de Por Mejorar (Alerta Crítica)
    if (in_array($s, ['por mejorar', 'mejorar', 'd', 'no aprobado', 'no aprobada', 'deficiente', 'observacion', 'observación', 'alerta', 'insatisfactorio', 'aun no competente', 'aún no competente'])) {
        return 'Por Mejorar';
    }
    
    // Homologación de Pendiente (En Proceso)
    if (in_array($s, ['pendiente', 'en revision', 'en revisión', 'en proceso', 'evaluando', 'por evaluar', 'revision'])) {
        return 'Pendiente';
    }
    
    // Homologación de No Evaluado
    if (in_array($s, ['', 'no evaluado', 'no evaluada', 'n/a', 'na', '-', 'futuro', 'sin evaluar', 'null'])) {
        return 'No Evaluado';
    }
    
    // Fallback inteligente
    if (strpos($s, 'aprob') !== false) return 'Aprobado';
    if (strpos($s, 'mejor') !== false) return 'Por Mejorar';
    if (strpos($s, 'pend') !== false) return 'Pendiente';
    
    return 'No Evaluado';
}

/**
 * Obtiene los RAPs actualmente cargados en la sesión,
 * o carga el dataset por defecto de ADSO (48 RAPs).
 */
function get_active_raps() {
    if (isset($_SESSION['active_raps']) && is_array($_SESSION['active_raps']) && count($_SESSION['active_raps']) > 0) {
        return $_SESSION['active_raps'];
    }
    
    // Carga desde archivo JSON por defecto
    $defaultFile = __DIR__ . '/../data/default_raps.json';
    if (file_exists($defaultFile)) {
        $json = file_get_contents($defaultFile);
        $data = json_decode($json, true);
        if (is_array($data)) {
            $_SESSION['active_raps'] = $data;
            $_SESSION['active_filename'] = 'ADSO_2670189_Consolidado_Oficial.xlsx';
            $_SESSION['active_timestamp'] = date('Y-m-d H:i:s');
            return $data;
        }
    }
    
    return [];
}

/**
 * Guarda los RAPs en la sesión activa
 */
function set_active_raps($raps, $filename = 'Archivo_Cargado.xlsx') {
    $_SESSION['active_raps'] = $raps;
    $_SESSION['active_filename'] = $filename;
    $_SESSION['active_timestamp'] = date('Y-m-d H:i:s');
}

/**
 * Calcula todas las métricas, ponderaciones y desgloses de los RAPs
 */
function calculate_metrics($raps) {
    $totalCount = count($raps);
    if ($totalCount === 0) {
        return [
            'total_count' => 0,
            'total_hours' => 0,
            'approved_count' => 0,
            'approved_hours' => 0,
            'improve_count' => 0,
            'improve_hours' => 0,
            'pending_count' => 0,
            'pending_hours' => 0,
            'not_evaluated_count' => 0,
            'not_evaluated_hours' => 0,
            'nominal_percent' => 0,
            'weighted_percent' => 0,
            'critical_index' => 0,
            'critical_level' => 'Óptimo',
            'coverage_percent' => 0,
            'competencies' => [],
            'phases' => []
        ];
    }
    
    $totalHours = 0;
    $approvedCount = 0;
    $approvedHours = 0;
    $improveCount = 0;
    $improveHours = 0;
    $pendingCount = 0;
    $pendingHours = 0;
    $notEvaluatedCount = 0;
    $notEvaluatedHours = 0;
    
    $competenciesMap = [];
    $phasesMap = [];
    
    foreach ($raps as $rap) {
        $hours = isset($rap['hours']) && is_numeric($rap['hours']) ? (int)$rap['hours'] : 20;
        $status = normalize_status($rap['status'] ?? 'No Evaluado');
        $competency = !empty($rap['competency']) ? trim($rap['competency']) : 'Competencia General';
        $phase = !empty($rap['phase']) ? trim($rap['phase']) : 'Fase General';
        
        $totalHours += $hours;
        
        // Agrupación por Competencia
        if (!isset($competenciesMap[$competency])) {
            $competenciesMap[$competency] = [
                'name' => $competency,
                'total_raps' => 0,
                'approved_raps' => 0,
                'improve_raps' => 0,
                'pending_raps' => 0,
                'not_evaluated_raps' => 0,
                'total_hours' => 0,
                'approved_hours' => 0,
                'percent' => 0
            ];
        }
        $competenciesMap[$competency]['total_raps']++;
        $competenciesMap[$competency]['total_hours'] += $hours;
        
        // Agrupación por Fase
        if (!isset($phasesMap[$phase])) {
            $phasesMap[$phase] = [
                'name' => $phase,
                'total_raps' => 0,
                'approved_raps' => 0,
                'total_hours' => 0,
                'approved_hours' => 0,
                'percent' => 0
            ];
        }
        $phasesMap[$phase]['total_raps']++;
        $phasesMap[$phase]['total_hours'] += $hours;
        
        // Conteo por estado
        switch ($status) {
            case 'Aprobado':
                $approvedCount++;
                $approvedHours += $hours;
                $competenciesMap[$competency]['approved_raps']++;
                $competenciesMap[$competency]['approved_hours'] += $hours;
                $phasesMap[$phase]['approved_raps']++;
                $phasesMap[$phase]['approved_hours'] += $hours;
                break;
            case 'Por Mejorar':
                $improveCount++;
                $improveHours += $hours;
                $competenciesMap[$competency]['improve_raps']++;
                break;
            case 'Pendiente':
                $pendingCount++;
                $pendingHours += $hours;
                $competenciesMap[$competency]['pending_raps']++;
                break;
            case 'No Evaluado':
            default:
                $notEvaluatedCount++;
                $notEvaluatedHours += $hours;
                $competenciesMap[$competency]['not_evaluated_raps']++;
                break;
        }
    }
    
    // Porcentajes globales
    $nominalPercent = $totalCount > 0 ? round(($approvedCount / $totalCount) * 100, 1) : 0;
    $weightedPercent = $totalHours > 0 ? round(($approvedHours / $totalHours) * 100, 1) : 0;
    
    // Índice de Criticidad (Ic): Por Mejorar sobre RAPs evaluados con juicio definitivo
    $evaluatedTotal = $approvedCount + $improveCount;
    $criticalIndex = $evaluatedTotal > 0 ? round(($improveCount / $evaluatedTotal) * 100, 1) : 0;
    
    $criticalLevel = 'Óptimo';
    if ($criticalIndex > 15) {
        $criticalLevel = 'Alerta Crítica';
    } elseif ($criticalIndex > 5) {
        $criticalLevel = 'Atención Requerida';
    }
    
    // Cobertura Curricular: proporción abordada (Aprobado + Por Mejorar + Pendiente)
    $coveragePercent = $totalCount > 0 ? round((($totalCount - $notEvaluatedCount) / $totalCount) * 100, 1) : 0;
    
    // Calcular porcentajes por competencia
    foreach ($competenciesMap as $k => $c) {
        $competenciesMap[$k]['percent'] = $c['total_hours'] > 0 
            ? round(($c['approved_hours'] / $c['total_hours']) * 100, 1) 
            : 0;
    }
    
    // Calcular porcentajes por fase
    foreach ($phasesMap as $k => $p) {
        $phasesMap[$k]['percent'] = $p['total_hours'] > 0 
            ? round(($p['approved_hours'] / $p['total_hours']) * 100, 1) 
            : 0;
    }
    
    return [
        'total_count' => $totalCount,
        'total_hours' => $totalHours,
        'approved_count' => $approvedCount,
        'approved_hours' => $approvedHours,
        'improve_count' => $improveCount,
        'improve_hours' => $improveHours,
        'pending_count' => $pendingCount,
        'pending_hours' => $pendingHours,
        'not_evaluated_count' => $notEvaluatedCount,
        'not_evaluated_hours' => $notEvaluatedHours,
        'nominal_percent' => $nominalPercent,
        'weighted_percent' => $weightedPercent,
        'critical_index' => $criticalIndex,
        'critical_level' => $criticalLevel,
        'coverage_percent' => $coveragePercent,
        'competencies' => array_values($competenciesMap),
        'phases' => array_values($phasesMap)
    ];
}
