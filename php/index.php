<?php
/**
 * ControlRap Aprendiz - Dashboard Principal Interactivo
 */
require_once __DIR__ . '/includes/functions.php';
require_db();

$pageTitle = 'Dashboard Analítico de Avance Formativo';
$ctx = get_active_context();
$curso = $ctx['curso'];
$aprendiz = $ctx['aprendiz'];
$raps = $ctx['matricula_id'] ? get_raps_for_matricula($ctx['matricula_id']) : [];
$metrics = calculate_metrics($raps);

// Obtener listas únicas para los selectores de filtro
$competenciasUnicas = [];
$fasesUnicas = [];
foreach ($raps as $r) {
    if (!empty($r['competency']) && !in_array($r['competency'], $competenciasUnicas)) {
        $competenciasUnicas[] = $r['competency'];
    }
    if (!empty($r['phase']) && !in_array($r['phase'], $fasesUnicas)) {
        $fasesUnicas[] = $r['phase'];
    }
}
sort($competenciasUnicas);
sort($fasesUnicas);

require_once __DIR__ . '/includes/header.php';
?>

<div class="dashboard-wrapper">
    <!-- Selector de contexto: curso y aprendiz -->
    <form method="GET" class="context-bar" id="contextForm">
        <div class="context-field">
            <label for="ctxCurso">Curso / Ficha</label>
            <select id="ctxCurso" name="curso" class="filter-select" onchange="this.form.aprendiz && (this.form.aprendiz.disabled = true); this.form.submit()">
                <?php foreach ($ctx['cursos'] as $c): ?>
                    <option value="<?php echo (int)$c['id']; ?>" <?php echo ($curso && (int)$c['id'] === (int)$curso['id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($c['codigo_ficha'] . ' — ' . $c['nombre']); ?> (<?php echo (int)$c['total_aprendices']; ?> aprendices)
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="context-field">
            <label for="ctxAprendiz">Aprendiz</label>
            <select id="ctxAprendiz" name="aprendiz" class="filter-select" onchange="this.form.submit()" <?php echo $ctx['aprendices'] ? '' : 'disabled'; ?>>
                <?php if (!$ctx['aprendices']): ?><option>Sin aprendices matriculados</option><?php endif; ?>
                <?php foreach ($ctx['aprendices'] as $a): ?>
                    <option value="<?php echo (int)$a['id']; ?>" <?php echo ($aprendiz && (int)$a['id'] === (int)$aprendiz['id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($a['apellidos'] . ', ' . $a['nombres'] . ' — ' . $a['documento']); ?> (<?php echo $a['avance_ponderado']; ?>%)
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="context-actions">
            <a href="cursos.php" class="btn btn-outline btn-sm">Gestionar cursos</a>
            <a href="aprendices.php" class="btn btn-outline btn-sm">Gestionar aprendices</a>
        </div>
    </form>

<?php if (!$curso || !$aprendiz): ?>
    <section class="empty-state card">
        <h1 class="hero-title"><?php echo $curso ? 'Este curso aún no tiene aprendices' : 'Aún no hay cursos registrados'; ?></h1>
        <p class="hero-desc">
            <?php echo $curso
                ? 'Matricula aprendices o carga un archivo Excel/CSV con las columnas documento_aprendiz y nombre_aprendiz para crearlos automáticamente.'
                : 'Crea tu primer curso para empezar a registrar aprendices y resultados de aprendizaje.'; ?>
        </p>
        <div class="hero-actions">
            <a href="<?php echo $curso ? 'aprendices.php' : 'cursos.php'; ?>" class="btn btn-primary"><?php echo $curso ? 'Matricular aprendiz' : 'Crear curso'; ?></a>
            <?php if ($curso): ?><a href="upload.php" class="btn btn-secondary">Cargar archivo</a><?php endif; ?>
        </div>
    </section>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; exit; endif; ?>

    <!-- Banner de Encabezado y Contexto Formativo -->
    <section class="program-hero-card">
        <div class="hero-left">
            <div class="hero-badge-row">
                <span class="hero-tag">Ficha: <?php echo htmlspecialchars($curso['codigo_ficha']); ?></span>
                <span class="hero-tag hero-tag-accent"><?php echo htmlspecialchars($curso['modalidad'] ?? 'Presencial'); ?></span>
                <span class="hero-tag hero-tag-success">Doc. <?php echo htmlspecialchars($aprendiz['tipo_documento'] . ' ' . $aprendiz['documento']); ?></span>
            </div>
            <h1 class="hero-title"><?php echo htmlspecialchars($aprendiz['nombres'] . ' ' . $aprendiz['apellidos']); ?></h1>
            <p class="hero-desc">
                <?php echo htmlspecialchars($curso['programa'] ?: $curso['nombre']); ?>
                <span class="hero-time">· Matrícula: <?php echo htmlspecialchars($aprendiz['estado_matricula']); ?> · Datos persistidos en MySQL</span>
            </p>
        </div>
        <div class="hero-actions">
            <a href="upload.php" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <span>Cargar Archivo</span>
            </a>
        </div>
    </section>

    <!-- Top 4 Tarjetas de Indicadores Clave (KPIs) -->
    <section class="kpi-grid">
        <!-- KPI 1: Avance Ponderado Global -->
        <div class="kpi-card kpi-card-glow">
            <div class="kpi-header">
                <span class="kpi-title">Avance Ponderado Global</span>
                <span class="kpi-icon-badge bg-primary-soft">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </span>
            </div>
            <div class="kpi-body">
                <div class="kpi-value-row">
                    <span class="kpi-main-number text-gradient-primary" id="kpiWeightedPercent"><?php echo $metrics['weighted_percent']; ?>%</span>
                    <span class="kpi-sub-pill"><?php echo $metrics['approved_hours']; ?> / <?php echo $metrics['total_hours']; ?> h</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill progress-gradient" style="width: <?php echo min(100, $metrics['weighted_percent']); ?>%;"></div>
                </div>
                <div class="kpi-footer-text">
                    Indicador oficial para certificación en etapa productiva.
                </div>
            </div>
        </div>

        <!-- KPI 2: RAPs Aprobados -->
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Resultados Aprobados</span>
                <span class="kpi-icon-badge bg-success-soft">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </span>
            </div>
            <div class="kpi-body">
                <div class="kpi-value-row">
                    <span class="kpi-main-number text-success" id="kpiApprovedCount"><?php echo $metrics['approved_count']; ?></span>
                    <span class="kpi-sub-pill text-success"><?php echo $metrics['nominal_percent']; ?>% Nominal</span>
                </div>
                <p class="kpi-caption">De un total de <strong><?php echo $metrics['total_count']; ?></strong> RAPs registrados en la matriz curricular.</p>
                <div class="kpi-footer-text">
                    Evidencias verificadas y aprobadas por el instructor.
                </div>
            </div>
        </div>

        <!-- KPI 3: RAPs Por Mejorar (Alerta Crítica) -->
        <div class="kpi-card <?php echo ($metrics['improve_count'] > 0) ? 'kpi-card-alert' : ''; ?>">
            <div class="kpi-header">
                <span class="kpi-title">Por Mejorar (Críticos)</span>
                <span class="kpi-icon-badge bg-danger-soft">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <line x1="12" x2="12" y1="9" y2="13"/>
                        <line x1="12" x2="12.01" y1="17" y2="17"/>
                    </svg>
                </span>
            </div>
            <div class="kpi-body">
                <div class="kpi-value-row">
                    <span class="kpi-main-number text-danger" id="kpiImproveCount"><?php echo $metrics['improve_count']; ?></span>
                    <span class="kpi-sub-pill <?php echo ($metrics['critical_index'] > 15) ? 'pill-danger' : 'pill-warning'; ?>">
                        Ic: <?php echo $metrics['critical_index']; ?>%
                    </span>
                </div>
                <p class="kpi-caption">
                    Estado: <strong class="<?php echo ($metrics['critical_index'] > 15) ? 'text-danger' : 'text-warning'; ?>"><?php echo $metrics['critical_level']; ?></strong>
                </p>
                <div class="kpi-footer-text">
                    <button type="button" class="btn-link" onclick="filterByStatus('Por Mejorar')">
                        Ver RAPs que requieren plan de choque &rarr;
                    </button>
                </div>
            </div>
        </div>

        <!-- KPI 4: Pendientes / No Evaluados -->
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Pendientes / En Curso</span>
                <span class="kpi-icon-badge bg-warning-soft">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" x2="12" y1="8" y2="12"/>
                        <line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                </span>
            </div>
            <div class="kpi-body">
                <div class="kpi-value-row">
                    <span class="kpi-main-number text-warning" id="kpiPendingCount"><?php echo $metrics['pending_count'] + $metrics['not_evaluated_count']; ?></span>
                    <span class="kpi-sub-pill"><?php echo $metrics['coverage_percent']; ?>% Cobertura</span>
                </div>
                <p class="kpi-caption">
                    <strong><?php echo $metrics['pending_count']; ?></strong> en revisión docente y <strong><?php echo $metrics['not_evaluated_count']; ?></strong> de fases futuras.
                </p>
                <div class="kpi-footer-text">
                    Planificados según cronograma del ciclo formativo.
                </div>
            </div>
        </div>
    </section>

    <!-- Sección de Gráficos Analíticos -->
    <section class="charts-grid">
        <!-- Gráfico 1: Cumplimiento por Competencia -->
        <div class="chart-card chart-card-large">
            <div class="chart-header">
                <div>
                    <h3 class="chart-title">Avance Ponderado por Competencia / Módulo</h3>
                    <p class="chart-subtitle">Horas aprobadas vs. horas totales por área pedagógica</p>
                </div>
                <div class="chart-legend-indicator">
                    <span class="legend-dot green"></span> &ge; 80%
                    <span class="legend-dot yellow"></span> 50-79%
                    <span class="legend-dot red"></span> &lt; 50%
                </div>
            </div>
            <div class="chart-canvas-wrapper" style="height: 320px;">
                <canvas id="competenciesChart"></canvas>
            </div>
        </div>

        <!-- Gráfico 2: Distribución de Juicios Evaluativos -->
        <div class="chart-card">
            <div class="chart-header">
                <div>
                    <h3 class="chart-title">Distribución de Juicios</h3>
                    <p class="chart-subtitle">Proporción general de estados en la matriz</p>
                </div>
            </div>
            <div class="chart-canvas-wrapper donut-wrapper" style="height: 240px;">
                <canvas id="statusDonutChart"></canvas>
            </div>
            <div class="donut-stats-row">
                <div class="donut-stat">
                    <span class="badge-dot green"></span>
                    <span class="stat-name">Aprobados:</span>
                    <strong class="stat-num"><?php echo $metrics['approved_count']; ?></strong>
                </div>
                <div class="donut-stat">
                    <span class="badge-dot red"></span>
                    <span class="stat-name">Por Mejorar:</span>
                    <strong class="stat-num"><?php echo $metrics['improve_count']; ?></strong>
                </div>
                <div class="donut-stat">
                    <span class="badge-dot yellow"></span>
                    <span class="stat-name">Pendientes:</span>
                    <strong class="stat-num"><?php echo $metrics['pending_count']; ?></strong>
                </div>
                <div class="donut-stat">
                    <span class="badge-dot gray"></span>
                    <span class="stat-name">No Evaluados:</span>
                    <strong class="stat-num"><?php echo $metrics['not_evaluated_count']; ?></strong>
                </div>
            </div>
        </div>

        <!-- Gráfico 3: Avance por Fase Curricular -->
        <div class="chart-card chart-card-full">
            <div class="chart-header">
                <div>
                    <h3 class="chart-title">Cumplimiento por Fases del Proyecto Formativo</h3>
                    <p class="chart-subtitle">Análisis, Planeación, Ejecución y Evaluación</p>
                </div>
            </div>
            <div class="chart-canvas-wrapper" style="height: 220px;">
                <canvas id="phasesChart"></canvas>
            </div>
        </div>
    </section>

    <!-- Avance comparativo de los aprendices del curso -->
    <section class="matrix-card ranking-card">
        <div class="matrix-header">
            <div>
                <h2 class="matrix-title">Aprendices de la ficha <?php echo htmlspecialchars($curso['codigo_ficha']); ?></h2>
                <p class="matrix-subtitle">Avance ponderado por horas de cada aprendiz matriculado. Haz clic para ver su detalle.</p>
            </div>
        </div>
        <div class="ranking-list">
            <?php foreach ($ctx['aprendices'] as $a):
                $pct = (float)$a['avance_ponderado'];
                $isActive = (int)$a['id'] === (int)$aprendiz['id']; ?>
                <a class="ranking-row <?php echo $isActive ? 'active' : ''; ?>" href="index.php?curso=<?php echo (int)$curso['id']; ?>&aprendiz=<?php echo (int)$a['id']; ?>">
                    <span class="ranking-name"><?php echo htmlspecialchars($a['nombres'] . ' ' . $a['apellidos']); ?></span>
                    <span class="ranking-bar"><span class="progress-bar-fill progress-gradient" style="width: <?php echo min(100, $pct); ?>%"></span></span>
                    <span class="ranking-pct"><?php echo $pct; ?>%</span>
                    <span class="ranking-meta">
                        <span class="text-success"><?php echo (int)$a['raps_aprobados']; ?> ✓</span>
                        <span class="text-danger"><?php echo (int)$a['raps_por_mejorar']; ?> ⚠</span>
                        <span class="text-warning"><?php echo (int)$a['raps_pendientes']; ?> ⏳</span>
                    </span>
                </a>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Matriz Curricular Interactiva (Tabla de RAPs) -->
    <section id="tabla-matriz" class="matrix-section">
        <div class="matrix-card">
            <div class="matrix-header">
                <div>
                    <h2 class="matrix-title">Matriz Detallada de Resultados de Aprendizaje</h2>
                    <p class="matrix-subtitle">Filtra, busca e inspecciona las evidencias y retroalimentaciones formativas</p>
                </div>
                <div class="matrix-actions">
                    <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"/>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect width="12" height="8" x="6" y="14"/>
                        </svg>
                        <span>Imprimir Reporte</span>
                    </button>
                    <a href="download.php?type=active_csv" class="btn btn-outline btn-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        <span>Exportar CSV</span>
                    </a>
                </div>
            </div>

            <!-- Barra de Controles y Filtros Dinámicos -->
            <div class="filter-toolbar">
                <div class="search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                    </svg>
                    <input type="text" id="tableSearchInput" placeholder="Buscar por código, descripción, competencia o instructor..." onkeyup="filterTable()">
                </div>

                <div class="filter-controls-group">
                    <!-- Filtro por Competencia -->
                    <select id="competencyFilter" class="filter-select" onchange="filterTable()">
                        <option value="">Todas las Competencias</option>
                        <?php foreach ($competenciasUnicas as $comp): ?>
                            <option value="<?php echo htmlspecialchars($comp); ?>"><?php echo htmlspecialchars($comp); ?></option>
                        <?php endforeach; ?>
                    </select>

                    <!-- Filtro por Fase -->
                    <select id="phaseFilter" class="filter-select" onchange="filterTable()">
                        <option value="">Todas las Fases</option>
                        <?php foreach ($fasesUnicas as $fas): ?>
                            <option value="<?php echo htmlspecialchars($fas); ?>"><?php echo htmlspecialchars($fas); ?></option>
                        <?php endforeach; ?>
                    </select>

                    <!-- Botones de Estado Rápido -->
                    <div class="status-chips-group">
                        <button type="button" class="chip active" onclick="setFilterStatusChip('', this)">Todos (<?php echo count($raps); ?>)</button>
                        <button type="button" class="chip chip-success" onclick="setFilterStatusChip('Aprobado', this)">Aprobados (<?php echo $metrics['approved_count']; ?>)</button>
                        <button type="button" class="chip chip-danger" onclick="setFilterStatusChip('Por Mejorar', this)">Por Mejorar (<?php echo $metrics['improve_count']; ?>)</button>
                        <button type="button" class="chip chip-warning" onclick="setFilterStatusChip('Pendiente', this)">Pendientes (<?php echo $metrics['pending_count']; ?>)</button>
                        <button type="button" class="chip chip-muted" onclick="setFilterStatusChip('No Evaluado', this)">No Evaluados (<?php echo $metrics['not_evaluated_count']; ?>)</button>
                    </div>
                </div>
            </div>

            <!-- Tabla de RAPs -->
            <div class="table-responsive">
                <table class="data-table" id="rapsTable">
                    <thead>
                        <tr>
                            <th style="width: 100px;">ID RAP</th>
                            <th style="width: 170px;">Competencia</th>
                            <th>Descripción del Resultado de Aprendizaje</th>
                            <th style="width: 80px; text-align: center;">Horas</th>
                            <th style="width: 100px;">Fase</th>
                            <th style="width: 140px; text-align: center;">Estado Juicio</th>
                            <th style="width: 160px;">Evaluador</th>
                            <th style="width: 90px; text-align: center;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($raps as $index => $rap): 
                            $status = normalize_status($rap['status'] ?? 'No Evaluado');
                            $badgeClass = 'badge-muted';
                            if ($status === 'Aprobado') $badgeClass = 'badge-success';
                            elseif ($status === 'Por Mejorar') $badgeClass = 'badge-danger';
                            elseif ($status === 'Pendiente') $badgeClass = 'badge-warning';
                        ?>
                        <tr class="rap-row" 
                            data-id="<?php echo htmlspecialchars($rap['id'] ?? 'RAP-' . ($index+1)); ?>"
                            data-status="<?php echo htmlspecialchars($status); ?>"
                            data-competency="<?php echo htmlspecialchars($rap['competency'] ?? ''); ?>"
                            data-phase="<?php echo htmlspecialchars($rap['phase'] ?? ''); ?>"
                            data-hours="<?php echo htmlspecialchars($rap['hours'] ?? 20); ?>"
                            data-description="<?php echo htmlspecialchars($rap['description'] ?? ''); ?>"
                            data-evaluator="<?php echo htmlspecialchars($rap['evaluator'] ?? 'No Asignado'); ?>"
                            data-date="<?php echo htmlspecialchars($rap['evaluationDate'] ?? 'Pendiente'); ?>"
                            data-feedback="<?php echo htmlspecialchars($rap['evaluatorFeedback'] ?? 'Sin observaciones'); ?>"
                            onclick="openRapModalFromRow(this)">
                            <td>
                                <span class="id-tag"><?php echo htmlspecialchars($rap['id'] ?? 'RAP-' . ($index+1)); ?></span>
                            </td>
                            <td>
                                <span class="comp-cell" title="<?php echo htmlspecialchars($rap['competency'] ?? ''); ?>">
                                    <?php echo htmlspecialchars($rap['competency'] ?? 'General'); ?>
                                </span>
                            </td>
                            <td class="desc-cell">
                                <div class="desc-title"><?php echo htmlspecialchars($rap['description'] ?? ''); ?></div>
                                <?php if (!empty($rap['evaluatorFeedback'])): ?>
                                    <div class="desc-feedback-snippet">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        <?php echo htmlspecialchars(mb_substr($rap['evaluatorFeedback'], 0, 85)) . (mb_strlen($rap['evaluatorFeedback']) > 85 ? '...' : ''); ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td style="text-align: center;">
                                <span class="hours-tag"><?php echo (int)($rap['hours'] ?? 20); ?>h</span>
                            </td>
                            <td>
                                <span class="phase-tag"><?php echo htmlspecialchars($rap['phase'] ?? 'Fase 1'); ?></span>
                            </td>
                            <td style="text-align: center;">
                                <span class="status-badge <?php echo $badgeClass; ?>">
                                    <?php if ($status === 'Aprobado'): ?>✓<?php elseif ($status === 'Por Mejorar'): ?>⚠<?php elseif ($status === 'Pendiente'): ?>⏳<?php else: ?>•<?php endif; ?>
                                    <?php echo htmlspecialchars($status); ?>
                                </span>
                            </td>
                            <td>
                                <div class="evaluator-cell">
                                    <span class="evaluator-name-sm"><?php echo htmlspecialchars($rap['evaluator'] ?? 'Por Asignar'); ?></span>
                                    <span class="evaluator-date-sm"><?php echo htmlspecialchars($rap['evaluationDate'] ?? ''); ?></span>
                                </div>
                            </td>
                            <td style="text-align: center;" onclick="event.stopPropagation();">
                                <button type="button" class="btn btn-icon btn-sm" title="Inspeccionar detalle pedagógico" onclick="openRapModalFromRow(this.closest('tr'))">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Footer con Conteo Dinámico -->
            <div class="table-footer-bar">
                <span id="showingRecordsText">Mostrando <?php echo count($raps); ?> de <?php echo count($raps); ?> resultados</span>
                <span class="table-tip">💡 Haz clic en cualquier fila para inspeccionar retroalimentaciones y simular cambios de juicio formativo.</span>
            </div>
        </div>
    </section>
</div>

<!-- Pasar datos JSON a JavaScript para renderizar Chart.js -->
<script>
    window.APP_DATA = {
        metrics: <?php echo json_encode($metrics); ?>,
        totalRaps: <?php echo count($raps); ?>
    };
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
