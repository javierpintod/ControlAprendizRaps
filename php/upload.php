<?php
/**
 * ControlRap Aprendiz - Carga de archivos Excel / CSV hacia MySQL
 */
require_once __DIR__ . '/includes/functions.php';
require_db();

$pageTitle = 'Carga y Validación de Matriz de RAPs';
$uploadMessage = '';
$uploadStatus = '';
$diagnostic = null;

/**
 * Lee un CSV (coma o punto y coma, con o sin BOM) como arreglo de filas asociativas.
 */
function read_csv_assoc(string $path): array {
    $content = file_get_contents($path);
    $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
    if (!mb_check_encoding($content, 'UTF-8')) {
        $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1252');
    }
    $firstLine = strtok($content, "\n");
    $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

    $fh = fopen('php://temp', 'r+');
    fwrite($fh, $content);
    rewind($fh);
    $headers = fgetcsv($fh, 0, $delimiter);
    $rows = [];
    while (($data = fgetcsv($fh, 0, $delimiter)) !== false) {
        if (count(array_filter($data, fn($v) => trim((string)$v) !== '')) === 0) continue;
        $rows[] = array_combine($headers, array_pad(array_slice($data, 0, count($headers)), count($headers), ''));
    }
    fclose($fh);
    return $rows;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $cursoId = (int)($_POST['curso_id'] ?? 0);
        $curso = $cursoId ? get_curso($cursoId) : null;
        if (!$curso) {
            throw new RuntimeException('Selecciona el curso de destino.');
        }

        // Aprendiz destino: existente, nuevo, o "desde archivo" (multi-aprendiz)
        $modo = $_POST['aprendiz_modo'] ?? 'existente';
        $aprendizId = null;
        if ($modo === 'existente') {
            $aprendizId = (int)($_POST['aprendiz_id'] ?? 0) ?: null;
            if (!$aprendizId) throw new RuntimeException('Selecciona el aprendiz de destino.');
        } elseif ($modo === 'nuevo') {
            $doc = trim($_POST['nuevo_documento'] ?? '');
            $nom = trim($_POST['nuevo_nombres'] ?? '');
            if ($doc === '' || $nom === '') throw new RuntimeException('Documento y nombres del nuevo aprendiz son obligatorios.');
            $aprendizId = upsert_aprendiz([
                'documento' => $doc, 'nombres' => $nom,
                'apellidos' => trim($_POST['nuevo_apellidos'] ?? ''),
            ]);
        }

        // Obtener filas crudas
        $rawRows = [];
        $fileName = 'archivo';
        if (!empty($_POST['excel_data_json'])) {
            $rawRows = json_decode($_POST['excel_data_json'], true) ?: [];
            $fileName = trim($_POST['original_filename'] ?? '') ?: 'Archivo_Excel.xlsx';
        } elseif (isset($_FILES['raps_file']) && $_FILES['raps_file']['error'] === UPLOAD_ERR_OK) {
            $fileName = $_FILES['raps_file']['name'];
            if (strtolower(pathinfo($fileName, PATHINFO_EXTENSION)) !== 'csv') {
                throw new RuntimeException('La carga directa por servidor solo admite .csv. Para .xlsx usa la zona de arrastrar y soltar.');
            }
            $rawRows = read_csv_assoc($_FILES['raps_file']['tmp_name']);
        } else {
            throw new RuntimeException('No se recibió ningún archivo.');
        }

        // Normalizar
        $normalized = 0;
        $rows = [];
        foreach ($rawRows as $i => $raw) {
            $r = normalize_import_row((array)$raw, $i, $normalized);
            if ($r) $rows[] = $r;
        }
        if (!$rows) throw new RuntimeException('El archivo no contiene filas válidas de datos.');

        if ($modo === 'archivo') {
            $sinDoc = count(array_filter($rows, fn($r) => $r['documento_aprendiz'] === ''));
            if ($sinDoc === count($rows)) {
                throw new RuntimeException('El modo "desde archivo" requiere la columna documento_aprendiz.');
            }
        }

        $res = import_rows($cursoId, $aprendizId, $rows, $fileName, $normalized);

        // Dejar como contexto activo el curso (y el aprendiz si fue uno solo)
        $_SESSION['curso_id'] = $cursoId;
        if ($aprendizId) $_SESSION['aprendiz_id'] = $aprendizId;

        $uploadStatus = 'success';
        $uploadMessage = sprintf(
            'Se guardaron %d RAPs y %d juicios evaluativos de %d aprendiz(es) en el curso %s desde "%s".',
            $res['raps'], $res['evaluaciones'], $res['aprendices'], $curso['codigo_ficha'], $fileName
        );
        if ($res['sin_aprendiz'] > 0) {
            $uploadMessage .= " {$res['sin_aprendiz']} fila(s) sin documento solo actualizaron el catálogo del curso.";
        }
        $diagnostic = ['res' => $res, 'normalized' => $normalized];
    } catch (Throwable $e) {
        $uploadStatus = 'error';
        $uploadMessage = $e->getMessage();
    }
}

$ctx = get_active_context();
$todosAprendices = list_aprendices();
$cargas = list_cargas(8);

require_once __DIR__ . '/includes/header.php';
?>

<div class="dashboard-wrapper">
    <div class="page-title-card">
        <div class="title-wrap">
            <span class="badge-tag">Módulo de Ingesta Curricular</span>
            <h1 class="page-title">Cargar Archivo de Resultados de Aprendizaje</h1>
            <p class="page-desc">Los datos se guardan en MySQL para el curso y aprendiz(es) que elijas. Soporta <code>.xlsx</code>, <code>.xls</code> y <code>.csv</code>.</p>
        </div>
        <div class="page-actions">
            <a href="download.php?type=template" class="btn btn-outline">Plantilla 1 aprendiz (.CSV)</a>
            <a href="download.php?type=template_multi" class="btn btn-outline">Plantilla varios aprendices (.CSV)</a>
        </div>
    </div>

    <?php if (!empty($uploadMessage)): ?>
        <div class="alert-banner alert-<?php echo ($uploadStatus === 'success') ? 'success' : 'danger'; ?>">
            <div class="alert-content">
                <strong><?php echo ($uploadStatus === 'success') ? '¡Carga guardada!' : 'No se pudo cargar'; ?></strong>
                <p><?php echo htmlspecialchars($uploadMessage); ?></p>
            </div>
            <?php if ($uploadStatus === 'success'): ?>
                <a href="index.php" class="btn btn-sm btn-primary ml-auto">Ver Dashboard &rarr;</a>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if ($diagnostic): ?>
        <div class="diagnostic-grid">
            <div class="diag-card"><span class="diag-num"><?php echo $diagnostic['res']['raps']; ?></span><span class="diag-label">Filas / RAPs</span></div>
            <div class="diag-card"><span class="diag-num text-success"><?php echo $diagnostic['res']['evaluaciones']; ?></span><span class="diag-label">Juicios guardados</span></div>
            <div class="diag-card"><span class="diag-num text-primary"><?php echo $diagnostic['res']['aprendices']; ?></span><span class="diag-label">Aprendices</span></div>
            <div class="diag-card"><span class="diag-num text-danger"><?php echo $diagnostic['res']['sin_aprendiz']; ?></span><span class="diag-label">Filas sin aprendiz</span></div>
            <div class="diag-card"><span class="diag-num text-warning"><?php echo $diagnostic['normalized']; ?></span><span class="diag-label">Celdas normalizadas</span></div>
        </div>
    <?php endif; ?>

    <?php if (!$ctx['cursos']): ?>
        <div class="alert-banner alert-danger"><div class="alert-content"><strong>No hay cursos</strong><p>Crea un curso antes de cargar archivos.</p></div><a href="cursos.php" class="btn btn-sm btn-primary ml-auto">Crear curso</a></div>
    <?php else: ?>

    <div class="upload-layout-grid">
        <div class="card upload-card">
            <div class="card-header">
                <h3 class="card-title">1. Destino de la carga</h3>
                <p class="card-subtitle">Curso y aprendiz al que pertenecen los juicios</p>
            </div>
            <div class="card-body">
                <!-- Campos de destino compartidos por ambos métodos de carga -->
                <div id="destinoFields" class="form-grid">
                    <div class="form-group">
                        <label for="destCurso">Curso / Ficha</label>
                        <select id="destCurso" name="curso_id" class="filter-select" form="hiddenUploadForm">
                            <?php foreach ($ctx['cursos'] as $c): ?>
                                <option value="<?php echo (int)$c['id']; ?>" <?php echo ($ctx['curso'] && (int)$c['id'] === (int)$ctx['curso']['id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($c['codigo_ficha'] . ' — ' . $c['nombre']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Aprendiz</label>
                        <div class="radio-row">
                            <label><input type="radio" name="aprendiz_modo" value="existente" form="hiddenUploadForm" checked onchange="toggleAprendizModo()"> Existente</label>
                            <label><input type="radio" name="aprendiz_modo" value="nuevo" form="hiddenUploadForm" onchange="toggleAprendizModo()"> Nuevo</label>
                            <label><input type="radio" name="aprendiz_modo" value="archivo" form="hiddenUploadForm" onchange="toggleAprendizModo()"> Varios (columna documento_aprendiz)</label>
                        </div>
                    </div>

                    <div class="form-group" id="modoExistente">
                        <select name="aprendiz_id" class="filter-select" form="hiddenUploadForm">
                            <?php foreach ($todosAprendices as $a): ?>
                                <option value="<?php echo (int)$a['id']; ?>" <?php echo ($ctx['aprendiz'] && (int)$a['id'] === (int)$ctx['aprendiz']['id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($a['apellidos'] . ', ' . $a['nombres'] . ' — ' . $a['documento']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <small class="text-muted">Si no está matriculado en el curso, se matricula automáticamente.</small>
                    </div>

                    <div class="form-group" id="modoNuevo" style="display:none">
                        <div class="form-grid-3">
                            <input type="text" name="nuevo_documento" placeholder="Documento *" class="form-control" form="hiddenUploadForm">
                            <input type="text" name="nuevo_nombres" placeholder="Nombres *" class="form-control" form="hiddenUploadForm">
                            <input type="text" name="nuevo_apellidos" placeholder="Apellidos" class="form-control" form="hiddenUploadForm">
                        </div>
                    </div>

                    <div class="tip-box" id="modoArchivo" style="display:none">
                        Cada fila debe traer <code>documento_aprendiz</code> (y opcionalmente <code>nombre_aprendiz</code>). Los aprendices nuevos se crean y matriculan automáticamente.
                    </div>
                </div>

                <h3 class="card-title mt-3">2. Archivo</h3>
                <div id="dropzone" class="dropzone-area mt-2" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleFileDrop(event)">
                    <div class="dropzone-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" x2="12" y1="18" y2="12"/>
                            <polyline points="9 15 12 12 15 15"/>
                        </svg>
                    </div>
                    <h4 class="dropzone-prompt">Arrastra y suelta tu archivo aquí</h4>
                    <p class="dropzone-subprompt">.xlsx, .xls o .csv — se procesa y se guarda en la base de datos</p>
                    <label class="btn btn-primary btn-browse">
                        <span>Seleccionar Archivo</span>
                        <input type="file" id="filePickerInput" accept=".xlsx, .xls, .csv" style="display: none;" onchange="handleFileSelected(event)">
                    </label>
                    <div id="fileSelectedFeedback" class="file-feedback" style="display: none;">
                        <span class="file-feedback-name" id="selectedFileName">--</span>
                        <span class="file-feedback-size" id="selectedFileSize">--</span>
                        <div class="progress-bar-container mt-2">
                            <div id="uploadProgressBar" class="progress-bar-fill progress-gradient" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <form id="hiddenUploadForm" method="POST" action="upload.php" style="display: none;">
                    <input type="hidden" name="excel_data_json" id="hiddenExcelDataJson">
                    <input type="hidden" name="original_filename" id="hiddenOriginalFilename">
                </form>

                <div class="alt-upload-section">
                    <details>
                        <summary>¿Prefieres carga tradicional de CSV por el servidor?</summary>
                        <form method="POST" enctype="multipart/form-data" class="traditional-form" onsubmit="copyDestinoTo(this)">
                            <input type="file" name="raps_file" accept=".csv" required class="form-control">
                            <button type="submit" class="btn btn-outline btn-sm">Subir CSV</button>
                        </form>
                    </details>
                </div>
            </div>
        </div>

        <div class="card instructions-card">
            <div class="card-header">
                <h3 class="card-title">Columnas reconocidas</h3>
                <p class="card-subtitle">Cabeceras tolerantes a mayúsculas, tildes y espacios</p>
            </div>
            <div class="card-body">
                <div class="columns-spec-list">
                    <div class="spec-item"><div class="spec-head"><span class="col-name">id_rap</span><span class="col-badge required">Obligatoria</span></div><div class="col-desc">Código del RAP dentro del curso. Si se repite en otra carga, se actualiza.</div></div>
                    <div class="spec-item"><div class="spec-head"><span class="col-name">competencia_modulo · descripcion_rap · horas</span><span class="col-badge required">Obligatorias</span></div><div class="col-desc">Catálogo curricular. Horas vacías → 20h.</div></div>
                    <div class="spec-item"><div class="spec-head"><span class="col-name">estado</span><span class="col-badge required">Obligatoria</span></div><div class="col-desc"><span class="tag-chip tag-green">Aprobado</span><span class="tag-chip tag-red">Por Mejorar</span><span class="tag-chip tag-yellow">Pendiente</span><span class="tag-chip tag-gray">No Evaluado</span></div></div>
                    <div class="spec-item"><div class="spec-head"><span class="col-name">documento_aprendiz · nombre_aprendiz</span><span class="col-badge optional">Multi-aprendiz</span></div><div class="col-desc">Permiten cargar en un solo archivo los juicios de toda la ficha.</div></div>
                    <div class="spec-item"><div class="spec-head"><span class="col-name">fase · fecha_evaluacion · instructor_evaluador · observaciones</span><span class="col-badge optional">Opcionales</span></div><div class="col-desc">Fechas en <code>AAAA-MM-DD</code>, <code>DD/MM/AAAA</code> o fecha nativa de Excel.</div></div>
                </div>
            </div>
        </div>
    </div>

    <?php if ($cargas): ?>
    <section class="matrix-card">
        <div class="matrix-header"><div><h2 class="matrix-title">Últimas cargas registradas</h2><p class="matrix-subtitle">Bitácora persistida en la tabla <code>cargas</code></p></div></div>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>Fecha</th><th>Archivo</th><th>Curso</th><th>Aprendiz</th><th style="text-align:center">Filas</th><th style="text-align:center">Aprendices</th><th style="text-align:center">Normalizadas</th></tr></thead>
                <tbody>
                <?php foreach ($cargas as $g): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($g['creado_en']); ?></td>
                        <td><?php echo htmlspecialchars($g['nombre_archivo']); ?></td>
                        <td><span class="id-tag"><?php echo htmlspecialchars($g['codigo_ficha']); ?></span></td>
                        <td><?php echo htmlspecialchars($g['aprendiz_nombre'] ?? 'Varios (desde archivo)'); ?></td>
                        <td style="text-align:center"><?php echo (int)$g['total_filas']; ?></td>
                        <td style="text-align:center"><?php echo (int)$g['aprendices_afectados']; ?></td>
                        <td style="text-align:center"><?php echo (int)$g['celdas_normalizadas']; ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>
    <?php endif; ?>
    <?php endif; ?>
</div>

<script>
function toggleAprendizModo() {
    const modo = document.querySelector('input[name="aprendiz_modo"]:checked').value;
    document.getElementById('modoExistente').style.display = modo === 'existente' ? '' : 'none';
    document.getElementById('modoNuevo').style.display = modo === 'nuevo' ? '' : 'none';
    document.getElementById('modoArchivo').style.display = modo === 'archivo' ? '' : 'none';
}
// Copia los campos de destino (asociados al formulario oculto) al formulario de CSV tradicional
function copyDestinoTo(form) {
    form.querySelectorAll('.dest-copy').forEach(el => el.remove());
    document.querySelectorAll('[form="hiddenUploadForm"]').forEach(el => {
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        const h = document.createElement('input');
        h.type = 'hidden'; h.name = el.name; h.value = el.value; h.className = 'dest-copy';
        form.appendChild(h);
    });
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
