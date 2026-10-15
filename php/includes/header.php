<?php
/**
 * ControlRap Aprendiz - Header Común
 */
if (!isset($pageTitle)) {
    $pageTitle = 'Dashboard de Avance Formativo';
}
$currentScript = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> - ControlRap Aprendiz</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <!-- SheetJS (xlsx) for client-side Excel handling -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    <!-- App CSS -->
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <!-- Topbar / Navbar Principal -->
    <header class="app-header">
        <div class="header-container">
            <div class="brand-group">
                <div class="brand-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                        <path d="M6 6h10"/>
                        <path d="M6 10h10"/>
                        <path d="m9 16 2 2 4-4"/>
                    </svg>
                </div>
                <div class="brand-text">
                    <div class="brand-title">ControlRap <span class="badge-aprendiz">Aprendiz</span></div>
                    <div class="brand-subtitle">Analítica Formativa & Seguimiento Curricular</div>
                </div>
            </div>

            <!-- Navegación -->
            <nav class="nav-links">
                <a href="index.php" class="nav-link <?php echo ($currentScript === 'index.php') ? 'active' : ''; ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="7" height="9" x="3" y="3" rx="1"/>
                        <rect width="7" height="5" x="14" y="3" rx="1"/>
                        <rect width="7" height="9" x="14" y="12" rx="1"/>
                        <rect width="7" height="5" x="3" y="16" rx="1"/>
                    </svg>
                    <span>Dashboard</span>
                </a>
                <a href="upload.php" class="nav-link <?php echo ($currentScript === 'upload.php') ? 'active' : ''; ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" x2="12" y1="3" y2="15"/>
                    </svg>
                    <span>Cargar Matriz</span>
                </a>
                <a href="index.php#tabla-matriz" class="nav-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v18"/>
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <path d="M3 9h18"/>
                        <path d="M3 15h18"/>
                    </svg>
                    <span>Matriz RAPs</span>
                </a>
                <a href="cursos.php" class="nav-link <?php echo ($currentScript === 'cursos.php') ? 'active' : ''; ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                    </svg>
                    <span>Cursos</span>
                </a>
                <a href="aprendices.php" class="nav-link <?php echo ($currentScript === 'aprendices.php') ? 'active' : ''; ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Aprendices</span>
                </a>
                <a href="srs.php" class="nav-link <?php echo ($currentScript === 'srs.php') ? 'active' : ''; ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span>Especificación SRS</span>
                </a>
            </nav>

            <!-- Acciones Rápidas -->
            <div class="header-actions">
                <a href="download.php?type=template" class="btn btn-outline btn-sm" title="Descargar plantilla Excel / CSV">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                    <span>Plantilla</span>
                </a>

                <div class="xampp-status-pill" title="Servidor local Apache / PHP 8.2 sincronizado">
                    <span class="status-dot"></span>
                    <span class="status-label">XAMPP Local</span>
                </div>
            </div>
        </div>
    </header>

    <main class="main-content">
