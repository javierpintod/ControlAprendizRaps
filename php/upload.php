<?php
/**
 * ControlRap Aprendiz - Módulo de Carga e Ingesta de Archivos Excel / CSV
 */
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Carga y Validación de Matriz de RAPs';
$uploadMessage = '';
$uploadStatus = '';
$diagnostic = null;

// Manejo de carga de archivo vía POST (CSV o JSON proveniente del parseo de Excel)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Caso 1: JSON enviado desde SheetJS (Excel .xlsx / .xls)
    if (isset($_POST['excel_data_json']) && !empty($_POST['excel_data_json'])) {
        $jsonData = json_decode($_POST['excel_data_json'], true);
        $fileName = !empty($_POST['original_filename']) ? trim($_POST['original_filename']) : 'Archivo_Excel.xlsx';
        
        if (is_array($jsonData) && count($jsonData) > 0) {
            $parsedRaps = [];
            $sanitizedCount = 0;
            
            foreach ($jsonData as $idx => $row) {
                // Mapeo flexible de cabeceras
                $id = $row['id_rap'] ?? $row['ID_RAP'] ?? $row['codigo_rap'] ?? ('RAP-' . sprintf('%02d', $idx + 1));
                $code = $row['codigo_competencia'] ?? $row['Codigo_Competencia'] ?? '';
                $comp = $row['competencia_modulo'] ?? $row['Competencia_Modulo'] ?? $row['competencia'] ?? 'Competencia General';
                $desc = $row['descripcion_rap'] ?? $row['Descripcion_RAP'] ?? $row['descripcion'] ?? $row['Resultado'] ?? '';
                $hours = isset($row['horas']) ? (int)$row['horas'] : (isset($row['Horas']) ? (int)$row['Horas'] : 20);
                if ($hours <= 0) {
                    $hours = 20;
                    $sanitizedCount++;
                }
                $phase = $row['fase'] ?? $row['Fase'] ?? 'Fase 1';
                $rawStatus = $row['estado'] ?? $row['Estado'] ?? $row['juicio'] ?? 'No Evaluado';
                $normalized = normalize_status($rawStatus);
                if (mb_strtolower(trim($rawStatus)) !== mb_strtolower($normalized)) {
                    $sanitizedCount++;
                }
                $date = $row['fecha_evaluacion'] ?? $row['Fecha_Evaluacion'] ?? date('Y-m-d');
                $evaluator = $row['instructor_evaluador'] ?? $row['Instructor_Evaluador'] ?? $row['instructor'] ?? 'Instructor Titular';
                $feedback = $row['observaciones'] ?? $row['Observaciones'] ?? '';
                
                $parsedRaps[] = [
                    'id' => $id,
                    'code' => $code,
                    'competency' => $comp,
                    'description' => $desc,
                    'hours' => $hours,
                    'phase' => $phase,
                    'status' => $normalized,
                    'evaluationDate' => $date,
                    'evaluator' => $evaluator,
                    'evaluatorFeedback' => $feedback
                ];
            }
            
            set_active_raps($parsedRaps, $fileName);
            $uploadStatus = 'success';
            $uploadMessage = "Se procesaron exitosamente " . count($parsedRaps) . " resultados de aprendizaje desde el archivo " . htmlspecialchars($fileName) . ".";
            
            $diagnostic = [
                'total_rows' => count($parsedRaps),
                'sanitized_warnings' => $sanitizedCount,
                'filename' => $fileName,
                'metrics' => calculate_metrics($parsedRaps)
            ];
        } else {
            $uploadStatus = 'error';
            $uploadMessage = "El archivo Excel no contenía filas válidas de datos.";
        }
    } 
    // Caso 2: Carga directa de archivo CSV mediante PHP
    elseif (isset($_FILES['raps_file']) && $_FILES['raps_file']['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES['raps_file']['tmp_name'];
        $origName = $_FILES['raps_file']['name'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        
        if ($ext === 'csv') {
            $file = fopen($tmpName, 'r');
            if ($file) {
                // Quitar BOM UTF-8 si existe
                $bom = fread($file, 3);
                if ($bom !== "\xEF\xBB\xBF") {
                    rewind($file);
                }
                
                $headers = fgetcsv($file, 2000, ',');
                if (!$headers || count($headers) < 2) {
                    rewind($file);
                    $headers = fgetcsv($file, 2000, ';'); // Soporte para CSV separado por punto y coma
                    $delimiter = ';';
                } else {
                    $delimiter = ',';
                }
                
                // Mapear cabeceras normalizadas
                $headerMap = [];
                foreach ($headers as $colIdx => $head) {
                    $normHead = strtolower(trim(str_replace(['"', "'", "\xEF\xBB\xBF"], '', $head)));
                    $headerMap[$normHead] = $colIdx;
                }
                
                $parsedRaps = [];
                $rowIdx = 0;
                $sanitizedCount = 0;
                
                while (($data = fgetcsv($file, 2000, $delimiter)) !== false) {
                    $rowIdx++;
                    if (empty(array_filter($data))) continue; // Saltar filas vacías
                    
                    $getVal = function($keys, $default = '') use ($data, $headerMap) {
                        foreach ((array)$keys as $k) {
                            if (isset($headerMap[$k]) && isset($data[$headerMap[$k]])) {
                                return trim($data[$headerMap[$k]]);
                            }
                        }
                        return $default;
                    };
                    
                    $id = $getVal(['id_rap', 'id', 'codigo_rap'], 'RAP-' . sprintf('%02d', $rowIdx));
                    $code = $getVal(['codigo_competencia', 'codigo']);
                    $comp = $getVal(['competencia_modulo', 'competencia', 'modulo'], 'Competencia General');
                    $desc = $getVal(['descripcion_rap', 'descripcion', 'resultado'], 'Sin descripción');
                    $hoursRaw = $getVal(['horas', 'horas_creditos'], '20');
                    $hours = is_numeric($hoursRaw) ? (int)$hoursRaw : 20;
                    if (!is_numeric($hoursRaw)) $sanitizedCount++;
                    
                    $phase = $getVal(['fase', 'fase_proyecto'], 'Fase 1');
                    $rawStatus = $getVal(['estado', 'juicio_evaluativo', 'juicio'], 'No Evaluado');
                    $normalized = normalize_status($rawStatus);
                    if (mb_strtolower($rawStatus) !== mb_strtolower($normalized)) $sanitizedCount++;
                    
                    $date = $getVal(['fecha_evaluacion', 'fecha'], date('Y-m-d'));
                    $evaluator = $getVal(['instructor_evaluador', 'instructor'], 'Instructor Asignado');
                    $feedback = $getVal(['observaciones', 'feedback', 'retroalimentacion'], '');
                    
                    $parsedRaps[] = [
                        'id' => $id,
                        'code' => $code,
                        'competency' => $comp,
                        'description' => $desc,
                        'hours' => $hours,
                        'phase' => $phase,
                        'status' => $normalized,
                        'evaluationDate' => $date,
                        'evaluator' => $evaluator,
                        'evaluatorFeedback' => $feedback
                    ];
                }
                fclose($file);
                
                if (count($parsedRaps) > 0) {
                    set_active_raps($parsedRaps, $origName);
                    $uploadStatus = 'success';
                    $uploadMessage = "Se procesaron exitosamente " . count($parsedRaps) . " resultados de aprendizaje desde " . htmlspecialchars($origName) . ".";
                    $diagnostic = [
                        'total_rows' => count($parsedRaps),
                        'sanitized_warnings' => $sanitizedCount,
                        'filename' => $origName,
                        'metrics' => calculate_metrics($parsedRaps)
                    ];
                } else {
                    $uploadStatus = 'error';
                    $uploadMessage = "El archivo CSV no contiene registros válidos.";
                }
            } else {
                $uploadStatus = 'error';
                $uploadMessage = "No fue posible leer el archivo CSV cargado.";
            }
        } else {
            $uploadStatus = 'error';
            $uploadMessage = "Formato no compatible directamente por PHP. Si sube un archivo .xlsx, utilice la zona de arrastrar y soltar interactiva.";
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="dashboard-wrapper">
    <!-- Header de la sección de carga -->
    <div class="page-title-card">
        <div class="title-wrap">
            <span class="badge-tag">Módulo de Ingesta Curricular</span>
            <h1 class="page-title">Cargar Archivo de Resultados de Aprendizaje</h1>
            <p class="page-desc">Soporte nativo para planillas Excel (<code>.xlsx</code>, <code>.xls</code>) y archivos <code>.csv</code> con normalización automática de juicios evaluativos.</p>
        </div>
        <div class="page-actions">
            <a href="download.php?type=template" class="btn btn-outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                <span>Descargar Plantilla Oficial (.CSV)</span>
            </a>
            <a href="load_sample.php" class="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                </svg>
                <span>Cargar Datos de Muestra ADSO (48 RAPs)</span>
            </a>
        </div>
    </div>

    <!-- Alertas y Mensajes de Diagnóstico -->
    <?php if (!empty($uploadMessage)): ?>
        <div class="alert-banner alert-<?php echo ($uploadStatus === 'success') ? 'success' : 'danger'; ?>">
            <div class="alert-icon">
                <?php if ($uploadStatus === 'success'): ?>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <?php else: ?>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <?php endif; ?>
            </div>
            <div class="alert-content">
                <strong><?php echo ($uploadStatus === 'success') ? '¡Carga Exitosa!' : 'Atención al cargar'; ?></strong>
                <p><?php echo htmlspecialchars($uploadMessage); ?></p>
            </div>
            <?php if ($uploadStatus === 'success'): ?>
                <a href="index.php" class="btn btn-sm btn-primary ml-auto">Ver Dashboard &rarr;</a>
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <?php if ($diagnostic): ?>
        <div class="diagnostic-grid">
            <div class="diag-card">
                <span class="diag-num"><?php echo $diagnostic['total_rows']; ?></span>
                <span class="diag-label">Resultados Cargados</span>
            </div>
            <div class="diag-card">
                <span class="diag-num text-success"><?php echo $diagnostic['metrics']['approved_count']; ?></span>
                <span class="diag-label">Aprobados</span>
            </div>
            <div class="diag-card">
                <span class="diag-num text-danger"><?php echo $diagnostic['metrics']['improve_count']; ?></span>
                <span class="diag-label">Por Mejorar</span>
            </div>
            <div class="diag-card">
                <span class="diag-num text-primary"><?php echo $diagnostic['metrics']['weighted_percent']; ?>%</span>
                <span class="diag-label">Avance Ponderado</span>
            </div>
            <div class="diag-card">
                <span class="diag-num text-warning"><?php echo $diagnostic['sanitized_warnings']; ?></span>
                <span class="diag-label">Celdas Normalizadas</span>
            </div>
        </div>
    <?php endif; ?>

    <!-- Cuadrícula Principal: Zona de Carga y Especificación de Estructura -->
    <div class="upload-layout-grid">
        <!-- Tarjeta de Dropzone -->
        <div class="card upload-card">
            <div class="card-header">
                <h3 class="card-title">Arrastra tu Archivo Excel o CSV</h3>
                <p class="card-subtitle">Formatos admitidos: <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code> (Hasta 15 MB)</p>
            </div>
            <div class="card-body">
                <div id="dropzone" class="dropzone-area" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleFileDrop(event)">
                    <div class="dropzone-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" x2="12" y1="18" y2="12"/>
                            <polyline points="9 15 12 12 15 15"/>
                        </svg>
                    </div>
                    <h4 class="dropzone-prompt">Arrastra y suelta tu archivo aquí</h4>
                    <p class="dropzone-subprompt">o haz clic en el botón inferior para examinar tu equipo</p>

                    <label class="btn btn-primary btn-browse">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
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

                <!-- Formulario Oculto para Enviar el JSON procesado en el cliente a PHP -->
                <form id="hiddenUploadForm" method="POST" action="upload.php" style="display: none;">
                    <input type="hidden" name="excel_data_json" id="hiddenExcelDataJson">
                    <input type="hidden" name="original_filename" id="hiddenOriginalFilename">
                </form>

                <!-- Formulario Alternativo Directo de PHP para CSV -->
                <div class="alt-upload-section">
                    <details>
                        <summary>¿Prefieres carga tradicional directa por PHP?</summary>
                        <form method="POST" enctype="multipart/form-data" class="traditional-form">
                            <div class="form-group">
                                <label>Selecciona un archivo CSV:</label>
                                <input type="file" name="raps_file" accept=".csv" required class="form-control">
                            </div>
                            <button type="submit" class="btn btn-outline btn-sm">Subir CSV vía Servidor</button>
                        </form>
                    </details>
                </div>
            </div>
        </div>

        <!-- Tarjeta de Instrucciones y Columnas Requeridas -->
        <div class="card instructions-card">
            <div class="card-header">
                <h3 class="card-title">Estructura Requerida de Columnas</h3>
                <p class="card-subtitle">Reglas de validación y tolerancia sintáctica aplicadas</p>
            </div>
            <div class="card-body">
                <div class="columns-spec-list">
                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">id_rap</span>
                            <span class="col-badge required">Obligatoria</span>
                        </div>
                        <div class="col-desc">Código único de resultado (ej. <code>RAP-01</code>). Si no existe, se auto-generará.</div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">competencia_modulo</span>
                            <span class="col-badge required">Obligatoria</span>
                        </div>
                        <div class="col-desc">Nombre de la asignatura o competencia (ej. <code>Desarrollo Web</code>).</div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">descripcion_rap</span>
                            <span class="col-badge required">Obligatoria</span>
                        </div>
                        <div class="col-desc">Declaración pedagógica del objetivo o resultado a evidenciar.</div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">horas</span>
                            <span class="col-badge required">Obligatoria</span>
                        </div>
                        <div class="col-desc">Horas curriculares para ponderar el avance. Si viene vacío, se asignan 20h.</div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">estado</span>
                            <span class="col-badge required">Obligatoria</span>
                        </div>
                        <div class="col-desc">
                            Juicio evaluativo:
                            <span class="tag-chip tag-green">Aprobado</span>
                            <span class="tag-chip tag-red">Por Mejorar</span>
                            <span class="tag-chip tag-yellow">Pendiente</span>
                            <span class="tag-chip tag-gray">No Evaluado</span>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-head">
                            <span class="col-name">fase, fecha_evaluacion, instructor_evaluador, observaciones</span>
                            <span class="col-badge optional">Opcionales</span>
                        </div>
                        <div class="col-desc">Datos complementarios para trazabilidad histórica y auditoría pedagógica.</div>
                    </div>
                </div>

                <div class="tip-box mt-3">
                    <strong>💡 Tolerancia Inteligente:</strong>
                    El motor normaliza automáticamente mayúsculas, minúsculas, tildes y nombres de columna alternativos (como <code>Descripción</code>, <code>Resultado</code>, <code>Horas_Creditos</code>).
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
