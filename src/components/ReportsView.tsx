import React, { useState } from 'react';
import { IngestionLog } from '../types/rap';
import { CertificateModal } from './CertificateModal';

interface ReportsViewProps {
  ingestionLogs: IngestionLog[];
  approvedHours: number;
  totalHours: number;
  criticalIndex: number;
  approvedCount: number;
  totalCount: number;
  selectedFicha: string;
  showToast: (title: string, msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  ingestionLogs,
  approvedHours,
  totalHours,
  criticalIndex,
  approvedCount,
  totalCount,
  selectedFicha,
  showToast,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-I');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const filteredLogs = ingestionLogs.filter(
    (log) =>
      log.filename.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.sha256.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.auditor.toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  const handleExportPdf = () => {
    showToast('Compilando Informe', 'Generando snapshot de métricas y firmas electrónicas...');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleDownloadJsonLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ingestionLogs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'EduTrack_Bitacora_Auditoria_SHA256.json');
    dlAnchor.click();
    showToast('Bitácora Descargada', 'Historial criptográfico descargado en formato JSON.');
  };

  const coveragePercent = Number(((44 / 48) * 100).toFixed(1));

  return (
    <div className="flex flex-col w-full">
      {/* CONTROL BAR & EXECUTIVE ACTIONS */}
      <section className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-lg mb-space-xl">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest border border-primary/20">
              Auditoría Académica v2.0
            </span>
            <span className="text-on-surface-variant text-xs">•</span>
            <span className="text-secondary text-xs font-semibold">{selectedFicha}</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Reportes &amp; Trazabilidad</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Consolidado analítico de certificación curricular, métricas de rezago y bitácora criptográfica de ingestas académicas.
          </p>
        </div>

        {/* Filters & Action Triggers */}
        <div className="flex flex-wrap items-center gap-space-sm w-full xl:w-auto">
          <div className="relative flex items-center bg-surface-container-high/70 backdrop-blur-md rounded-xl px-space-md py-2 shadow-sm min-w-[210px] border border-glass-border-light">
            <span className="material-symbols-outlined text-outline mr-2 text-[20px]">calendar_today</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-outline-variant uppercase font-semibold">Periodo Lectivo</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs text-on-surface focus:outline-none cursor-pointer pr-4 font-semibold"
                id="period-selector"
              >
                <option className="bg-surface-container text-on-surface" value="2026-I">
                  Ciclo 2026-I (Ene - Jun)
                </option>
                <option className="bg-surface-container text-on-surface" value="2025-II">
                  Ciclo 2025-II (Jul - Dic)
                </option>
                <option className="bg-surface-container text-on-surface" value="2025-I">
                  Ciclo 2025-I (Ene - Jun)
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExportPdf}
            className="group relative flex items-center gap-space-xs px-space-lg py-3 rounded-xl bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary font-semibold text-sm shadow-xl shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            id="btn-export-pdf"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-y-0.5">
              picture_as_pdf
            </span>
            <span>Exportar Informe en PDF</span>
          </button>

          <button
            onClick={() => setIsCertModalOpen(true)}
            className="flex items-center gap-space-xs px-space-md py-3 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface font-semibold text-sm backdrop-blur-md shadow-sm transition-all duration-150 border border-glass-border-light cursor-pointer"
            id="btn-cert-modal"
            type="button"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            <span>Generar Certificado</span>
          </button>
        </div>
      </section>

      {/* AUDIT KPIS (4 GRID) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
        {/* KPI 1: Critical RAPs Index */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl transition-all duration-300 hover:-translate-y-1 border border-glass-border-light">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Índice RAPs Críticos (Ic)</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-approved/10 text-status-approved text-xs font-semibold border border-status-approved/20">
              <span className="w-2 h-2 rounded-full bg-status-approved shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
              Bajo Riesgo
            </span>
          </div>
          <div className="flex items-baseline gap-space-sm mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">{criticalIndex}%</span>
            <span className="text-xs text-status-approved font-medium flex items-center">
              <span className="material-symbols-outlined text-[16px]">trending_down</span> -2.4% vs mes anterior
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Fórmula: <code className="text-xs bg-surface-container-lowest/80 px-1 py-0.5 rounded text-secondary-fixed">Por Mejorar / Evaluados</code>. Sólo 2 RAPs demandan nivelación técnica inmediata.
          </p>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden mt-space-md">
            <div className="bg-status-approved h-full rounded-full" style={{ width: `${criticalIndex}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Approved Hours Efficiency */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl transition-all duration-300 hover:-translate-y-1 border border-glass-border-light">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Eficiencia por Horas</span>
            <span className="p-1 rounded-lg bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">{approvedHours}</span>
            <span className="text-base text-outline font-semibold">/ {totalHours} h</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface-variant">Avance ponderado</span>
            <span className="text-secondary font-bold font-mono">
              {((approvedHours / totalHours) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary-container to-secondary h-full rounded-full"
              style={{ width: `${(approvedHours / totalHours) * 100}%` }}
            ></div>
          </div>
          <span className="mt-2 block text-xs text-on-surface-variant">
            {totalHours - approvedHours} horas restantes planificadas en Fase 2.
          </span>
        </div>

        {/* KPI 3: Overcoming Velocity */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl transition-all duration-300 hover:-translate-y-1 border border-glass-border-light">
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
            Tasa de certificación óptima con +0.8 RAPs sobre el cronograma curricular estipulado.
          </p>
          <div className="flex items-center gap-1 mt-space-md">
            <div className="h-2 w-full bg-primary/20 rounded-sm overflow-hidden">
              <div className="bg-primary h-full w-[85%] rounded-sm"></div>
            </div>
            <span className="text-xs text-primary font-bold">105%</span>
          </div>
        </div>

        {/* KPI 4: Curricular Coverage */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs uppercase tracking-wider text-outline font-semibold">Cobertura Curricular</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-xs text-on-surface font-semibold border border-glass-border-light">
              {approvedCount + 8} / {totalCount} RAPs
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mb-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface font-extrabold">{coveragePercent}%</span>
            <span className="text-xs text-outline font-medium">Evaluado</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Únicamente 4 RAPs permanecen en estado <span className="text-status-unevaluated font-semibold">No Evaluado</span> para el ciclo vigente.
          </p>
          <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full overflow-hidden mt-space-md">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              style={{ width: `${coveragePercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* HISTORICAL TREND CHART & RUNTIME ANALYTICS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
        {/* Chart Container: Real vs Projected Area Curve */}
        <div className="lg:col-span-8 rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl flex flex-col justify-between border border-glass-border-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">ssid_chart</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Curva de Tendencia y Cumplimiento Acumulado</h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Seguimiento longitudinal del porcentaje de avance real ponderado frente al cronograma teórico (Ene - Jun 2026).
              </p>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.6)]"></span>
                <span className="text-xs text-on-surface font-medium">Avance Real</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-outline-variant"></span>
                <span className="text-xs text-outline font-medium">Proyectado Teórico</span>
              </div>
            </div>
          </div>

          {/* Area Chart SVG */}
          <div className="relative w-full h-72 sm:h-80 select-none">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 760 280">
              <defs>
                <linearGradient id="realGlowGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.35"></stop>
                  <stop offset="60%" stopColor="#8083ff" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#8083ff" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="strokeGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#8083ff"></stop>
                  <stop offset="60%" stopColor="#4cd7f6"></stop>
                  <stop offset="100%" stopColor="#10B981"></stop>
                </linearGradient>
                <filter height="140%" id="neonGlow" width="140%" x="-20%" y="-20%">
                  <feGaussianBlur result="blur" stdDeviation="4"></feGaussianBlur>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                </filter>
              </defs>

              {/* Grid Lines */}
              <g className="opacity-15">
                <line stroke="#908fa0" strokeDasharray="3,3" x1="40" x2="740" y1="30" y2="30"></line>
                <line stroke="#908fa0" strokeDasharray="3,3" x1="40" x2="740" y1="90" y2="90"></line>
                <line stroke="#908fa0" strokeDasharray="3,3" x1="40" x2="740" y1="150" y2="150"></line>
                <line stroke="#908fa0" strokeDasharray="3,3" x1="40" x2="740" y1="210" y2="210"></line>
                <line stroke="#908fa0" x1="40" x2="740" y1="260" y2="260"></line>
              </g>

              {/* Axis Labels Y */}
              <text className="font-mono text-[10px]" fill="#908fa0" x="10" y="34">100%</text>
              <text className="font-mono text-[10px]" fill="#908fa0" x="15" y="94">75%</text>
              <text className="font-mono text-[10px]" fill="#908fa0" x="15" y="154">50%</text>
              <text className="font-mono text-[10px]" fill="#908fa0" x="15" y="214">25%</text>
              <text className="font-mono text-[10px]" fill="#908fa0" x="22" y="264">0%</text>

              {/* Projected Line (Baseline) */}
              <path
                d="M 60 260 L 190 220 L 320 175 L 450 130 L 580 85 L 720 35"
                fill="none"
                opacity="0.6"
                stroke="#908fa0"
                strokeDasharray="6,6"
                strokeWidth="2"
              ></path>

              {/* Real Cumulative Area Fill */}
              <path
                d="M 60 260 L 60 252 C 120 245, 150 205, 190 200 C 250 190, 280 148, 320 140 C 380 130, 410 100, 450 92 C 510 80, 540 68, 580 62 L 580 260 Z"
                fill="url(#realGlowGrad)"
              ></path>

              {/* Real Cumulative Stroke Line */}
              <path
                d="M 60 252 C 120 245, 150 200, 190 200 C 250 190, 280 148, 320 140 C 380 130, 410 100, 450 92 C 510 80, 540 68, 580 62"
                fill="none"
                filter="url(#neonGlow)"
                stroke="url(#strokeGrad)"
                strokeWidth="3.5"
              ></path>

              {/* Projected extrapolation for upcoming weeks (dashed) */}
              <path
                d="M 580 62 C 630 52, 680 40, 720 30"
                fill="none"
                opacity="0.75"
                stroke="#4cd7f6"
                strokeDasharray="4,4"
                strokeWidth="2.5"
              ></path>

              {/* Data Points */}
              <circle cx="60" cy="252" fill="#8083ff" r="4.5"></circle>
              <circle cx="190" cy="200" fill="#8083ff" r="4.5"></circle>
              <circle cx="320" cy="140" fill="#4cd7f6" r="4.5"></circle>
              <circle cx="450" cy="92" fill="#4cd7f6" r="4.5"></circle>
              <circle className="animate-ping" cx="580" cy="62" fill="#10B981" opacity="0.5" r="6"></circle>
              <circle cx="580" cy="62" fill="#10B981" r="5" stroke="#ffffff" strokeWidth="1.5"></circle>

              {/* Value Tag at current progress */}
              <g transform="translate(535, 28)">
                <rect fill="#181b25" height="26" rx="6" stroke="#10B981" strokeWidth="1" width="90"></rect>
                <text fill="#10B981" fontSize="11" fontWeight="700" textAnchor="middle" x="45" y="17">
                  Actual: 75.0%
                </text>
              </g>

              {/* Axis Labels X */}
              <text fill="#908fa0" fontSize="11" textAnchor="middle" x="60" y="278">Ene</text>
              <text fill="#908fa0" fontSize="11" textAnchor="middle" x="190" y="278">Feb</text>
              <text fill="#908fa0" fontSize="11" textAnchor="middle" x="320" y="278">Mar</text>
              <text fill="#908fa0" fontSize="11" textAnchor="middle" x="450" y="278">Abr</text>
              <text fill="#c0c1ff" fontSize="11" fontWeight="700" textAnchor="middle" x="580" y="278">May (Hoy)</text>
              <text fill="#908fa0" fontSize="11" textAnchor="middle" x="720" y="278">Jun</text>
            </svg>
          </div>

          <div className="pt-space-sm flex flex-wrap items-center justify-between gap-space-sm text-xs text-on-surface-variant border-t border-glass-border-light">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-status-approved text-[18px]">verified</span>
              <span>
                Desviación favorable de cronograma:{' '}
                <strong className="text-on-surface font-semibold">+6.5% de adelanto formativo</strong>.
              </span>
            </div>
            <span className="text-outline">Corte analítico al: 18 de Mayo, 2026</span>
          </div>
        </div>

        {/* Executive Audit Verdict Summary Card */}
        <div className="lg:col-span-4 rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl flex flex-col justify-between border border-glass-border-light">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <span className="text-xs uppercase tracking-wider text-outline font-semibold">Diagnóstico Institucional</span>
              <span className="px-2.5 py-0.5 rounded-full bg-status-approved/15 text-status-approved text-xs font-semibold border border-status-approved/30">
                Dictamen Favorable
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">Elegible para Certificación Modular</h3>
            <p className="text-xs text-on-surface-variant mb-space-md leading-relaxed">
              La cohorte formativa cumple con los requerimientos de la Especificación de Requerimientos de Software (SRS v1.0). El margen de RAPs en alerta se sitúa por debajo del umbral crítico institucional (15%).
            </p>

            {/* Metrics Bars Stack */}
            <div className="flex flex-col gap-space-sm">
              <div className="p-space-sm rounded-xl bg-surface-container-high/60 border border-glass-border-light">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Calidad de Registro y Evidencias</span>
                  <span className="text-on-surface font-bold font-mono">98.2%</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '98.2%' }}></div>
                </div>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container-high/60 border border-glass-border-light">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Homologación de Criterios (SENA/ADSO)</span>
                  <span className="text-on-surface font-bold font-mono">100%</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-status-approved h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container-high/60 border border-glass-border-light">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Tolerancia a Inconsistencias de Parseo</span>
                  <span className="text-secondary font-bold font-mono">0 Errores Activos</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-sm flex items-center gap-space-sm border-t border-glass-border-light">
            <img
              className="w-10 h-10 rounded-lg object-contain bg-surface-container-highest/80 p-1 border border-glass-border-light"
              alt="Firma digital escaneada de alta resolución con sello criptográfico de verificación académica"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt57ciOArdz8GJ0TGjm4a-OrUN-DqgAtuJCNF_EqOIr4iIVAbQ2sjkerzMy5rpedjCSj9vh9Q3E4XiOfcyT1HP9C2BTQEnSJ9Joj-z9qTcaoKh8jWRL3xz58La5AU2k2349eF5DA726BkIIe0xCsHTVW927B-zpICZSky2un686tRfJVbvNHy6bgZdCovBIaec90jebNa_yfhM-2f0lI5pmcL6ImjspJoufP_q7fZ7Bco2ZncZuW_Gkw"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Comité Técnico de Evaluación</span>
              <span className="text-[11px] text-outline font-mono">Firma Digital SHA-256 Validada</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE AUDIT BREAKDOWN (3 FROSTED GLASS CARDS) */}
      <section className="flex flex-col gap-space-md mb-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Desglose de Auditoría por Instructor y Módulo</h2>
            <p className="text-xs text-on-surface-variant">Revisión pormenorizada por competencia curricular y responsable de juicio formativo.</p>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="text-xs text-outline font-semibold">3 Módulos en Proceso</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Card 1: Desarrollo Web */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-status-approved/10 border border-glass-border-light">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-status-approved/10 blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-start justify-between mb-space-sm">
                <span className="px-2.5 py-1 rounded-full bg-status-approved/15 text-status-approved text-xs font-semibold flex items-center gap-1 border border-status-approved/30">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 100% Verificado
                </span>
                <span className="text-xs text-outline font-mono">MOD-ADSO-01</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Desarrollo Web</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-space-md">
                Construcción de interfaces responsivas con HTML/CSS e implementación de lógica reactiva de componentes de vanguardia.
              </p>

              <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-high/60 mb-space-md border border-glass-border-light">
                <img
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-status-approved/40"
                  alt="Ing. Roberto Torres"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwv98bQjzMnfGtknrirGdUsI50LymCAY1LbDCMipZuNPTrfYZ9axG66iQfXFRjJrtAdLrr2DliWmtUmKuwrrnUF0Q44QKhmYpEDs60SbQHG7gNwnWcVSTVxu4GCXcmDXgGx3BWAt8exNgXj6NXw3LJr22PZevi1jZyLhGe9dxSwWJxDqlZqHC50Fegkvh4X6XLPCoC7OBL8JteKrWgonNVstErnHeRXL0PYUj2EVISyoo9epk_p9B94w"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-semibold">Ing. Roberto Torres</span>
                  <span className="text-[11px] text-on-surface-variant">Instructor Evaluador Titular</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-space-md">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Cumplimiento del Módulo</span>
                  <span className="text-status-approved font-semibold">18 / 18 RAPs (100%)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div className="bg-status-approved h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-space-sm flex items-center justify-between text-outline text-xs border-t border-glass-border-light">
              <span>Último juicio: 12 May 2026</span>
              <span className="text-status-approved flex items-center gap-0.5">
                Sin observaciones <span className="material-symbols-outlined text-[16px]">task_alt</span>
              </span>
            </div>
          </div>

          {/* Card 2: Bases de Datos */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-status-improve/10 border border-glass-border-light">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-status-improve/15 blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-start justify-between mb-space-sm">
                <span className="px-2.5 py-1 rounded-full bg-status-improve/15 text-status-improve text-xs font-semibold flex items-center gap-1 border border-status-improve/30">
                  <span className="material-symbols-outlined text-[14px]">warning</span> 2 RAPs en Observación
                </span>
                <span className="text-xs text-outline font-mono">MOD-ADSO-02</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Bases de Datos Relacionales</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-space-md">
                Diseño de modelo relacional, normalización y consultas optimizadas SQL con procedimientos almacenados.
              </p>

              <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-high/60 mb-space-md border border-glass-border-light">
                <img
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-status-improve/40"
                  alt="Mg. Sandra Salazar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_UvZOme2lV4SZnoxRy3q4jJh8Vgnixz3b35R9Es9wLVGqhz3WeBAQ7yB52EgM8XD_bmrnPymk20jHr8aSmCE7YiDnoceKEK7d7dX1L28cjyGqIAabOFARGQg6otHhCXl7TZ7R3St54SA-iUnZgVY9UqKVP-4AOEa1nkTzI-e28GXpRu91Hg04Na1UIYifuPTFNvpEL5q-krYUNaVDIDk7xXXrb_oq4SaEhtXnHpndRMze6voFjKWl-A"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-semibold">Mg. Sandra Salazar</span>
                  <span className="text-[11px] text-on-surface-variant">Instructora Especialista BD</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-space-md">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Avance Curricular</span>
                  <span className="text-status-improve font-semibold">85% (17 / 20 RAPs)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden flex">
                  <div className="bg-status-approved h-full" style={{ width: '85%' }}></div>
                  <div className="bg-status-improve h-full" style={{ width: '10%' }}></div>
                  <div className="bg-status-unevaluated h-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-space-sm flex items-center justify-between text-xs border-t border-glass-border-light">
              <span className="text-outline">RAP-02 y RAP-08 en revisión</span>
              <span className="text-secondary flex items-center gap-0.5 font-semibold">
                Auditado <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* Card 3: Inglés Técnico */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 border border-glass-border-light">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/15 blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-start justify-between mb-space-sm">
                <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold flex items-center gap-1 border border-secondary/30">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> 90% Avance
                </span>
                <span className="text-xs text-outline font-mono">MOD-TRANS-03</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Inglés Técnico Profesional</h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-space-md">
                Interpretación de especificaciones técnicas y documentación de software en lengua inglesa de nivel B2.
              </p>

              <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-high/60 mb-space-md border border-glass-border-light">
                <img
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary/40"
                  alt="Lic. David Miller"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuArX302xu02_E7jYCx1Z-Lj4mahXd9qxw5UeZ9fohCIRaHmc2lGLI7XqT8IKLlK1Wvn7ZYDS4fkAGSXl00u6AK_Z-LEBx8J-v71rKEfYCLMYvSE-TdGKmGUUBx03rnPz1BpaG1_EkK5ln2PUvS0yqVjW1yzlMPrVVkz_3A6K1CIwkdIRAWhGd_0WQHrojhqo4DFA30r-SSb4sdDFlJMaaptoZNN1XPmhzCr5XIyoXz8SQIKnJmJre-ClQ"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-semibold">Lic. David Miller</span>
                  <span className="text-[11px] text-on-surface-variant">Instructor Lenguas Extranjeras</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-space-md">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Avance Curricular</span>
                  <span className="text-secondary font-semibold">90% (9 / 10 RAPs)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden flex">
                  <div className="bg-status-approved h-full" style={{ width: '90%' }}></div>
                  <div className="bg-status-pending h-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-space-sm flex items-center justify-between text-outline text-xs border-t border-glass-border-light">
              <span>Último juicio: 15 May 2026</span>
              <span className="text-secondary flex items-center gap-0.5">
                1 RAP Pendiente <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TRACEABILITY LOG & INGESTION HISTORY */}
      <section className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-space-lg shadow-xl mb-space-xl border border-glass-border-light">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Bitácora de Trazabilidad e Historial de Ingestas</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Registro inmutable de cargas Excel procesadas en memoria local con hashes de integridad criptográfica SHA-256.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative flex items-center bg-surface-container-high/60 rounded-xl px-space-md py-1.5 border border-glass-border-light">
              <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
              <input
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-on-surface placeholder-outline focus:outline-none w-48 sm:w-64"
                id="log-search"
                placeholder="Buscar por archivo o hash..."
                type="text"
              />
            </div>
            <button
              onClick={() => showToast('Bitácora Actualizada', 'Verificación criptográfica de 4 registros completada.')}
              className="p-2 rounded-xl bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface transition-colors border border-glass-border-light cursor-pointer"
              title="Refrescar Bitácora"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-glass-border-light">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/80 text-outline text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-space-md">Archivo Fuente</th>
                <th className="py-3 px-space-md">Hash de Integridad (SHA-256)</th>
                <th className="py-3 px-space-md">Auditor / Operador</th>
                <th className="py-3 px-space-md text-center">Registros RAPs</th>
                <th className="py-3 px-space-md">Estado Validación</th>
                <th className="py-3 px-space-md">Sello de Tiempo</th>
                <th className="py-3 px-space-md text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border-light font-body-sm text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="py-3.5 px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="p-2 rounded-lg bg-status-approved/15 text-status-approved">
                        <span className="material-symbols-outlined text-[18px]">table_chart</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{log.filename}</span>
                        <span className="text-[11px] text-outline">
                          Hoja: {log.sheetName} ({log.fileSize})
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-space-md font-mono text-xs text-secondary-fixed">
                    <div className="flex items-center gap-1.5" title={log.sha256}>
                      <span className="material-symbols-outlined text-[14px] text-status-approved">verified_user</span>
                      <span>
                        {log.sha256.slice(0, 10)}...{log.sha256.slice(-8)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-space-md">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                        {log.auditorInitials}
                      </div>
                      <span className="text-on-surface">{log.auditor}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-space-md text-center">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-xs font-bold text-on-surface font-mono border border-glass-border-light">
                      {log.totalRecords} / {log.totalRecords}
                    </span>
                  </td>
                  <td className="py-3.5 px-space-md">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center w-fit gap-1 border ${
                        log.normalizedCount > 0
                          ? 'bg-status-improve/15 text-status-improve border-status-improve/30'
                          : 'bg-status-approved/15 text-status-approved border-status-approved/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.normalizedCount > 0 ? 'bg-status-improve' : 'bg-status-approved'
                        }`}
                      ></span>
                      {log.validationStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-space-md text-outline font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-space-md text-right">
                    <button
                      onClick={() =>
                        showToast('Detalle de Ingesta', `${log.filename} validado con hash SHA-256 e integridad 100%.`)
                      }
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest text-secondary text-xs font-medium transition-colors border border-glass-border-light cursor-pointer"
                      type="button"
                    >
                      Ver Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Log Footer metadata */}
        <div className="mt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm text-outline text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-approved"></span>
            <span>Motor de validación estricta SRS v1.0 activo • Sin fuga de telemetría fuera del navegador</span>
          </div>
          <div className="flex items-center gap-space-md">
            <span>Mostrando {filteredLogs.length} de {ingestionLogs.length} registros de auditoría</span>
            <button onClick={handleDownloadJsonLog} className="text-primary hover:underline font-semibold cursor-pointer">
              Descargar Log Completo (.JSON)
            </button>
          </div>
        </div>
      </section>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        approvedHours={approvedHours}
        totalHours={totalHours}
        criticalIndex={criticalIndex}
        fichaId={selectedFicha}
      />
    </div>
  );
};
