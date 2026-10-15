<?php
/**
 * ControlRap Aprendiz - API: actualizar el juicio de un RAP del aprendiz activo (persistido en MySQL)
 */
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$rapCode = trim((string)($input['id'] ?? ''));
$newStatus = normalize_status($input['status'] ?? '');
$feedback = isset($input['feedback']) ? trim((string)$input['feedback']) : null;

if ($rapCode === '') {
    echo json_encode(['success' => false, 'error' => 'ID de RAP no especificado']);
    exit;
}

try {
    $ctx = get_active_context();
    if (!$ctx['matricula_id']) {
        echo json_encode(['success' => false, 'error' => 'No hay aprendiz/curso activo']);
        exit;
    }
    if (!update_evaluacion_by_code($ctx['matricula_id'], $rapCode, $newStatus, $feedback)) {
        echo json_encode(['success' => false, 'error' => 'No se encontró el RAP ' . $rapCode . ' en el curso activo']);
        exit;
    }
    $raps = get_raps_for_matricula($ctx['matricula_id']);
    echo json_encode([
        'success' => true,
        'message' => 'Juicio guardado en la base de datos',
        'metrics' => calculate_metrics($raps),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
