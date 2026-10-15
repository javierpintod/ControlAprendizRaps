<?php
/**
 * ControlRap Aprendiz - Visor Integrado de la Especificación de Requerimientos de Software (SRS)
 */
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Especificación de Requerimientos de Software (SRS v1.0)';
require_once __DIR__ . '/includes/header.php';
?>

<div class="dashboard-wrapper">
    <!-- Header del SRS -->
    <div class="srs-header-card">
        <div class="srs-header-info">
            <span class="badge-tag">Documento Oficial de Requerimientos</span>
            <h1 class="srs-title">Especificación de Requerimientos de Software (SRS v1.0)</h1>
            <p class="srs-subtitle">Sistema de Seguimiento Formativo y Analítica de Resultados de Aprendizaje (RAPs)</p>
            <div class="srs-meta-row">
                <span class="srs-meta-pill"><strong>Autor:</strong> Analista de Requerimientos Educativos</span>
                <span class="srs-meta-pill"><strong>Versión:</strong> 1.0 (Producción Local)</span>
                <span class="srs-meta-pill"><strong>Plataforma:</strong> PHP 8.2 + Apache (XAMPP)</span>
                <span class="srs-meta-pill"><strong>Fecha:</strong> Octubre 2026</span>
            </div>
        </div>
        <div class="srs-header-actions">
            <button type="button" class="btn btn-outline" onclick="window.print()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect width="12" height="8" x="6" y="14"/>
                </svg>
                <span>Imprimir / Guardar en PDF</span>
            </button>
            <a href="index.php" class="btn btn-primary">
                <span>Volver al Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
        </div>
    </div>

    <!-- Navegación Rápida de Secciones del SRS -->
    <div class="srs-toc-nav">
        <a href="#sec-1" class="toc-chip">1. Entradas & Excel</a>
        <a href="#sec-2" class="toc-chip">2. Procesamiento & Fórmulas</a>
        <a href="#sec-3" class="toc-chip">3. Dashboard & UI/UX</a>
        <a href="#sec-4" class="toc-chip">4. Usuarios & Entorno</a>
        <a href="#sec-5" class="toc-chip">5. Requerimientos No Funcionales</a>
        <a href="#sec-6" class="toc-chip">6. Alcance MVP vs V2</a>
        <a href="#sec-7" class="toc-chip">7. Criterios de Aceptación</a>
        <a href="#sec-8" class="toc-chip">8. Supuestos & Decisiones</a>
    </div>

    <!-- Contenido Estructurado del SRS -->
    <div class="srs-content-card">
        
        <!-- SECCIÓN 1 -->
        <article id="sec-1" class="srs-section">
            <h2 class="section-title">1. Entradas y Estructura del Archivo Excel</h2>
            <p class="section-intro">
                El software permite la ingesta de archivos en formatos <code>.xlsx</code>, <code>.xls</code> y <code>.csv</code> conteniendo la matriz de resultados de aprendizaje del aprendiz.
            </p>

            <h3 class="subsection-title">1.1 Plantilla de Datos Estandarizada</h3>
            <div class="table-responsive my-3">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Columna</th>
                            <th>Cabecera Técnica</th>
                            <th>Tipo</th>
                            <th>Obligatoria</th>
                            <th>Justificación Técnica y Pedagógica</th>
                            <th>Ejemplo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>ID RAP</strong></td>
                            <td><code>id_rap</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge required">Sí</span></td>
                            <td>Identificador correlativo e inmutable para indexación y búsqueda curricular.</td>
                            <td><code>RAP-01</code></td>
                        </tr>
                        <tr>
                            <td><strong>Código Competencia</strong></td>
                            <td><code>codigo_competencia</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge optional">No</span></td>
                            <td>Código oficial de la norma de competencia laboral (estándar curricular institucional).</td>
                            <td><code>220501096</code></td>
                        </tr>
                        <tr>
                            <td><strong>Competencia / Módulo</strong></td>
                            <td><code>competencia_modulo</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge required">Sí</span></td>
                            <td>Nombre de la asignatura o área pedagógica para calcular el avance por competencia.</td>
                            <td><code>Desarrollo Web</code></td>
                        </tr>
                        <tr>
                            <td><strong>Descripción del RAP</strong></td>
                            <td><code>descripcion_rap</code></td>
                            <td>Texto largo</td>
                            <td><span class="col-badge required">Sí</span></td>
                            <td>Declaración explícita del aprendizaje u objetivo que el estudiante debe evidenciar.</td>
                            <td><code>Construir interfaces HTML y CSS</code></td>
                        </tr>
                        <tr>
                            <td><strong>Horas Curriculares</strong></td>
                            <td><code>horas</code></td>
                            <td>Numérico</td>
                            <td><span class="col-badge required">Sí</span></td>
                            <td>Carga horaria asignada al RAP. Pondera el avance real frente al total del programa (1.120h).</td>
                            <td><code>30</code></td>
                        </tr>
                        <tr>
                            <td><strong>Fase Curricular</strong></td>
                            <td><code>fase</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge optional">No</span></td>
                            <td>Etapa del proyecto formativo (Fase 1: Análisis, Planeación, Ejecución, Evaluación).</td>
                            <td><code>Fase 1</code></td>
                        </tr>
                        <tr>
                            <td><strong>Estado del Juicio</strong></td>
                            <td><code>estado</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge required">Sí</span></td>
                            <td>Juicio formativo: <code>Aprobado</code>, <code>Por Mejorar</code>, <code>Pendiente</code>, <code>No Evaluado</code>.</td>
                            <td><code>Aprobado</code></td>
                        </tr>
                        <tr>
                            <td><strong>Fecha de Evaluación</strong></td>
                            <td><code>fecha_evaluacion</code></td>
                            <td>Fecha</td>
                            <td><span class="col-badge optional">No</span></td>
                            <td>Sello temporal de calificación para trazar la curva longitudinal en el tiempo.</td>
                            <td><code>2026-03-28</code></td>
                        </tr>
                        <tr>
                            <td><strong>Instructor / Evaluador</strong></td>
                            <td><code>instructor_evaluador</code></td>
                            <td>Texto</td>
                            <td><span class="col-badge optional">No</span></td>
                            <td>Nombre del docente responsable del dictamen y retroalimentación pedagógica.</td>
                            <td><code>Ing. Roberto Torres</code></td>
                        </tr>
                        <tr>
                            <td><strong>Observaciones</strong></td>
                            <td><code>observaciones</code></td>
                            <td>Texto largo</td>
                            <td><span class="col-badge optional">No</span></td>
                            <td>Retroalimentación cualitativa detallando fortalezas, no conformidades o evidencias pendientes.</td>
                            <td><code>Cumple con maquetación responsive.</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 class="subsection-title">1.2 Reglas de Validación Sintáctica y Semántica</h3>
            <ul class="srs-list">
                <li><strong>Tolerancia de Cabeceras:</strong> Normalización insensible a mayúsculas, espacios y acentos (ej. <code>DESCRIPCIÓN</code>, <code>descripcion</code>, <code>Descripcion_RAP</code> se asocian al mismo campo).</li>
                <li><strong>Normalización de Estados:</strong>
                    <ul>
                        <li><code>Aprobado</code>: Homologa <code>aprobado</code>, <code>superado</code>, <code>a</code>, <code>si</code>, <code>1</code>, <code>pass</code>.</li>
                        <li><code>Por Mejorar</code>: Homologa <code>por mejorar</code>, <code>d</code>, <code>no aprobado</code>, <code>deficiente</code>, <code>alerta</code>.</li>
                        <li><code>Pendiente</code>: Homologa <code>pendiente</code>, <code>en revision</code>, <code>en proceso</code>, <code>evaluando</code>.</li>
                        <li><code>No Evaluado</code>: Homologa celdas vacías, <code>null</code>, <code>no evaluado</code>, <code>n/a</code>, <code>-</code>, <code>futuro</code>.</li>
                    </ul>
                </li>
                <li><strong>Control de Discrepancias:</strong> Si una fila no tiene <code>id_rap</code>, se genera un consecutivo automático <code>RAP-AUTO-N</code>. Si las <code>horas</code> vienen vacías, se asume un valor neutro de 20 horas notificando en bitácora.</li>
            </ul>
        </article>

        <!-- SECCIÓN 2 -->
        <article id="sec-2" class="srs-section">
            <h2 class="section-title">2. Procesamiento y Fórmulas Matemáticas de Avance</h2>
            
            <div class="formula-cards-grid">
                <div class="formula-card">
                    <span class="formula-badge">Indicador Oficial</span>
                    <h4 class="formula-name">Avance Ponderado por Horas Curriculares</h4>
                    <div class="formula-math">
                        % Ponderado = [ &sum; Horas RAPs Aprobados / &sum; Horas Totales del Programa ] &times; 100
                    </div>
                    <p class="formula-desc">
                        Es el indicador vinculante para certificar al estudiante. Refleja la carga crediticia real superada.
                    </p>
                </div>

                <div class="formula-card">
                    <span class="formula-badge">Indicador Conteo</span>
                    <h4 class="formula-name">Avance Nominal por Cantidad de RAPs</h4>
                    <div class="formula-math">
                        % Nominal = [ Total RAPs Aprobados / Total RAPs en Matriz ] &times; 100
                    </div>
                    <p class="formula-desc">
                        Mide el avance bruto en número de asignaciones completadas con independencia de su duración.
                    </p>
                </div>

                <div class="formula-card">
                    <span class="formula-badge">Indicador de Riesgo</span>
                    <h4 class="formula-name">Índice de Criticidad Formativa (Ic)</h4>
                    <div class="formula-math">
                        Ic = [ RAPs Por Mejorar / (RAPs Aprobados + RAPs Por Mejorar) ] &times; 100
                    </div>
                    <p class="formula-desc">
                        Mide la proporción de juicios reprobados sobre lo calificado.
                        <br>&bull; Ic &le; 5%: Óptimo &bull; 5% &lt; Ic &le; 15%: Atención &bull; Ic &gt; 15%: Alerta Crítica.
                    </p>
                </div>

                <div class="formula-card">
                    <span class="formula-badge">Indicador Modular</span>
                    <h4 class="formula-name">Avance por Competencia / Asignatura</h4>
                    <div class="formula-math">
                        % Modular = [ &sum; Horas Aprobadas de la Competencia / Horas Totales de la Competencia ] &times; 100
                    </div>
                    <p class="formula-desc">
                        Permite segmentar el cumplimiento por cada instructor responsable de área.
                    </p>
                </div>
            </div>
        </article>

        <!-- SECCIÓN 3 -->
        <article id="sec-3" class="srs-section">
            <h2 class="section-title">3. Dashboard Interactivo y Experiencia de Usuario (UI/UX)</h2>
            <div class="grid-2col">
                <div class="srs-subcard">
                    <h4>Top Indicadores Inmediatos (Cabecera)</h4>
                    <ul class="srs-list">
                        <li><strong>Avance Ponderado Global:</strong> Porcentaje destacado con barra de progreso reactiva y total de horas (ej. 840 / 1.120h).</li>
                        <li><strong>RAPs Aprobados:</strong> Conteo de resultados exitosos con badge verde y porcentaje nominal.</li>
                        <li><strong>RAPs Por Mejorar (Alerta):</strong> Conteo en rojo con índice Ic y enlace directo para filtrar los RAPs en riesgo.</li>
                        <li><strong>Pendientes / No Evaluados:</strong> Indicador en ámbar con cobertura curricular evaluada.</li>
                    </ul>
                </div>
                <div class="srs-subcard">
                    <h4>Visualizaciones y Gráficos (Chart.js)</h4>
                    <ul class="srs-list">
                        <li><strong>Gráfico de Barras Semaforizado:</strong> Avance porcentual por cada competencia (Verde &ge;80%, Amarillo 50-79%, Rojo &lt;50%).</li>
                        <li><strong>Gráfico Donut de Juicios:</strong> Proporción visual de Aprobado, Por Mejorar, Pendiente y No Evaluado.</li>
                        <li><strong>Gráfico por Fases:</strong> Distribución del progreso en las fases Análisis, Planeación, Ejecución y Evaluación.</li>
                    </ul>
                </div>
            </div>
            
            <h4 class="mt-3">Interacciones de la Matriz Curricular</h4>
            <ul class="srs-list">
                <li>Buscador reactivo en vivo por texto libre (filtra ID, competencia, descripción o instructor).</li>
                <li>Chips de filtrado rápido por estado y selects para filtrar por competencia o fase.</li>
                <li>Modal de inspección pedagógica con retroalimentación completa del evaluador y simulador en tiempo real de reevaluación.</li>
            </ul>
        </article>

        <!-- SECCIÓN 4 -->
        <article id="sec-4" class="srs-section">
            <h2 class="section-title">4. Usuarios, Dispositivos y Entorno de Uso</h2>
            <div class="grid-3col">
                <div class="srs-subcard">
                    <h4>Aprendiz / Estudiante</h4>
                    <p>Auto-seguimiento continuo de su avance formativo, verificación de horas acumuladas para etapa productiva y detección temprana de materias reprobadas.</p>
                </div>
                <div class="srs-subcard">
                    <h4>Instructor / Docente</h4>
                    <p>Monitoreo de evidencias de su módulo formativo, emisión de observaciones técnicas y auditoría de RAPs por mejorar.</p>
                </div>
                <div class="srs-subcard">
                    <h4>Coordinación Académica</h4>
                    <p>Control gerencial del porcentaje de avance del grupo, cobertura curricular de la ficha y cumplimiento del cronograma lectivo.</p>
                </div>
            </div>
            <div class="tip-box mt-3">
                <strong>🖥️ Entorno y Despliegue Local XAMPP:</strong>
                La aplicación funciona de forma completamente autónoma en <code>http://localhost/controlrapaprendiz</code>, sin requerir internet tras la carga inicial y protegiendo 100% la soberanía y confidencialidad de las calificaciones del aprendiz.
            </div>
        </article>

        <!-- SECCIÓN 5 -->
        <article id="sec-5" class="srs-section">
            <h2 class="section-title">5. Requerimientos No Funcionales (RNF)</h2>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Métrica / Verificación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>RNF-01</code></td>
                            <td>Rendimiento</td>
                            <td>Ingesta y procesamiento de matrices de datos</td>
                            <td>Menos de 1.5s para 500 filas; menos de 3s para 5.000 filas.</td>
                        </tr>
                        <tr>
                            <td><code>RNF-02</code></td>
                            <td>Interactividad</td>
                            <td>Tiempo de respuesta en filtros y búsqueda</td>
                            <td>Filtrado instantáneo en vivo (&lt; 150 milisegundos).</td>
                        </tr>
                        <tr>
                            <td><code>RNF-03</code></td>
                            <td>Compatibilidad</td>
                            <td>Navegadores web modernos</td>
                            <td>Google Chrome, Microsoft Edge, Mozilla Firefox, Safari.</td>
                        </tr>
                        <tr>
                            <td><code>RNF-04</code></td>
                            <td>Servidor Local</td>
                            <td>Entorno XAMPP Windows</td>
                            <td>Apache 2.4+ con PHP 8.1, 8.2 o superior sin extensiones complejas.</td>
                        </tr>
                        <tr>
                            <td><code>RNF-05</code></td>
                            <td>Privacidad</td>
                            <td>Tratamiento seguro de datos de formación</td>
                            <td>100% on-premises en el servidor local. Cero fugas a nubes de terceros.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </article>

        <!-- SECCIÓN 6 -->
        <article id="sec-6" class="srs-section">
            <h2 class="section-title">6. Alcance del Proyecto (MVP vs. Fase 2)</h2>
            <div class="grid-2col">
                <div class="srs-subcard">
                    <h4>Fase 1: Incluido en el MVP Actual</h4>
                    <ul class="srs-list">
                        <li>✓ Carga de archivos Excel (.xlsx, .xls) y CSV mediante drag & drop.</li>
                        <li>✓ Motor de normalización semántica y sanitización de filas.</li>
                        <li>✓ Dashboard analítico interactivo con 4 Top KPIs y 3 gráficos Chart.js.</li>
                        <li>✓ Matriz curricular con búsqueda en tiempo real y chips de filtro.</li>
                        <li>✓ Modal de detalle pedagógico con simulador de cambio de juicio.</li>
                        <li>✓ Generador y descarga de plantilla oficial CSV para Excel.</li>
                        <li>✓ Despliegue sincronizado en <code>C:\xampp\htdocs\controlrapaprendiz</code>.</li>
                    </ul>
                </div>
                <div class="srs-subcard">
                    <h4>Fase 2: Extensiones Futuras Propuestas</h4>
                    <ul class="srs-list">
                        <li>○ Conexión automática por scraping o API a plataformas como SOFIA Plus o Canvas.</li>
                        <li>○ Notificaciones por correo electrónico a aprendices al detectar RAPs en riesgo.</li>
                        <li>○ Persistencia multi-usuario con login institucional y base de datos MySQL local.</li>
                        <li>○ Generación de certificados oficiales con firma digital y código QR.</li>
                    </ul>
                </div>
            </div>
        </article>

        <!-- SECCIÓN 7 -->
        <article id="sec-7" class="srs-section">
            <h2 class="section-title">7. Criterios de Aceptación (Formato BDD / Gherkin)</h2>
            <div class="srs-subcard my-2">
                <strong>CA-01: Carga y Visualización de Archivo Válido</strong><br>
                <em>Dado</em> que el usuario arrastra un archivo <code>.xlsx</code> o <code>.csv</code> con las columnas obligatorias,<br>
                <em>Cuando</em> el sistema termina de parsear los datos,<br>
                <em>Entonces</em> debe calcular el % ponderado de horas y mostrarlo en el dashboard en menos de 2 segundos.
            </div>

            <div class="srs-subcard my-2">
                <strong>CA-02: Normalización de Estados Insensibles</strong><br>
                <em>Dado</em> un archivo con estados como <code>aprobado</code>, <code>superado</code> o <code>si</code>,<br>
                <em>Cuando</em> el motor de normalización procesa las filas,<br>
                <em>Entonces</em> todas deben homologarse al estado formal <code>Aprobado</code> y sumar el 100% de sus horas.
            </div>

            <div class="srs-subcard my-2">
                <strong>CA-03: Detección y Filtrado de RAPs en Riesgo</strong><br>
                <em>Dado</em> que el archivo contiene RAPs con estado <code>Por Mejorar</code>,<br>
                <em>Cuando</em> el usuario hace clic en la tarjeta de alerta o en el chip correspondiente,<br>
                <em>Entonces</em> la tabla de resultados debe mostrar de inmediato exclusivamente dichos RAPs para facilitar el plan de choque.
            </div>
        </article>

        <!-- SECCIÓN 8 -->
        <article id="sec-8" class="srs-section">
            <h2 class="section-title">8. Supuestos y Preguntas Abiertas de Decisión</h2>
            <div class="grid-2col">
                <div class="srs-subcard">
                    <h4>Supuestos Adoptados</h4>
                    <ul class="srs-list">
                        <li>Las horas curriculares son la base oficial para calcular la ponderación del avance de certificación.</li>
                        <li>Únicamente el estado <code>Aprobado</code> suma horas; los demás estados aportan 0 horas al acumulado.</li>
                        <li>El despliegue local se aloja en <code>C:\xampp\htdocs\controlrapaprendiz</code> sobre Apache y PHP 8.x.</li>
                    </ul>
                </div>
                <div class="srs-subcard">
                    <h4>Preguntas Abiertas para Decisión</h4>
                    <ul class="srs-list">
                        <li>¿Deseas activar persistencia en base de datos MySQL local para almacenar múltiples fichas simultáneas?</li>
                        <li>¿El reporte debe permitir exportar una constancia formal en PDF con membrete institucional del centro de formación?</li>
                        <li>¿Quieres habilitar roles protegidos por contraseña o mantenerlo en modo libre local-first?</li>
                    </ul>
                </div>
            </div>
        </article>

    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
