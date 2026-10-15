import React from 'react';
import { RAPItem } from '../types/rap';

interface DashboardViewProps {
  raps: RAPItem[];
  approvedHours: number;
  totalHours: number;
  criticalIndex: number;
  onNavigateToTab: (tab: 'dashboard' | 'upload' | 'matrix' | 'reports') => void;
  onOpenSrs: () => void;
  selectedFicha: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  raps,
  approvedHours,
  totalHours,
  criticalIndex,
  onNavigateToTab,
  onOpenSrs,
  selectedFicha,
}) => {
  const approvedCount = raps.filter((r) => r.status === 'Aprobado').length;
  const improveCount = raps.filter((r) => r.status === 'Por Mejorar').length;
  const pendingCount = raps.filter((r) => r.status === 'Pendiente').length;
  const unevaluatedCount = raps.filter((r) => r.status === 'No Evaluado').length;
  const totalCount = raps.length;

  const weightedPercent = Number(((approvedHours / totalHours) * 100).toFixed(1));

  // Module breakdowns
  const modules = [
    {
      name: 'Desarrollo Web',
      code: 'MOD-ADSO-01',
      total: 18,
      approved: 18,
      percent: 100,
      hours: '420 h',
      instructor: 'Ing. Roberto Torres',
      status: '100% Verificado',
      statusColor: 'text-status-approved',
      bgBar: 'bg-status-approved',
    },
    {
      name: 'Bases de Datos Relacionales',
      code: 'MOD-ADSO-02',
      total: 20,
      approved: 17,
      percent: 85,
      hours: '400 h',
      instructor: 'Mg. Sandra Salazar',
      status: '2 RAPs en Observación',
      statusColor: 'text-status-improve',
      bgBar: 'bg-status-improve',
    },
    {
      name: 'Inglés Técnico Profesional',
      code: 'MOD-TRANS-03',
      total: 10,
      approved: 9,
      percent: 90,
      hours: '300 h',
      instructor: 'Lic. David Miller',
      status: '1 RAP Pendiente',
      statusColor: 'text-secondary',
      bgBar: 'bg-secondary',
    },
  ];

  // Critical RAPs
  const criticalRaps = raps.filter((r) => r.status === 'Por Mejorar');

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Hero Welcome & Quick Summary Banner */}
      <section className="relative rounded-3xl bg-surface-container/60 backdrop-blur-xl p-space-lg sm:p-space-xl border border-glass-border-light shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/15 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wider border border-secondary/25">
                Seguimiento de Formación Curricular
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs text-on-surface-variant font-mono">{selectedFicha}</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">
              Panel de Avance y Resultados de Aprendizaje
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Consolidación en tiempo real del juicio formativo para la cohorte técnica de Análisis y Desarrollo de Software. Analítica de ponderación horaria, detección temprana de rezagos y auditoría curricular certificada.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm shrink-0">
            <button
              onClick={() => onNavigateToTab('upload')}
              className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-container/25 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Cargar Corte Excel</span>
            </button>
            <button
              onClick={onOpenSrs}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-all border border-glass-border-light flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
              <span>Ver Requerimientos SRS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Strip (4 Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1 */}
        <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Eficiencia por Horas</span>
            <span className="p-1 rounded-lg bg-secondary/15 text-secondary">
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">{approvedHours}</span>
            <span className="text-base text-outline font-semibold">/ {totalHours} h</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface-variant">Avance ponderado</span>
            <span className="text-secondary font-bold font-mono">{weightedPercent}%</span>
          </div>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-secondary-container to-secondary h-full rounded-full" style={{ width: `${weightedPercent}%` }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Índice RAPs Críticos (Ic)</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-approved/15 text-status-approved text-xs font-semibold border border-status-approved/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-approved animate-pulse"></span>
              Bajo Riesgo
            </span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">{criticalIndex}%</span>
            <span className="text-xs text-status-approved font-medium flex items-center">
              <span className="material-symbols-outlined text-[16px]">trending_down</span> -2.4%
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {improveCount} RAPs en observación técnica que demandan nivelación.
          </p>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden mt-space-md">
            <div className="bg-status-approved h-full rounded-full" style={{ width: `${criticalIndex}%` }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Velocidad de Superación</span>
            <span className="p-1 rounded-lg bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">4.2</span>
            <span className="text-xs text-on-surface-variant font-medium">RAPs / sem</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            +0.8 RAPs sobre el cronograma teórico estipulado.
          </p>
          <div className="flex items-center gap-1 mt-space-md">
            <div className="h-2 w-full bg-primary/20 rounded-sm overflow-hidden">
              <div className="bg-primary h-full w-[85%] rounded-sm"></div>
            </div>
            <span className="text-xs text-primary font-bold">105%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Cobertura Curricular</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-xs text-on-surface font-semibold border border-glass-border-light">
              {totalCount - unevaluatedCount} / {totalCount} RAPs
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">
              {(((totalCount - unevaluatedCount) / totalCount) * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-outline font-medium">Evaluado</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {unevaluatedCount} RAPs permanecen en estado No Evaluado.
          </p>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden mt-space-md">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              style={{ width: `${((totalCount - unevaluatedCount) / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Visual Analytics Split Section: Status Ring & Module Breakdowns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Overall Circular Progress & Status Chips */}
        <div className="lg:col-span-5 rounded-3xl bg-surface-container/60 backdrop-blur-xl p-space-lg sm:p-space-xl shadow-xl border border-glass-border-light flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">donut_large</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Distribución por Estado</h2>
              </div>
              <span className="text-xs text-outline font-mono">{totalCount} RAPs Totales</span>
            </div>

            {/* Circular Ring Gauge */}
            <div className="flex items-center justify-center py-space-md">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="9" />
                  {/* Segment: Aprobado ~75% */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="#10B981"
                    strokeDasharray="251.32"
                    strokeDashoffset={251.32 * (1 - 0.75)}
                    strokeLinecap="round"
                    strokeWidth="9"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-metric-display text-[38px] font-extrabold text-on-surface leading-none">
                    {weightedPercent}%
                  </span>
                  <span className="text-[11px] text-outline uppercase tracking-wider mt-1 font-semibold">
                    Cumplimiento
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Chips Breakdown */}
            <div className="grid grid-cols-2 gap-space-sm pt-space-sm">
              <div className="p-3 rounded-xl bg-status-approved/10 border border-status-approved/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-approved"></span>
                  <span className="text-xs text-on-surface font-semibold">Aprobados</span>
                </div>
                <span className="text-sm font-bold text-status-approved font-mono">{approvedCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-status-improve/10 border border-status-improve/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-improve"></span>
                  <span className="text-xs text-on-surface font-semibold">Por Mejorar</span>
                </div>
                <span className="text-sm font-bold text-status-improve font-mono">{improveCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-status-pending/10 border border-status-pending/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-pending"></span>
                  <span className="text-xs text-on-surface font-semibold">Pendientes</span>
                </div>
                <span className="text-sm font-bold text-status-pending font-mono">{pendingCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-glass-border-light flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-unevaluated"></span>
                  <span className="text-xs text-on-surface font-semibold">No Evaluados</span>
                </div>
                <span className="text-sm font-bold text-status-unevaluated font-mono">{unevaluatedCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-sm border-t border-glass-border-light flex items-center justify-between text-xs text-outline">
            <span>Cálculo ponderado por 1.120 horas</span>
            <button
              onClick={() => onNavigateToTab('matrix')}
              className="text-secondary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver Matriz Completa <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Module Progression Breakdown */}
        <div className="lg:col-span-7 rounded-3xl bg-surface-container/60 backdrop-blur-xl p-space-lg sm:p-space-xl shadow-xl border border-glass-border-light flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">account_tree</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Avance por Módulos y Asignaturas</h2>
              </div>
              <span className="text-xs text-outline font-semibold">3 Módulos Activos</span>
            </div>

            <div className="space-y-space-md">
              {modules.map((mod) => (
                <div
                  key={mod.code}
                  className="p-space-md rounded-2xl bg-surface-container-high/40 border border-glass-border-light hover:bg-surface-container-high/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-outline font-mono font-semibold">{mod.code}</span>
                        <span className="text-xs text-outline">•</span>
                        <span className="text-xs text-secondary font-mono">{mod.hours}</span>
                      </div>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface mt-0.5">{mod.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${mod.statusColor}`}>{mod.status}</span>
                      <span className="text-sm font-bold text-on-surface font-mono">{mod.percent}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden mb-2">
                    <div className={`${mod.bgBar} h-full rounded-full`} style={{ width: `${mod.percent}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      Docente: <strong className="text-on-surface">{mod.instructor}</strong>
                    </span>
                    <span className="font-mono text-outline">
                      {mod.approved} / {mod.total} RAPs superados
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts Strip */}
          {criticalRaps.length > 0 && (
            <div className="mt-space-md p-space-sm rounded-xl bg-status-improve/10 border border-status-improve/30 flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-improve text-[20px]">warning</span>
                <span className="text-xs text-on-surface">
                  <strong>{criticalRaps.length} RAPs en Alerta Técnica:</strong> Requieren atención inmediata para mantener la certificación en fecha.
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('matrix')}
                className="px-3 py-1 rounded-lg bg-status-improve text-canvas-base text-xs font-bold hover:brightness-110 transition-all shrink-0 cursor-pointer"
              >
                Auditar RAPs
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
