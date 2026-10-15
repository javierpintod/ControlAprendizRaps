<?php
/**
 * ControlRap Aprendiz - Configuración de conexión a MySQL (XAMPP)
 * Para sobrescribir sin tocar este archivo, crea config.local.php
 * que redefina el arreglo $DB_CONFIG.
 */
$DB_CONFIG = [
    'host'    => '127.0.0.1',
    'port'    => 3306,
    'name'    => 'controlrap_aprendiz',
    'user'    => 'root',
    'pass'    => '',          // XAMPP por defecto: root sin contraseña
    'charset' => 'utf8mb4',
];

if (file_exists(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

date_default_timezone_set('America/Bogota');
