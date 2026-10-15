<?php
/**
 * ControlRap Aprendiz - Asistente de instalación de la base de datos MySQL
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/includes/installer.php';

$pageTitle = 'Instalación de Base de Datos';
$ready = db_is_ready();
$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if ($ready && ($_POST['confirm'] ?? '') !== 'REINSTALAR') {
            throw new RuntimeException('Para reinstalar escribe REINSTALAR en el campo de confirmación.');
        }
        install_schema();
        $result = ['schema' => true];
        if (!empty($_POST['seed'])) {
            $result['seed'] = seed_demo_data();
        }
        unset($_SESSION['curso_id'], $_SESSION['aprendiz_id']);
        $ready = true;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$connError = null;
try { db(); } catch (Throwable $e) { $connError = $e->getMessage(); }

global $DB_CONFIG;
require_once __DIR__ . '/includes/header.php';
?>
<div class="dashboard-wrapper">
    <div class="page-title-card">
        <div class="title-wrap">
            <span class="badge-tag">Persistencia MySQL</span>
            <h1 class="page-title">Instalación de la Base de Datos</h1>
            <p class="page-desc">Crea la base <code><?php echo htmlspecialchars($DB_CONFIG['name']); ?></code> en el MySQL/MariaDB de XAMPP (<?php echo htmlspecialchars($DB_CONFIG['host'] . ':' . $DB_CONFIG['port']); ?>, usuario <code><?php echo htmlspecialchars($DB_CONFIG['user']); ?></code>).</p>
        </div>
    </div>

    <?php if ($error): ?>
        <div class="alert-banner alert-danger"><div class="alert-content"><strong>Error</strong><p><?php echo htmlspecialchars($error); ?></p></div></div>
    <?php endif; ?>

    <?php if ($result): ?>
        <div class="alert-banner alert-success">
            <div class="alert-content">
                <strong>¡Instalación completada!</strong>
                <p>Esquema creado<?php if (!empty($result['seed'])): ?> y datos demo cargados: <?php echo $result['seed']['cursos']; ?> cursos, <?php echo $result['seed']['aprendices']; ?> aprendices<?php endif; ?>.</p>
            </div>
            <a href="index.php" class="btn btn-sm btn-primary ml-auto">Ir al Dashboard &rarr;</a>
        </div>
    <?php endif; ?>

    <div class="upload-layout-grid">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><?php echo $ready ? 'Reinstalar esquema' : 'Instalar esquema'; ?></h3>
                <p class="card-subtitle">
                    Estado: <?php if ($connError && !$ready): ?>
                        <span class="text-warning">Base de datos aún no creada</span>
                    <?php elseif ($ready): ?>
                        <span class="text-success">Instalada y operativa</span>
                    <?php endif; ?>
                </p>
            </div>
            <div class="card-body">
                <form method="POST" class="install-form">
                    <label class="check-row">
                        <input type="checkbox" name="seed" value="1" checked>
                        Cargar datos de demostración (2 cursos, 4 aprendices, 48 RAPs ADSO)
                    </label>
                    <?php if ($ready): ?>
                        <div class="tip-box tip-danger">
                            <strong>⚠ Atención:</strong> reinstalar elimina todas las tablas y los datos existentes.
                        </div>
                        <div class="form-group">
                            <label>Escribe <code>REINSTALAR</code> para confirmar:</label>
                            <input type="text" name="confirm" class="form-control" autocomplete="off">
                        </div>
                    <?php endif; ?>
                    <button type="submit" class="btn btn-primary"><?php echo $ready ? 'Reinstalar base de datos' : 'Instalar base de datos'; ?></button>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Modelo de datos</h3>
                <p class="card-subtitle">Archivo: <code>database/schema.sql</code></p>
            </div>
            <div class="card-body">
                <div class="columns-spec-list">
                    <div class="spec-item"><span class="col-name">cursos</span><div class="col-desc">Fichas / grupos de un programa de formación.</div></div>
                    <div class="spec-item"><span class="col-name">aprendices</span><div class="col-desc">Identificados de forma única por documento.</div></div>
                    <div class="spec-item"><span class="col-name">matriculas</span><div class="col-desc">Relación N:M aprendiz ⇄ curso.</div></div>
                    <div class="spec-item"><span class="col-name">competencias → raps</span><div class="col-desc">Catálogo curricular propio de cada curso (horas, fase).</div></div>
                    <div class="spec-item"><span class="col-name">evaluaciones</span><div class="col-desc">Juicio vigente de cada matrícula sobre cada RAP.</div></div>
                    <div class="spec-item"><span class="col-name">historial_evaluaciones · cargas</span><div class="col-desc">Auditoría de cambios de juicio y bitácora de archivos importados.</div></div>
                    <div class="spec-item"><span class="col-name">v_avance_matricula</span><div class="col-desc">Vista con avance ponderado y conteos por aprendiz y curso.</div></div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
