<?php
/**
 * ControlRap Aprendiz - Restaurar Datos Oficiales ADSO
 */
require_once __DIR__ . '/includes/functions.php';

$defaultFile = __DIR__ . '/data/default_raps.json';
if (file_exists($defaultFile)) {
    $json = file_get_contents($defaultFile);
    $data = json_decode($json, true);
    if (is_array($data)) {
        set_active_raps($data, 'ADSO_2670189_Consolidado_Oficial.xlsx');
    }
}

header('Location: index.php?msg=sample_loaded');
exit;
