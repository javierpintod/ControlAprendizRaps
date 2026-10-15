<?php
/**
 * ControlRap Aprendiz - Gestión de aprendices y matrículas
 */
require_once __DIR__ . '/includes/functions.php';
require_db();

$pageTitle = 'Gestión de Aprendices';
$msg = null; $err = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $action = $_POST['action'] ?? '';
        if ($action === 'crear') {
            if (trim($_POST['documento'] ?? '') === '' || trim($_POST['nombres'] ?? '') === '') {
                throw new RuntimeException('Documento y nombres son obligatorios.');
            }
            $aid = upsert_aprendiz($_POST);
            $cursoId = (int)($_POST['curso_id'] ?? 0);
            if ($cursoId) {
                matricular($aid, $cursoId);
                $_SESSION['curso_id'] = $cursoId;
                $_SESSION['aprendiz_id'] = $aid;
            }
            $msg = 'Aprendiz guardado' . ($cursoId ? ' y matriculado.' : '.');
        } elseif ($action === 'matricular') {
            matricular((int)$_POST['aprendiz_id'], (int)$_POST['curso_id']);
            $msg = 'Matrícula registrada.';
        } elseif ($action === 'desmatricular') {
            desmatricular((int)$_POST['aprendiz_id'], (int)$_POST['curso_id']);
            $msg = 'Matrícula eliminada (se borraron sus evaluaciones en ese curso).';
        } elseif ($action === 'eliminar') {
            delete_aprendiz((int)$_POST['aprendiz_id']);
            $msg = 'Aprendiz eliminado.';
        }
    } catch (Throwable $e) {
        $err = $e->getMessage();
    }
}

$ctx = get_active_context();
$cursos = $ctx['cursos'];
$curso = $ctx['curso'];
$matriculados = $curso ? list_aprendices((int)$curso['id']) : [];
$todos = list_aprendices();
$idsMatriculados = array_map(fn($a) => (int)$a['id'], $matriculados);
$noMatriculados = array_filter($todos, fn($a) => !in_array((int)$a['id'], $idsMatriculados, true));

require_once __DIR__ . '/includes/header.php';
?>
<div class="dashboard-wrapper">
    <div class="page-title-card">
        <div class="title-wrap">
            <span class="badge-tag">Persistencia MySQL</span>
            <h1 class="page-title">Aprendices y Matrículas</h1>
            <p class="page-desc">Un aprendiz puede estar matriculado en varios cursos; su avance se calcula por separado en cada uno.</p>
        </div>
    </div>

    <?php if ($msg): ?><div class="alert-banner alert-success"><div class="alert-content"><p><?php echo htmlspecialchars($msg); ?></p></div></div><?php endif; ?>
    <?php if ($err): ?><div class="alert-banner alert-danger"><div class="alert-content"><p><?php echo htmlspecialchars($err); ?></p></div></div><?php endif; ?>

    <?php if (!$cursos): ?>
        <div class="alert-banner alert-danger"><div class="alert-content"><p>Primero crea un curso.</p></div><a href="cursos.php" class="btn btn-sm btn-primary ml-auto">Crear curso</a></div>
    <?php else: ?>

    <form method="GET" class="context-bar">
        <div class="context-field">
            <label for="selCurso">Curso</label>
            <select id="selCurso" name="curso" class="filter-select" onchange="this.form.submit()">
                <?php foreach ($cursos as $c): ?>
                    <option value="<?php echo (int)$c['id']; ?>" <?php echo ((int)$c['id'] === (int)$curso['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($c['codigo_ficha'] . ' — ' . $c['nombre']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </form>

    <div class="upload-layout-grid">
        <section class="matrix-card">
            <div class="matrix-header"><div><h2 class="matrix-title">Matriculados en <?php echo htmlspecialchars($curso['codigo_ficha']); ?> (<?php echo count($matriculados); ?>)</h2></div></div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Documento</th><th>Aprendiz</th><th style="text-align:center">Avance</th><th style="text-align:center">✓ / ⚠ / ⏳</th><th></th></tr></thead>
                    <tbody>
                    <?php foreach ($matriculados as $a): ?>
                        <tr>
                            <td><span class="id-tag"><?php echo htmlspecialchars($a['documento']); ?></span></td>
                            <td>
                                <div class="desc-title"><?php echo htmlspecialchars($a['nombres'] . ' ' . $a['apellidos']); ?></div>
                                <div class="desc-feedback-snippet"><?php echo htmlspecialchars($a['email'] ?? ''); ?></div>
                            </td>
                            <td style="text-align:center"><strong><?php echo $a['avance_ponderado']; ?>%</strong><br><small class="text-muted"><?php echo (int)$a['horas_aprobadas']; ?>/<?php echo (int)$a['total_horas']; ?> h</small></td>
                            <td style="text-align:center"><span class="text-success"><?php echo (int)$a['raps_aprobados']; ?></span> / <span class="text-danger"><?php echo (int)$a['raps_por_mejorar']; ?></span> / <span class="text-warning"><?php echo (int)$a['raps_pendientes']; ?></span></td>
                            <td class="row-actions">
                                <a href="index.php?curso=<?php echo (int)$curso['id']; ?>&aprendiz=<?php echo (int)$a['id']; ?>" class="btn btn-outline btn-sm">Ver avance</a>
                                <form method="POST" onsubmit="return confirm('¿Quitar la matrícula? Se borrarán sus evaluaciones en este curso.')">
                                    <input type="hidden" name="action" value="desmatricular">
                                    <input type="hidden" name="aprendiz_id" value="<?php echo (int)$a['id']; ?>">
                                    <input type="hidden" name="curso_id" value="<?php echo (int)$curso['id']; ?>">
                                    <button class="btn btn-icon btn-sm btn-danger-soft" title="Quitar matrícula">✕</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (!$matriculados): ?><tr><td colspan="5" class="text-muted">Sin aprendices matriculados.</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>

            <?php if ($noMatriculados): ?>
            <form method="POST" class="inline-form mt-3">
                <input type="hidden" name="action" value="matricular">
                <input type="hidden" name="curso_id" value="<?php echo (int)$curso['id']; ?>">
                <select name="aprendiz_id" class="filter-select">
                    <?php foreach ($noMatriculados as $a): ?>
                        <option value="<?php echo (int)$a['id']; ?>"><?php echo htmlspecialchars($a['apellidos'] . ', ' . $a['nombres'] . ' — ' . $a['documento']); ?></option>
                    <?php endforeach; ?>
                </select>
                <button class="btn btn-secondary btn-sm">Matricular aprendiz existente</button>
            </form>
            <?php endif; ?>
        </section>

        <section class="card">
            <div class="card-header"><h3 class="card-title">Nuevo aprendiz</h3><p class="card-subtitle">Si el documento ya existe, se actualizan sus datos.</p></div>
            <div class="card-body">
                <form method="POST" class="stack-form">
                    <input type="hidden" name="action" value="crear">
                    <div class="form-grid-2">
                        <div class="form-group"><label>Tipo doc.</label><select name="tipo_documento" class="filter-select"><option>CC</option><option>TI</option><option>CE</option><option>PPT</option></select></div>
                        <div class="form-group"><label>Documento *</label><input name="documento" class="form-control" required maxlength="30"></div>
                    </div>
                    <div class="form-group"><label>Nombres *</label><input name="nombres" class="form-control" required maxlength="120"></div>
                    <div class="form-group"><label>Apellidos</label><input name="apellidos" class="form-control" maxlength="120"></div>
                    <div class="form-group"><label>Correo</label><input type="email" name="email" class="form-control" maxlength="160"></div>
                    <div class="form-group"><label>Matricular en</label>
                        <select name="curso_id" class="filter-select">
                            <option value="">— No matricular —</option>
                            <?php foreach ($cursos as $c): ?>
                                <option value="<?php echo (int)$c['id']; ?>" <?php echo ((int)$c['id'] === (int)$curso['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($c['codigo_ficha'] . ' — ' . $c['nombre']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button class="btn btn-primary">Guardar aprendiz</button>
                </form>
            </div>
        </section>
    </div>

    <section class="matrix-card">
        <div class="matrix-header"><div><h2 class="matrix-title">Todos los aprendices (<?php echo count($todos); ?>)</h2></div></div>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>Documento</th><th>Aprendiz</th><th>Correo</th><th>Fichas</th><th></th></tr></thead>
                <tbody>
                <?php foreach ($todos as $a): ?>
                    <tr>
                        <td><span class="id-tag"><?php echo htmlspecialchars($a['tipo_documento'] . ' ' . $a['documento']); ?></span></td>
                        <td><?php echo htmlspecialchars($a['nombres'] . ' ' . $a['apellidos']); ?></td>
                        <td><?php echo htmlspecialchars($a['email'] ?? ''); ?></td>
                        <td><?php echo htmlspecialchars($a['fichas'] ?? '—'); ?></td>
                        <td class="row-actions">
                            <form method="POST" onsubmit="return confirm('¿Eliminar al aprendiz y todas sus matrículas y evaluaciones?')">
                                <input type="hidden" name="action" value="eliminar">
                                <input type="hidden" name="aprendiz_id" value="<?php echo (int)$a['id']; ?>">
                                <button class="btn btn-icon btn-sm btn-danger-soft" title="Eliminar">✕</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>
    <?php endif; ?>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
