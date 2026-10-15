<?php
/**
 * ControlRap Aprendiz - Gestión de cursos (fichas)
 */
require_once __DIR__ . '/includes/functions.php';
require_db();

$pageTitle = 'Gestión de Cursos';
$msg = null; $err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $action = $_POST['action'] ?? '';
        if ($action === 'crear') {
            if (trim($_POST['codigo_ficha'] ?? '') === '' || trim($_POST['nombre'] ?? '') === '') {
                throw new RuntimeException('Código de ficha y nombre son obligatorios.');
            }
            $id = create_curso($_POST);
            $_SESSION['curso_id'] = $id;
            $msg = 'Curso creado correctamente.';
        } elseif ($action === 'eliminar') {
            delete_curso((int)$_POST['id']);
            unset($_SESSION['curso_id']);
            $msg = 'Curso eliminado junto con sus RAPs, matrículas y evaluaciones.';
        }
    } catch (PDOException $e) {
        $err = $e->getCode() === '23000' ? 'Ya existe un curso con ese código de ficha.' : $e->getMessage();
    } catch (Throwable $e) {
        $err = $e->getMessage();
    }
}

$cursos = list_cursos();
require_once __DIR__ . '/includes/header.php';
?>
<div class="dashboard-wrapper">
    <div class="page-title-card">
        <div class="title-wrap">
            <span class="badge-tag">Persistencia MySQL</span>
            <h1 class="page-title">Cursos / Fichas</h1>
            <p class="page-desc">Cada curso tiene su propio catálogo de competencias y RAPs, y sus aprendices matriculados.</p>
        </div>
    </div>

    <?php if ($msg): ?><div class="alert-banner alert-success"><div class="alert-content"><p><?php echo htmlspecialchars($msg); ?></p></div></div><?php endif; ?>
    <?php if ($err): ?><div class="alert-banner alert-danger"><div class="alert-content"><p><?php echo htmlspecialchars($err); ?></p></div></div><?php endif; ?>

    <div class="upload-layout-grid">
        <section class="matrix-card">
            <div class="matrix-header"><div><h2 class="matrix-title"><?php echo count($cursos); ?> curso(s) registrados</h2></div></div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Ficha</th><th>Curso / Programa</th><th style="text-align:center">Aprendices</th><th style="text-align:center">RAPs</th><th style="text-align:center">Horas</th><th style="text-align:center">Avance prom.</th><th></th></tr></thead>
                    <tbody>
                    <?php foreach ($cursos as $c): ?>
                        <tr>
                            <td><span class="id-tag"><?php echo htmlspecialchars($c['codigo_ficha']); ?></span></td>
                            <td>
                                <div class="desc-title"><?php echo htmlspecialchars($c['nombre']); ?></div>
                                <div class="desc-feedback-snippet"><?php echo htmlspecialchars(($c['programa'] ?? '') . ' · ' . ($c['modalidad'] ?? '')); ?></div>
                            </td>
                            <td style="text-align:center"><?php echo (int)$c['total_aprendices']; ?></td>
                            <td style="text-align:center"><?php echo (int)$c['total_raps']; ?></td>
                            <td style="text-align:center"><?php echo (int)$c['total_horas']; ?>h</td>
                            <td style="text-align:center"><?php echo $c['avance_promedio'] !== null ? $c['avance_promedio'] . '%' : '—'; ?></td>
                            <td class="row-actions">
                                <a href="index.php?curso=<?php echo (int)$c['id']; ?>" class="btn btn-outline btn-sm">Dashboard</a>
                                <a href="aprendices.php?curso=<?php echo (int)$c['id']; ?>" class="btn btn-outline btn-sm">Aprendices</a>
                                <form method="POST" onsubmit="return confirm('¿Eliminar el curso <?php echo htmlspecialchars($c['codigo_ficha'], ENT_QUOTES); ?>? Se borrarán sus RAPs, matrículas y evaluaciones.')">
                                    <input type="hidden" name="action" value="eliminar">
                                    <input type="hidden" name="id" value="<?php echo (int)$c['id']; ?>">
                                    <button class="btn btn-icon btn-sm btn-danger-soft" title="Eliminar">✕</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (!$cursos): ?><tr><td colspan="7" class="text-muted">No hay cursos todavía.</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="card">
            <div class="card-header"><h3 class="card-title">Nuevo curso</h3></div>
            <div class="card-body">
                <form method="POST" class="stack-form">
                    <input type="hidden" name="action" value="crear">
                    <div class="form-group"><label>Código de ficha *</label><input name="codigo_ficha" class="form-control" required maxlength="30" placeholder="2670189"></div>
                    <div class="form-group"><label>Nombre del curso *</label><input name="nombre" class="form-control" required maxlength="200" placeholder="ADSO - Ficha 2670189"></div>
                    <div class="form-group"><label>Programa de formación</label><input name="programa" class="form-control" maxlength="200" placeholder="Tecnólogo en Análisis y Desarrollo de Software"></div>
                    <div class="form-group"><label>Modalidad</label>
                        <select name="modalidad" class="filter-select"><option>Presencial</option><option>Virtual</option><option>Mixta</option></select>
                    </div>
                    <div class="form-grid-2">
                        <div class="form-group"><label>Fecha inicio</label><input type="date" name="fecha_inicio" class="form-control"></div>
                        <div class="form-group"><label>Fecha fin</label><input type="date" name="fecha_fin" class="form-control"></div>
                    </div>
                    <button class="btn btn-primary">Crear curso</button>
                    <small class="text-muted">Los RAPs del curso se crean al cargar el primer archivo Excel/CSV.</small>
                </form>
            </div>
        </section>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
