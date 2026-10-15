<?php
/**
 * ControlRap Aprendiz - API Endpoint para Actualizar RAP
 */
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$rapId = trim($input['id'] ?? '');
$newStatus = trim($input['status'] ?? '');

if (empty($rapId)) {
    echo json_encode(['success' => false, 'error' => 'ID de RAP no especificado']);
    exit;
}

$raps = get_active_raps();
$found = false;
$updatedRap = null;

foreach ($raps as &$r) {
    if ($r['id'] === $rapId) {
        if (!empty($newStatus)) {
            $r['status'] = normalize_status($newStatus);
            $r['evaluationDate'] = date('Y-m-d');
        }
        if (isset($input['feedback'])) {
            $r['evaluatorFeedback'] = trim($input['feedback']);
        }
        $updatedRap = $r;
        $found = true;
        break;
    }
}
unset($r);

if ($found) {
    $_SESSION['active_raps'] = $raps;
    $newMetrics = calculate_metrics($raps);
    echo json_encode([
        'success' => true,
        'message' => 'RAP actualizado correctamente',
        'rap' => $updatedRap,
        'metrics' => $newMetrics
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se encontró el RAP con ID: ' . $rapId]);
}
