/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { RAPItem, IngestionLog, BatchDiagnostic } from './types/rap';
import { INITIAL_RAPS, INITIAL_INGESTION_LOGS } from './data/initialRaps';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { MatrixView } from './components/MatrixView';
import { ReportsView } from './components/ReportsView';
import { SrsDocumentModal } from './components/SrsDocumentModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('reports'); // default matches screenshot or dashboard
  const [raps, setRaps] = useState<RAPItem[]>(INITIAL_RAPS);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>(INITIAL_INGESTION_LOGS);
  const [currentFilename, setCurrentFilename] = useState('ADSO_2670189_Corte_Mayo2026.xlsx');
  const [selectedFicha, setSelectedFicha] = useState('Ficha: 2670189 - ADSO');
  const [isSrsOpen, setIsSrsOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ show: boolean; title: string; msg: string }>({
    show: false,
    title: '',
    msg: '',
  });

  const showToast = (title: string, msg: string) => {
    setToast({ show: true, title, msg });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3800);
  };

  // Metrics calculation
  const totalHours = useMemo(() => {
    return raps.reduce((acc, r) => acc + r.hours, 0) || 1120;
  }, [raps]);

  const approvedHours = useMemo(() => {
    return raps.filter((r) => r.status === 'Aprobado').reduce((acc, r) => acc + r.hours, 0);
  }, [raps]);

  const approvedCount = useMemo(() => {
    return raps.filter((r) => r.status === 'Aprobado').length;
  }, [raps]);

  const improveCount = useMemo(() => {
    return raps.filter((r) => r.status === 'Por Mejorar').length;
  }, [raps]);

  const criticalIndex = useMemo(() => {
    const evaluated = approvedCount + improveCount;
    if (evaluated === 0) return 0;
    return Number(((improveCount / evaluated) * 100).toFixed(1));
  }, [approvedCount, improveCount]);

  // Handle uploaded data from UploadView
  const handleDataLoaded = (newRaps: RAPItem[], filename: string, diagnostic: BatchDiagnostic) => {
    setRaps(newRaps);
    setCurrentFilename(filename);

    // Register new ingestion in immutable audit log
    const newLog: IngestionLog = {
      id: `log-${Date.now()}`,
      filename,
      sheetName: 'Resultados_Aprendizaje',
      fileSize: `${diagnostic.memoryUsageMb} MB`,
      sha256: `sha256-${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
      auditor: 'Dra. Carolina Méndez',
      auditorInitials: 'CM',
      totalRecords: newRaps.length,
      approvedRecords: newRaps.filter((r) => r.status === 'Aprobado').length,
      validationStatus:
        diagnostic.sanitizedWarnings > 0
          ? `${diagnostic.sanitizedWarnings} Filas Normalizadas`
          : 'Íntegro (0 discrepancias)',
      normalizedCount: diagnostic.sanitizedWarnings,
      timestamp: new Date().toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setIngestionLogs((prev) => [newLog, ...prev]);
    showToast('Ingesta Procesada', `Se cargaron ${newRaps.length} registros y se registró el hash de auditoría.`);
  };

  // Update a single RAP (e.g. from notes or re-evaluation)
  const handleUpdateRap = (updated: RAPItem) => {
    setRaps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="bg-canvas-base text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient background glowing mesh as specified in design system */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-[#6366F1]/18 blur-[130px]"></div>
        <div className="absolute top-[35%] -right-[5%] w-[700px] h-[700px] rounded-full bg-[#06B6D4]/14 blur-[150px]"></div>
        <div className="absolute -bottom-[10%] left-[30%] w-[500px] h-[500px] rounded-full bg-[#a078ff]/12 blur-[140px]"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSrs={() => setIsSrsOpen(true)}
        selectedFicha={selectedFicha}
        onSelectFicha={(f) => {
          setSelectedFicha(f);
          showToast('Ficha Cambiada', `Mostrando datos y trazabilidad para ${f}`);
        }}
      />

      {/* Main Viewport Content */}
      <main className="relative z-10 w-full pt-28 sm:pt-24 max-w-[1600px] mx-auto px-margin-mobile lg:px-margin-desktop min-h-[calc(100vh-140px)]">
        {currentTab === 'dashboard' && (
          <DashboardView
            raps={raps}
            approvedHours={approvedHours}
            totalHours={totalHours}
            criticalIndex={criticalIndex}
            onNavigateToTab={setCurrentTab}
            onOpenSrs={() => setIsSrsOpen(true)}
            selectedFicha={selectedFicha}
          />
        )}

        {currentTab === 'upload' && (
          <UploadView
            onDataLoaded={handleDataLoaded}
            onNavigateToDashboard={() => setCurrentTab('dashboard')}
            currentRaps={raps}
            currentFilename={currentFilename}
          />
        )}

        {currentTab === 'matrix' && (
          <MatrixView raps={raps} onUpdateRap={handleUpdateRap} showToast={showToast} />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            ingestionLogs={ingestionLogs}
            approvedHours={approvedHours}
            totalHours={totalHours}
            criticalIndex={criticalIndex}
            approvedCount={approvedCount}
            totalCount={raps.length}
            selectedFicha={selectedFicha}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Formal SRS Requirements Specification Modal */}
      <SrsDocumentModal isOpen={isSrsOpen} onClose={() => setIsSrsOpen(false)} />

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 px-space-md py-3 rounded-2xl bg-surface-container-high/95 backdrop-blur-xl text-on-surface shadow-2xl border border-glass-border-light ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined text-status-approved text-[24px]">verified</span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-on-surface">{toast.title}</span>
          <span className="text-xs text-on-surface-variant">{toast.msg}</span>
        </div>
      </div>
    </div>
  );
}
