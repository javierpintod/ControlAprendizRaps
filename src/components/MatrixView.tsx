import React, { useState, useMemo } from 'react';
import { RAPItem, RAPStatus } from '../types/rap';
import { exportCurrentRapsToExcel } from '../utils/excelParser';
import { AddNoteModal } from './AddNoteModal';

interface MatrixViewProps {
  raps: RAPItem[];
  onUpdateRap: (updatedRap: RAPItem) => void;
  showToast: (title: string, msg: string) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ raps, onUpdateRap, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | RAPStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected RAP for Inspector Drawer
  const [selectedRapId, setSelectedRapId] = useState<string>('RAP-02');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: raps.length,
      Aprobado: raps.filter((r) => r.status === 'Aprobado').length,
      'Por Mejorar': raps.filter((r) => r.status === 'Por Mejorar').length,
      Pendiente: raps.filter((r) => r.status === 'Pendiente').length,
      'No Evaluado': raps.filter((r) => r.status === 'No Evaluado').length,
    };
  }, [raps]);

  // Unique competencies
  const competencies = useMemo(() => {
    const list = Array.from(new Set(raps.map((r) => r.competency)));
    return list;
  }, [raps]);

  // Filtering
  const filteredRaps = useMemo(() => {
    return raps.filter((rap) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        rap.id.toLowerCase().includes(q) ||
        rap.competency.toLowerCase().includes(q) ||
        rap.description.toLowerCase().includes(q) ||
        (rap.code && rap.code.toLowerCase().includes(q)) ||
        rap.evaluator.toLowerCase().includes(q);

      const matchesComp = selectedCompetency === 'all' || rap.competency.toLowerCase() === selectedCompetency.toLowerCase();
      const matchesPhase = selectedPhase === 'all' || rap.phase.toLowerCase() === selectedPhase.toLowerCase();
      const matchesStatus = statusFilter === 'all' || rap.status === statusFilter;

      return matchesQuery && matchesComp && matchesPhase && matchesStatus;
    });
  }, [raps, searchQuery, selectedCompetency, selectedPhase, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRaps.length / pageSize) || 1;
  const paginatedRaps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRaps.slice(start, start + pageSize);
  }, [filteredRaps, currentPage]);

  const selectedRap = useMemo(() => {
    return raps.find((r) => r.id === selectedRapId) || raps[0];
  }, [raps, selectedRapId]);

  const handleExportExcel = () => {
    exportCurrentRapsToExcel(filteredRaps, `EduTrack_Matriz_RAPs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Exportación Exitosa', 'Se descargó el archivo Excel con los resultados filtrados.');
  };

  const handleReEval = () => {
    if (!selectedRap) return;
    const updated: RAPItem = {
      ...selectedRap,
      status: 'Pendiente',
      history: [
        {
          id: `h-reeval-${Date.now()}`,
          title: 'Solicitud de Re-evaluación',
          note: 'El aprendiz ha solicitado formalmente una re-evaluación prioritaria tras corrección de evidencias.',
          date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pendiente',
          author: 'Aprendiz',
        },
        ...selectedRap.history,
      ],
    };
    onUpdateRap(updated);
    showToast('Re-evaluación Solicitada', `${selectedRap.id} ha sido marcado como Pendiente para revisión del evaluador.`);
  };

  const handleSaveNote = (rapId: string, title: string, body: string) => {
    const target = raps.find((r) => r.id === rapId);
    if (!target) return;
    const updated: RAPItem = {
      ...target,
      evaluatorFeedback: body,
      history: [
        {
          id: `h-note-${Date.now()}`,
          title,
          note: body,
          date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          status: target.status,
          author: 'Dra. Carolina Méndez (Líder)',
        },
        ...target.history,
      ],
    };
    onUpdateRap(updated);
    showToast('Observación Guardada', `Nueva nota pedagógica registrada en ${rapId}.`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Control Toolbar */}
      <div className="w-full backdrop-blur-2xl bg-surface-container/60 rounded-2xl shadow-xl p-space-lg mb-space-lg relative overflow-hidden border border-glass-border-light">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/10 blur-[90px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md mb-space-md">
          {/* Universal Search Field */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined text-outline absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-lowest/80 text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:bg-surface-container-low transition-all duration-200 border border-glass-border-light"
              id="searchInput"
              placeholder="Buscar por ID de RAP, competencia o palabra clave..."
              type="text"
            />
          </div>

          {/* Select Dropdowns & Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCompetency}
                onChange={(e) => {
                  setSelectedCompetency(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto h-11 appearance-none pl-3.5 pr-9 rounded-xl bg-surface-container-lowest/80 text-on-surface font-label-md text-label-md cursor-pointer focus:outline-none hover:bg-surface-container-low transition-colors border border-glass-border-light"
                id="competencyFilter"
              >
                <option value="all">Competencia: Todas</option>
                {competencies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-outline absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedPhase}
                onChange={(e) => {
                  setSelectedPhase(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto h-11 appearance-none pl-3.5 pr-9 rounded-xl bg-surface-container-lowest/80 text-on-surface font-label-md text-label-md cursor-pointer focus:outline-none hover:bg-surface-container-low transition-colors border border-glass-border-light"
                id="phaseFilter"
              >
                <option value="all">Fase: Todas</option>
                <option value="Fase 1">Fase 1: Análisis</option>
                <option value="Fase 2">Fase 2: Planeación</option>
                <option value="Fase 3">Fase 3: Ejecución</option>
              </select>
              <span className="material-symbols-outlined text-outline absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleExportExcel}
              className="h-11 px-space-md rounded-xl bg-surface-container-high/70 hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all active:scale-95 border border-glass-border-light cursor-pointer"
              id="exportExcelBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95 cursor-pointer"
              id="toggleDrawerBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">view_sidebar</span>
              <span>{isDrawerOpen ? 'Ocultar Panel' : 'Inspección RAP'}</span>
            </button>
          </div>
        </div>

        {/* Quick Status Filter Chips */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar text-label-md">
          <button
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`filter-chip flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary/25 text-primary-fixed-dim font-semibold border border-primary/40'
                : 'bg-surface-container-lowest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-glass-border-light'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-xs">{statusCounts.all}</span>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Aprobado');
              setCurrentPage(1);
            }}
            className={`filter-chip flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              statusFilter === 'Aprobado'
                ? 'bg-status-approved/25 text-status-approved font-semibold border border-status-approved/50'
                : 'bg-surface-container-lowest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-glass-border-light'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-approved"></span>
            <span>Aprobado</span>
            <span className="px-1.5 py-0.2 rounded-full bg-status-approved/15 text-status-approved text-xs font-semibold">
              {statusCounts.Aprobado}
            </span>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Por Mejorar');
              setCurrentPage(1);
            }}
            className={`filter-chip flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              statusFilter === 'Por Mejorar'
                ? 'bg-status-improve/25 text-status-improve font-semibold border border-status-improve/50'
                : 'bg-surface-container-lowest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-glass-border-light'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-improve animate-pulse"></span>
            <span>Por Mejorar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-status-improve/20 text-status-improve text-xs font-semibold">
              {statusCounts['Por Mejorar']}
            </span>
          </button>

          <button
            onClick={() => {
              setStatusFilter('Pendiente');
              setCurrentPage(1);
            }}
            className={`filter-chip flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              statusFilter === 'Pendiente'
                ? 'bg-status-pending/25 text-status-pending font-semibold border border-status-pending/50'
                : 'bg-surface-container-lowest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-glass-border-light'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-pending"></span>
            <span>Pendiente</span>
            <span className="px-1.5 py-0.2 rounded-full bg-status-pending/20 text-status-pending text-xs font-semibold">
              {statusCounts.Pendiente}
            </span>
          </button>

          <button
            onClick={() => {
              setStatusFilter('No Evaluado');
              setCurrentPage(1);
            }}
            className={`filter-chip flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              statusFilter === 'No Evaluado'
                ? 'bg-status-unevaluated/25 text-status-unevaluated font-semibold border border-status-unevaluated/50'
                : 'bg-surface-container-lowest/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-glass-border-light'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-status-unevaluated"></span>
            <span>No Evaluado</span>
            <span className="px-1.5 py-0.2 rounded-full bg-status-unevaluated/20 text-status-unevaluated text-xs font-semibold">
              {statusCounts['No Evaluado']}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace: Split Screen layout with Table and Drawer */}
      <div className="grid grid-cols-12 gap-space-lg items-start">
        {/* Table Container */}
        <div
          className={`col-span-12 ${
            isDrawerOpen ? 'xl:col-span-8' : 'xl:col-span-12'
          } backdrop-blur-2xl bg-surface-container/50 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 border border-glass-border-light`}
          id="tableWrapper"
        >
          {/* Table Header Bar */}
          <div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container-high/40 border-b border-glass-border-light">
            <div className="flex items-center gap-space-sm">
              <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
              <span className="font-headline-sm text-headline-sm text-on-surface">Matriz Curricular de Aprendizajes</span>
              <span className="text-label-sm font-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-secondary/20">
                Plan ADSO 2026
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-body-sm font-body-sm text-outline hidden sm:inline">Resultados activos:</span>
              <span className="text-label-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                {filteredRaps.length} visibles
              </span>
            </div>
          </div>

          {/* Glass Data Table */}
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest/90 font-label-md text-label-md text-on-surface-variant tracking-wider uppercase select-none border-b border-glass-border-light">
                  <th className="py-3.5 px-4 font-semibold text-outline">ID RAP</th>
                  <th className="py-3.5 px-4 font-semibold text-outline">Competencia / Módulo</th>
                  <th className="py-3.5 px-4 font-semibold text-outline">Descripción del Resultado</th>
                  <th className="py-3.5 px-3 font-semibold text-outline text-center">Horas</th>
                  <th className="py-3.5 px-4 font-semibold text-outline">Estado</th>
                  <th className="py-3.5 px-3 font-semibold text-outline text-right">Evaluación</th>
                  <th className="py-3.5 px-4 font-semibold text-outline text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-glass-border-light/40">
                {paginatedRaps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-outline">
                      No se encontraron resultados de aprendizaje que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedRaps.map((rap) => {
                    const isSelected = selectedRapId === rap.id;
                    return (
                      <tr
                        key={rap.id}
                        onClick={() => {
                          setSelectedRapId(rap.id);
                          if (!isDrawerOpen) setIsDrawerOpen(true);
                        }}
                        className={`rap-row group cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-status-improve/10 ring-1 ring-status-improve/40'
                            : 'bg-surface-container-lowest/20 hover:bg-surface-container-high/50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-mono font-bold ${
                              rap.status === 'Aprobado'
                                ? 'bg-status-approved/15 text-status-approved'
                                : rap.status === 'Por Mejorar'
                                ? 'bg-status-improve/20 text-status-improve'
                                : rap.status === 'Pendiente'
                                ? 'bg-status-pending/20 text-status-pending'
                                : 'bg-surface-container-highest text-on-surface-variant'
                            }`}
                          >
                            {rap.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface font-medium whitespace-nowrap">
                          <span>{rap.competency}</span>
                          <span className="block text-xs text-outline font-normal">{rap.phase}</span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-[280px]">
                          <p
                            className="truncate group-hover:text-on-surface transition-colors font-normal text-sm"
                            title={rap.description}
                          >
                            {rap.description}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 text-center text-on-surface font-mono font-medium">{rap.hours}h</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${
                              rap.status === 'Aprobado'
                                ? 'bg-status-approved/10 text-status-approved border-status-approved/30'
                                : rap.status === 'Por Mejorar'
                                ? 'bg-status-improve/15 text-status-improve border-status-improve/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                : rap.status === 'Pendiente'
                                ? 'bg-status-pending/10 text-status-pending border-status-pending/30'
                                : 'bg-status-unevaluated/10 text-status-unevaluated border-status-unevaluated/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                rap.status === 'Aprobado'
                                  ? 'bg-status-approved'
                                  : rap.status === 'Por Mejorar'
                                  ? 'bg-status-improve animate-ping'
                                  : rap.status === 'Pendiente'
                                  ? 'bg-status-pending'
                                  : 'bg-status-unevaluated'
                              }`}
                            ></span>
                            {rap.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-outline text-xs whitespace-nowrap font-mono">
                          {rap.evaluationDate || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRapId(rap.id);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                            title="Ver Detalle"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination Controls */}
          <div className="px-space-lg py-space-md bg-surface-container-lowest/70 flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-glass-border-light">
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
              <span>Mostrando</span>
              <span className="font-semibold text-on-surface font-mono">
                {filteredRaps.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredRaps.length)}
              </span>
              <span>de</span>
              <span className="font-semibold text-on-surface font-mono">{filteredRaps.length}</span>
              <span>Resultados totales</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg bg-surface-container-high/60 text-outline hover:text-on-surface hover:bg-surface-container-highest flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-high/60 text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg bg-surface-container-high/60 text-outline hover:text-on-surface hover:bg-surface-container-highest flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Drawer / Inspector Panel (RAP Detail) */}
        {isDrawerOpen && selectedRap && (
          <div
            className="col-span-12 xl:col-span-4 backdrop-blur-2xl bg-surface-container/70 rounded-2xl shadow-2xl p-space-lg flex flex-col relative overflow-hidden transition-all duration-300 border border-glass-border-light"
            id="inspectorDrawer"
          >
            {/* Top Glow Accent for Priority Status */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-status-improve/20 blur-[80px] pointer-events-none"></div>

            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-space-sm pb-space-md border-b border-glass-border-light">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      selectedRap.status === 'Por Mejorar'
                        ? 'bg-status-improve/20 text-status-improve'
                        : selectedRap.status === 'Aprobado'
                        ? 'bg-status-approved/20 text-status-approved'
                        : 'bg-status-pending/20 text-status-pending'
                    }`}
                  >
                    {selectedRap.status === 'Por Mejorar' ? 'Alerta Curricular' : 'Estado Formativo'}
                  </span>
                  <span className="text-xs text-outline font-mono">
                    {selectedRap.evaluationDate || 'En proceso'}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Inspección de RAP</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                id="closeDrawerBtn"
                title="Cerrar panel"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Main Detail Card */}
            <div className="rounded-xl bg-surface-container-lowest/80 p-space-md my-space-md shadow-inner border border-glass-border-light">
              <div className="flex items-center justify-between mb-3">
                <span className="font-metric-display text-[26px] leading-tight font-extrabold text-on-surface">
                  {selectedRap.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${
                    selectedRap.status === 'Aprobado'
                      ? 'bg-status-approved/20 text-status-approved border-status-approved/40'
                      : selectedRap.status === 'Por Mejorar'
                      ? 'bg-status-improve/20 text-status-improve border-status-improve/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-status-pending/20 text-status-pending border-status-pending/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedRap.status === 'Por Mejorar' ? 'bg-status-improve animate-ping' : 'bg-status-approved'
                    }`}
                  ></span>
                  {selectedRap.status} {selectedRap.status === 'Por Mejorar' && '(Crítico)'}
                </span>
              </div>

              <p className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-sm leading-snug">
                {selectedRap.description}
              </p>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm">
                Diseño e integración de componentes modulares con arquitectura de estados compartidos y validación de renderizado eficiente en cliente.
              </p>

              {/* Metadata Chips */}
              <div className="grid grid-cols-3 gap-2 mt-space-md pt-space-sm bg-surface-container-high/40 rounded-lg p-2.5 border border-glass-border-light">
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Módulo</span>
                  <span className="text-xs text-on-surface font-semibold truncate">{selectedRap.competency}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Fase</span>
                  <span className="text-xs text-on-surface font-semibold">{selectedRap.phase}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Carga</span>
                  <span className="text-xs text-secondary font-semibold font-mono">{selectedRap.hours} Horas</span>
                </div>
              </div>
            </div>

            {/* Evaluator Feedback Callout */}
            <div className="rounded-xl bg-surface-container-high/50 p-space-md mb-space-md border border-glass-border-light">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-status-improve text-[20px]">feedback</span>
                <span className="text-xs font-semibold text-on-surface">Observación del Evaluador</span>
              </div>
              <p className="text-xs text-on-surface-variant italic leading-relaxed pl-3 bg-surface-container-lowest/40 py-2 rounded-r-lg border-l-2 border-status-improve">
                "{selectedRap.evaluatorFeedback ||
                  'La evidencia entregada requiere ajustar el manejo de estado reactivo y separación de responsabilidades en los controladores del front-end. Falta cobertura de casos borde.'}"
              </p>
              <div className="flex items-center justify-between mt-2.5 text-[11px] text-outline">
                <span className="font-medium text-on-surface-variant">{selectedRap.evaluator}</span>
                <span>{selectedRap.evaluationDate || '10-04-2026 • 16:42'}</span>
              </div>
            </div>

            {/* Execution Progress and Timeline Tracker */}
            <div className="flex-1 flex flex-col mb-space-md">
              <span className="text-xs font-semibold text-on-surface mb-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-outline">history</span>
                Historial de Intentos y Evidencias
              </span>
              <div className="space-y-3 relative pl-4 bg-surface-container-lowest/30 p-3 rounded-xl border border-glass-border-light">
                {selectedRap.history && selectedRap.history.length > 0 ? (
                  selectedRap.history.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          hist.status === 'Por Mejorar'
                            ? 'bg-status-improve ring-4 ring-status-improve/20'
                            : hist.status === 'Aprobado'
                            ? 'bg-status-approved ring-4 ring-status-approved/20'
                            : 'bg-outline'
                        }`}
                      ></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-on-surface">{hist.title}</span>
                        <span className="text-[11px] text-on-surface-variant leading-tight">{hist.note}</span>
                        <span className="text-[10px] text-outline mt-0.5 font-mono">{hist.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-approved mt-1 shrink-0"></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-on-surface">Envío de Evidencia Registrado</span>
                      <span className="text-[11px] text-outline">Verificado por el instructor titular.</span>
                      <span className="text-[10px] text-outline mt-0.5 font-mono">15 Abr 2026 - 10:15</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Interactive Actions */}
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs border-t border-glass-border-light">
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="h-11 px-3 rounded-xl bg-surface-container-high/80 hover:bg-surface-container-high text-on-surface text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border border-glass-border-light"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_comment</span>
                <span className="truncate">Nueva Nota</span>
              </button>

              <button
                onClick={handleReEval}
                className="h-11 px-3 rounded-xl bg-status-improve text-canvas-base hover:brightness-110 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-status-improve/25 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span className="truncate">Solicitar Re-eval...</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note modal */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        rap={selectedRap}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
};
