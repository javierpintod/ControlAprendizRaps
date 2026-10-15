<?php
/**
 * ControlRap Aprendiz - Conexión PDO a MySQL
 */
require_once __DIR__ . '/../config.php';

/**
 * Devuelve una conexión PDO única. Lanza PDOException si falla.
 */
function db(): PDO {
    static $pdo = null;
    global $DB_CONFIG;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $DB_CONFIG['host'], $DB_CONFIG['port'], $DB_CONFIG['name'], $DB_CONFIG['charset']
        );
        $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/**
 * Indica si la base de datos existe y tiene el esquema instalado.
 */
function db_is_ready(): bool {
    try {
        db()->query('SELECT 1 FROM cursos LIMIT 1');
        return true;
    } catch (Throwable $e) {
        return false;
    }
}
