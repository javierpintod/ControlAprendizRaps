    </main>

    <!-- Modal de Detalle Pedagógico de RAP -->
    <div id="rapDetailModal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title-wrap">
                        <span id="modalRapCode" class="modal-badge-id">RAP-00</span>
                        <h3 id="modalRapTitle" class="modal-title">Detalle del Resultado de Aprendizaje</h3>
                    </div>
                    <button type="button" class="btn-close" onclick="closeRapModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Competencia / Módulo:</label>
                            <span id="modalRapCompetency" class="detail-val highlight">--</span>
                        </div>
                        <div class="detail-item">
                            <label>Fase Curricular:</label>
                            <span id="modalRapPhase" class="detail-val">--</span>
                        </div>
                        <div class="detail-item">
                            <label>Horas Curriculares:</label>
                            <span id="modalRapHours" class="detail-val">--</span>
                        </div>
                        <div class="detail-item">
                            <label>Estado del Juicio:</label>
                            <span id="modalRapStatus" class="status-badge">--</span>
                        </div>
                    </div>

                    <div class="detail-desc-block">
                        <label>Descripción del Resultado de Aprendizaje:</label>
                        <p id="modalRapDescription" class="detail-desc-text">--</p>
                    </div>

                    <div class="detail-evaluator-block">
                        <div class="evaluator-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="evaluator-info">
                            <label>Instructor Evaluador:</label>
                            <div id="modalRapEvaluator" class="evaluator-name">--</div>
                            <div id="modalRapDate" class="evaluator-date">Evaluado: --</div>
                        </div>
                    </div>

                    <div class="detail-feedback-block">
                        <label>Observaciones y Retroalimentación Técnica:</label>
                        <div id="modalRapFeedback" class="feedback-box">Sin observaciones registradas.</div>
                    </div>

                    <!-- Simulador de Cambio de Estado -->
                    <div class="status-toggle-card">
                        <label>Simular Actualización de Juicio Formativo:</label>
                        <div class="toggle-buttons-group">
                            <button type="button" class="btn-toggle btn-toggle-aprobado" onclick="updateCurrentRapStatus('Aprobado')">
                                ✓ Marcar Aprobado
                            </button>
                            <button type="button" class="btn-toggle btn-toggle-mejorar" onclick="updateCurrentRapStatus('Por Mejorar')">
                                ⚠ Marcar Por Mejorar
                            </button>
                            <button type="button" class="btn-toggle btn-toggle-pendiente" onclick="updateCurrentRapStatus('Pendiente')">
                                ⏳ Marcar Pendiente
                            </button>
                        </div>
                        <small class="text-muted">Permite simular el impacto en las horas y porcentaje del dashboard en tiempo real.</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeRapModal()">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- App Footer -->
    <footer class="app-footer">
        <div class="footer-container">
            <div class="footer-left">
                <strong>ControlRap Aprendiz</strong> &copy; <?php echo date('Y'); ?> — Plataforma de Seguimiento de RAPs
                <span class="footer-sep">|</span>
                <span>Despliegue Local XAMPP (`C:\xampp\htdocs\controlrapaprendiz`)</span>
            </div>
            <div class="footer-right">
                <span class="tech-badge">PHP <?php echo phpversion(); ?></span>
                <span class="tech-badge">Apache 2.4</span>
                <span class="tech-badge">Chart.js 4.4</span>
                <a href="srs.php" class="footer-link">SRS v1.0</a>
            </div>
        </div>
    </footer>

    <!-- App JS -->
    <script src="assets/js/dashboard.js"></script>
</body>
</html>
