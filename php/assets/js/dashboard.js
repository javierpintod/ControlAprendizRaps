/**
 * ControlRap Aprendiz - Lógica Interactiva del Dashboard y Visualizaciones
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Gráficos Chart.js si los datos existen
    if (window.APP_DATA && window.APP_DATA.metrics) {
        initCharts(window.APP_DATA.metrics);
    }

    // Verificar si hay mensajes en la URL para mostrar Toast
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'sample_loaded') {
        showToast('Datos de muestra ADSO (48 RAPs) restaurados exitosamente.', 'success');
    }
});

let currentActiveStatusFilter = '';
let currentModalRapId = null;
let currentModalRowElement = null;

// Instancias de Gráficos
let compChartInstance = null;
let donutChartInstance = null;
let phasesChartInstance = null;

/**
 * Inicialización de Gráficos con Chart.js
 */
function initCharts(metrics) {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Gráfico de Competencias (Barras Horizontales)
    const compCtx = document.getElementById('competenciesChart');
    if (compCtx && metrics.competencies && metrics.competencies.length > 0) {
        const labels = metrics.competencies.map(c => c.name);
        const dataValues = metrics.competencies.map(c => c.percent);
        const backgroundColors = dataValues.map(val => {
            if (val >= 80) return '#10b981'; // Verde
            if (val >= 50) return '#f59e0b'; // Amarillo
            return '#ef4444'; // Rojo
        });

        compChartInstance = new Chart(compCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '% de Avance Ponderado',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderRadius: 6,
                    borderSkipped: false,
                    barThickness: 22
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const comp = metrics.competencies[context.dataIndex];
                                return ` ${context.raw}% (${comp.approved_hours}h aprobadas de ${comp.total_hours}h)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            callback: value => value + '%'
                        }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 2. Gráfico Donut de Distribución de Juicios
    const donutCtx = document.getElementById('statusDonutChart');
    if (donutCtx) {
        donutChartInstance = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Aprobados', 'Por Mejorar', 'Pendientes', 'No Evaluados'],
                datasets: [{
                    data: [
                        metrics.approved_count,
                        metrics.improve_count,
                        metrics.pending_count,
                        metrics.not_evaluated_count
                    ],
                    backgroundColor: [
                        '#10b981', // Aprobado
                        '#ef4444', // Por Mejorar
                        '#f59e0b', // Pendiente
                        '#64748b'  // No Evaluado
                    ],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 3. Gráfico por Fases del Proyecto
    const phasesCtx = document.getElementById('phasesChart');
    if (phasesCtx && metrics.phases && metrics.phases.length > 0) {
        phasesChartInstance = new Chart(phasesCtx, {
            type: 'bar',
            data: {
                labels: metrics.phases.map(p => p.name),
                datasets: [
                    {
                        label: 'Horas Aprobadas',
                        data: metrics.phases.map(p => p.approved_hours),
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    },
                    {
                        label: 'Horas Totales de la Fase',
                        data: metrics.phases.map(p => p.total_hours),
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12, usePointStyle: true }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { callback: v => v + 'h' }
                    }
                }
            }
        });
    }
}

/**
 * Filtro Reactivo de la Tabla de RAPs
 */
function filterTable() {
    const searchVal = (document.getElementById('tableSearchInput')?.value || '').toLowerCase().trim();
    const compVal = (document.getElementById('competencyFilter')?.value || '').toLowerCase().trim();
    const phaseVal = (document.getElementById('phaseFilter')?.value || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#rapsTable tbody tr');

    let visibleCount = 0;

    rows.forEach(row => {
        const id = (row.getAttribute('data-id') || '').toLowerCase();
        const status = (row.getAttribute('data-status') || '').toLowerCase();
        const comp = (row.getAttribute('data-competency') || '').toLowerCase();
        const phase = (row.getAttribute('data-phase') || '').toLowerCase();
        const desc = (row.getAttribute('data-description') || '').toLowerCase();
        const evaluator = (row.getAttribute('data-evaluator') || '').toLowerCase();

        // Coincidencia con búsqueda general
        const matchSearch = !searchVal || 
            id.includes(searchVal) || 
            comp.includes(searchVal) || 
            desc.includes(searchVal) || 
            evaluator.includes(searchVal);

        // Coincidencia con dropdown de competencia
        const matchComp = !compVal || comp === compVal;

        // Coincidencia con dropdown de fase
        const matchPhase = !phaseVal || phase === phaseVal;

        // Coincidencia con chips de estado
        const matchStatus = !currentActiveStatusFilter || status === currentActiveStatusFilter.toLowerCase();

        if (matchSearch && matchComp && matchPhase && matchStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    const showingText = document.getElementById('showingRecordsText');
    if (showingText) {
        showingText.textContent = `Mostrando ${visibleCount} de ${rows.length} resultados`;
    }
}

/**
 * Cambio de Estado con Botón Chip
 */
function setFilterStatusChip(status, element) {
    currentActiveStatusFilter = status;
    document.querySelectorAll('.status-chips-group .chip').forEach(c => c.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    filterTable();
}

/**
 * Filtro Rápido desde tarjetas KPI
 */
function filterByStatus(status) {
    const tableSec = document.getElementById('tabla-matriz');
    if (tableSec) {
        tableSec.scrollIntoView({ behavior: 'smooth' });
    }
    const chips = document.querySelectorAll('.status-chips-group .chip');
    chips.forEach(c => {
        if (c.textContent.toLowerCase().includes(status.toLowerCase())) {
            setFilterStatusChip(status, c);
        }
    });
}

/**
 * Modal de Detalle de RAP
 */
function openRapModalFromRow(tr) {
    currentModalRowElement = tr;
    currentModalRapId = tr.getAttribute('data-id');

    document.getElementById('modalRapCode').textContent = currentModalRapId;
    document.getElementById('modalRapTitle').textContent = tr.getAttribute('data-description');
    document.getElementById('modalRapCompetency').textContent = tr.getAttribute('data-competency');
    document.getElementById('modalRapPhase').textContent = tr.getAttribute('data-phase');
    document.getElementById('modalRapHours').textContent = tr.getAttribute('data-hours') + ' Horas Curriculares';
    
    const statusVal = tr.getAttribute('data-status');
    const statusBadge = document.getElementById('modalRapStatus');
    statusBadge.textContent = statusVal;
    statusBadge.className = 'status-badge ' + (
        statusVal === 'Aprobado' ? 'badge-success' :
        statusVal === 'Por Mejorar' ? 'badge-danger' :
        statusVal === 'Pendiente' ? 'badge-warning' : 'badge-muted'
    );

    document.getElementById('modalRapDescription').textContent = tr.getAttribute('data-description');
    document.getElementById('modalRapEvaluator').textContent = tr.getAttribute('data-evaluator');
    document.getElementById('modalRapDate').textContent = 'Fecha de Evaluación: ' + tr.getAttribute('data-date');
    document.getElementById('modalRapFeedback').textContent = tr.getAttribute('data-feedback') || 'Sin observaciones técnicas registradas.';

    document.getElementById('rapDetailModal').style.display = 'flex';
}

function closeRapModal() {
    const modal = document.getElementById('rapDetailModal');
    if (modal) modal.style.display = 'none';
    currentModalRapId = null;
    currentModalRowElement = null;
}

/**
 * Actualización del Estado de un RAP (Simulador en Tiempo Real vía AJAX)
 */
async function updateCurrentRapStatus(newStatus) {
    if (!currentModalRapId) return;

    try {
        const response = await fetch('api/update_rap.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentModalRapId,
                status: newStatus
            })
        });

        const result = await response.json();
        if (result.success) {
            // Actualizar fila visual en la tabla
            if (currentModalRowElement) {
                currentModalRowElement.setAttribute('data-status', newStatus);
                const badgeInRow = currentModalRowElement.querySelector('.status-badge');
                if (badgeInRow) {
                    badgeInRow.textContent = (newStatus === 'Aprobado' ? '✓ ' : (newStatus === 'Por Mejorar' ? '⚠ ' : '⏳ ')) + newStatus;
                    badgeInRow.className = 'status-badge ' + (
                        newStatus === 'Aprobado' ? 'badge-success' :
                        newStatus === 'Por Mejorar' ? 'badge-danger' : 'badge-warning'
                    );
                }
            }

            // Actualizar modal
            const modalBadge = document.getElementById('modalRapStatus');
            modalBadge.textContent = newStatus;
            modalBadge.className = 'status-badge ' + (
                newStatus === 'Aprobado' ? 'badge-success' :
                newStatus === 'Por Mejorar' ? 'badge-danger' : 'badge-warning'
            );

            // Actualizar KPIs si el backend envió nuevas métricas
            if (result.metrics) {
                const m = result.metrics;
                const kpiWeight = document.getElementById('kpiWeightedPercent');
                if (kpiWeight) kpiWeight.textContent = m.weighted_percent + '%';
                
                const kpiApp = document.getElementById('kpiApprovedCount');
                if (kpiApp) kpiApp.textContent = m.approved_count;

                const kpiImp = document.getElementById('kpiImproveCount');
                if (kpiImp) kpiImp.textContent = m.improve_count;

                const kpiPend = document.getElementById('kpiPendingCount');
                if (kpiPend) kpiPend.textContent = m.pending_count + m.not_evaluated_count;

                // Actualizar Donut chart si está activo
                if (donutChartInstance) {
                    donutChartInstance.data.datasets[0].data = [
                        m.approved_count,
                        m.improve_count,
                        m.pending_count,
                        m.not_evaluated_count
                    ];
                    donutChartInstance.update();
                }
            }

            showToast(`RAP ${currentModalRapId} actualizado a "${newStatus}"`, 'success');
        } else {
            showToast(result.error || 'No se pudo actualizar el estado', 'danger');
        }
    } catch (err) {
        console.error('Error al actualizar RAP:', err);
        showToast('Error de red al actualizar', 'danger');
    }
}

/**
 * Notificaciones Toast
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' 
                ? '<polyline points="20 6 9 17 4 12"/>' 
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

/**
 * Manejo de Arrastrar y Soltar (Drag & Drop) para Excel / CSV
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzone');
    if (dropzone) dropzone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzone');
    if (dropzone) dropzone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        processIncomingFile(files[0]);
    }
}

function handleFileSelected(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
        processIncomingFile(files[0]);
    }
}

/**
 * Procesa el archivo en el navegador usando SheetJS y envía JSON al backend
 */
function processIncomingFile(file) {
    const feedback = document.getElementById('fileSelectedFeedback');
    const nameEl = document.getElementById('selectedFileName');
    const sizeEl = document.getElementById('selectedFileSize');
    const progressBar = document.getElementById('uploadProgressBar');

    if (feedback) feedback.style.display = 'block';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
    if (progressBar) progressBar.style.width = '30%';

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (progressBar) progressBar.style.width = '70%';
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Tomar la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                showToast('El archivo no contiene filas con datos legibles.', 'danger');
                if (progressBar) progressBar.style.width = '0%';
                return;
            }

            if (progressBar) progressBar.style.width = '100%';

            // Rellenar formulario oculto y enviarlo por POST a upload.php
            document.getElementById('hiddenExcelDataJson').value = JSON.stringify(jsonData);
            document.getElementById('hiddenOriginalFilename').value = file.name;
            
            showToast(`Analizando ${jsonData.length} registros...`, 'success');
            setTimeout(() => {
                document.getElementById('hiddenUploadForm').submit();
            }, 500);

        } catch (err) {
            console.error('Error al procesar archivo Excel:', err);
            showToast('Error al parsear el archivo Excel. Verifica el formato.', 'danger');
            if (progressBar) progressBar.style.width = '0%';
        }
    };

    reader.readAsArrayBuffer(file);
}
