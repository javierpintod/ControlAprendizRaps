<?php
/**
 * Instalación por línea de comandos:
 *   C:\xampp\php\php.exe scripts\install_cli.php [--no-seed]
 * ADVERTENCIA: elimina y recrea todas las tablas.
 */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit('Solo CLI'); }
require_once __DIR__ . '/../includes/installer.php';

install_schema();
echo "Esquema instalado.\n";
if (!in_array('--no-seed', $argv, true)) {
    print_r(seed_demo_data());
}
foreach (list_cursos() as $c) {
    printf("- [%d] %s | aprendices=%d raps=%d horas=%d avance_prom=%s%%\n",
        $c['id'], $c['nombre'], $c['total_aprendices'], $c['total_raps'], $c['total_horas'], $c['avance_promedio']);
    foreach (list_aprendices((int)$c['id']) as $a) {
        printf("    · %s %s (%s): %s%% (%d/%d h) aprob=%d mejorar=%d\n",
            $a['nombres'], $a['apellidos'], $a['documento'], $a['avance_ponderado'],
            $a['horas_aprobadas'], $a['total_horas'], $a['raps_aprobados'], $a['raps_por_mejorar']);
    }
}
