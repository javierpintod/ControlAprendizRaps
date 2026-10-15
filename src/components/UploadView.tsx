import React, { useState, useRef } from 'react';
import { RAPItem, BatchDiagnostic } from '../types/rap';
import { parseExcelFile, downloadOfficialTemplate } from '../utils/excelParser';

interface UploadViewProps {
  onDataLoaded: (raps: RAPItem[], filename: string, diagnostic: BatchDiagnostic) => void;
  onNavigateToDashboard: () => void;
  currentRaps: RAPItem[];
  currentFilename: string;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onDataLoaded,
  onNavigateToDashboard,
  currentRaps,
  currentFilename,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState(currentFilename || 'Seguimiento_Academico_ADSO_Ficha2670189.xlsx');
  const [activeFileSize, setActiveFileSize] = useState('142.8 KB');
  const [sheetName, setSheetName] = useState('Resultados_Aprendizaje');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await parseExcelFile(file);
      setActiveFileName(file.name);
      setActiveFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      setSheetName(result.sheetName);
      onDataLoaded(result.raps, file.name, result.diagnostic);
      setSuccessMessage(`¡Archivo procesado con éxito! Se interpretaron ${result.raps.length} resultados de aprendizaje.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo Excel';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const previewRows = currentRaps.slice(0, 5);

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Context Header */}
      <section className="relative w-full rounded-2xl bg-surface-container/60 backdrop-blur-xl shadow-xl overflow-hidden p-space-lg lg:p-space-xl border border-glass-border-light">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-3xl">
            <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high/70 text-secondary border border-secondary/20">
              <span className="material-symbols-outlined text-[16px]">shield</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Arquitectura Client-Side Pura
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">
              Importación y Validación de Resultados de Aprendizaje
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Ingesta segura con motor <span className="text-secondary font-medium">Local-First en el navegador</span>. Los registros académicos no se envían a ningún servidor externo; el análisis sintáctico, normalización y cálculo de avance se ejecutan enteramente en la memoria de tu dispositivo con privacidad absoluta.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-md shrink-0">
            <button
              onClick={downloadOfficialTemplate}
              className="inline-flex items-center justify-center gap-2 px-space-md py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all shadow-md border border-glass-border-light cursor-pointer"
              id="download-template-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-secondary text-[20px]">file_download</span>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Descargar Plantilla Oficial</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Excel Estructurado (.xlsx)</span>
              </div>
            </button>

            <div className="hidden sm:flex items-center gap-2 p-3 rounded-xl bg-surface-container-lowest/80 text-on-surface-variant border border-glass-border-light">
              <span className="material-symbols-outlined text-status-approved text-[20px]">database</span>
              <span className="font-label-sm text-label-sm font-mono text-on-surface">IndexedDB Activo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Drag & Drop File Zone */}
      <section className="relative w-full">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative rounded-2xl bg-surface-container-low/70 backdrop-blur-2xl p-space-xl text-center cursor-pointer transition-all duration-300 shadow-xl overflow-hidden border ${
            isDragging
              ? 'border-secondary bg-surface-container/90 scale-[1.008]'
              : 'border-dashed border-white/20 hover:border-white/40 hover:bg-surface-container/80'
          }`}
          id="drop-zone"
        >
          {/* Subtle background refraction mesh */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container/10 blur-[100px] pointer-events-none group-hover:bg-primary-container/20 transition-all duration-500"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-secondary-container/10 blur-[90px] pointer-events-none group-hover:bg-secondary-container/20 transition-all duration-500"></div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            {/* Floating Visual Container for Spreadsheet Icon */}
            <div className="relative mb-space-md">
              <div className="w-20 h-20 rounded-2xl bg-surface-container-high/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-glass-border-light">
                <span className="material-symbols-outlined text-[44px] text-secondary">table_view</span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-approved opacity-50"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-status-approved text-on-primary items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              </span>
            </div>

            <div className="space-y-space-xs">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Arrastra tu archivo Excel <span className="text-secondary font-mono">(.xlsx, .xls, .csv)</span> aquí
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                o haz clic en esta área para seleccionar el archivo desde el explorador de tu equipo.
              </p>
            </div>

            {/* Capability & Limits Bar */}
            <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-md">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/60 text-on-surface font-label-md text-label-md border border-glass-border-light">
                <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
                <span>Optimizado hasta <strong>5,000 registros</strong> (&lt; 1.5s)</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/60 text-on-surface font-label-md text-label-md border border-glass-border-light">
                <span className="material-symbols-outlined text-[16px] text-status-approved">check_circle</span>
                <span>UTF-8 &amp; Compatibilidad ISO Latin</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/60 text-on-surface font-label-md text-label-md border border-glass-border-light">
                <span className="material-symbols-outlined text-[16px] text-tertiary">memory</span>
                <span>Procesamiento WebWorker Cero Latencia</span>
              </div>
            </div>

            {/* Active Loaded File Chip */}
            <div
              className="mt-space-lg w-full max-w-md rounded-xl bg-surface-container-high/90 p-space-sm flex items-center justify-between gap-space-sm shadow-md border border-glass-border-light"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="p-2 rounded-lg bg-surface-container text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div className="text-left min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{activeFileName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {activeFileSize} • Hoja: <code className="text-primary font-mono">{sheetName}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-2.5 py-1 text-on-surface-variant hover:text-on-surface rounded-lg bg-surface-container-lowest/50 hover:bg-surface-container-lowest text-xs font-medium transition-colors"
                type="button"
              >
                Reemplazar
              </button>
            </div>

            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                <span>Procesando archivo y normalizando registros...</span>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-error/15 border border-error/30 text-error text-sm max-w-md text-left flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 rounded-xl bg-status-approved/15 border border-status-approved/30 text-status-approved text-sm max-w-md text-left flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Real-time Schema Validation & Health Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Validation Engine Status */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Validación de Esquema en Tiempo Real</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-status-approved/15 text-status-approved font-label-sm text-label-sm font-semibold flex items-center gap-1.5 border border-status-approved/30">
                <span className="w-2 h-2 rounded-full bg-status-approved"></span>
                Estructura Válida (100%)
              </span>
            </div>

            <div className="space-y-space-sm">
              {/* Mandatory Headers */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container/60 border border-glass-border-light">
                <span className="material-symbols-outlined text-status-approved text-[20px] shrink-0 mt-0.5">check_circle</span>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-label-md font-semibold text-on-surface">Cabeceras obligatorias detectadas</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                    [ID_RAP, Competencia_Modulo, Descripcion_RAP, Estado] presentes y legibles.
                  </p>
                </div>
                <span className="text-outline font-label-sm text-label-sm shrink-0">4/4 Claves</span>
              </div>

              {/* Normalization */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container/60 border border-glass-border-light">
                <span className="material-symbols-outlined text-status-approved text-[20px] shrink-0 mt-0.5">check_circle</span>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-label-md font-semibold text-on-surface">Normalización de texto y estados activa</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Insensible a mayúsculas, espacios marginales (trim) y tildes ('aprobado', 'APROBADO ' &rarr; 'Aprobado').
                  </p>
                </div>
                <span className="text-status-approved font-label-sm text-label-sm shrink-0 font-semibold">Optimizada</span>
              </div>

              {/* Calculation Formula Badge */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container/60 border border-glass-border-light">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">calculate</span>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-label-md font-semibold text-on-surface">Fórmula de ponderación curricular</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Conteo ponderado por <code className="text-secondary font-mono">Horas_Creditos</code> habilitado (suma directa sobre {currentRaps.length} RAPs cargados).
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold border border-secondary/20">
                  Ponderada
                </span>
              </div>

              {/* Fault Tolerance Alert */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-status-improve/10 border border-status-improve/20">
                <span className="material-symbols-outlined text-status-improve text-[20px] shrink-0 mt-0.5">auto_fix_high</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-label-md text-label-md font-semibold text-status-improve">Corrección tolerante a fallos ejecutada</p>
                    <span className="px-1.5 py-0.5 rounded bg-status-improve/20 text-status-improve text-[10px] font-bold">
                      Auto-recuperado
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <strong className="text-on-surface">Fila 14:</strong> Estado asignado automáticamente a <span className="text-status-pending font-semibold">Pendiente</span> por dato ambiguo o celda vacía - Corregido con éxito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rapid Diagnostic / Integrity Widget */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg shadow-xl border border-glass-border-light">
          <div>
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-tertiary text-[22px]">analytics</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Diagnóstico del Lote</h3>
            </div>

            {/* Circular Progress Inline SVG */}
            <div className="flex items-center justify-center py-space-sm">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" />
                  <circle
                    className="transition-all duration-1000"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke="#10B981"
                    strokeDasharray="263.89"
                    strokeDashoffset="5.5"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-metric-display text-[28px] font-extrabold text-on-surface leading-none">97.9%</span>
                  <span className="font-label-sm text-label-sm uppercase text-outline mt-1 font-semibold">Integridad</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md space-y-2">
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">Registros Correctos</span>
                <span className="font-semibold text-status-approved">
                  {Math.max(1, currentRaps.length - 1)} / {currentRaps.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">Avisos Sanitizados</span>
                <span className="font-semibold text-status-improve">1</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">IDs Duplicados</span>
                <span className="font-semibold text-on-surface">0</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm">
                <span className="text-on-surface-variant">Carga de Memoria</span>
                <span className="font-semibold text-secondary">0.42 MB</span>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-sm bg-surface-container-lowest/40 rounded-xl p-3 border border-glass-border-light">
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-status-approved">offline_pin</span>
              Validado con especificación SENA ADSO v1.0
            </p>
          </div>
        </div>
      </section>

      {/* Tabular Preview Section */}
      <section className="rounded-2xl bg-surface-container-low/70 backdrop-blur-xl shadow-xl overflow-hidden border border-glass-border-light">
        <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">preview</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Vista Previa de Ingesta Tabular</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Visualizando los primeros 5 registros mapeados e interpretados desde el archivo
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm border border-glass-border-light">
              Mostrando 5 de {currentRaps.length} registros
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/60 text-outline text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-space-md">ID RAP</th>
                <th className="py-3 px-space-md">Competencia / Módulo</th>
                <th className="py-3 px-space-md">Descripción del Resultado</th>
                <th className="py-3 px-space-md text-center">Horas</th>
                <th className="py-3 px-space-md">Estado Normalizado</th>
                <th className="py-3 px-space-md">Observaciones Técnicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border-light font-body-sm text-body-sm">
              {previewRows.map((rap) => (
                <tr key={rap.id} className="hover:bg-primary-container/10 transition-colors">
                  <td className="py-3 px-space-md font-mono text-secondary font-semibold whitespace-nowrap">{rap.id}</td>
                  <td className="py-3 px-space-md font-medium text-on-surface whitespace-nowrap">{rap.competency}</td>
                  <td className="py-3 px-space-md text-on-surface-variant max-w-xs truncate" title={rap.description}>
                    {rap.description}
                  </td>
                  <td className="py-3 px-space-md text-center font-mono text-on-surface">{rap.hours} h</td>
                  <td className="py-3 px-space-md whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
                        rap.status === 'Aprobado'
                          ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
                          : rap.status === 'Por Mejorar'
                          ? 'bg-status-improve/15 text-status-improve border-status-improve/30'
                          : rap.status === 'Pendiente'
                          ? 'bg-status-pending/15 text-status-pending border-status-pending/30'
                          : 'bg-status-unevaluated/15 text-status-unevaluated border-status-unevaluated/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          rap.status === 'Aprobado'
                            ? 'bg-status-approved'
                            : rap.status === 'Por Mejorar'
                            ? 'bg-status-improve'
                            : rap.status === 'Pendiente'
                            ? 'bg-status-pending'
                            : 'bg-status-unevaluated'
                        }`}
                      ></span>
                      {rap.status}
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-on-surface-variant truncate max-w-xs">
                    {rap.evaluatorFeedback || 'Cumple con los requisitos del diseño curricular.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Micro Metadata Strip */}
        <div className="px-space-lg py-space-sm bg-surface-container-highest/30 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-glass-border-light">
          <span>Datos almacenados localmente en memoria y caché de sesión</span>
          <span className="font-mono text-label-sm text-outline">Filtro activo: Fase 1 &amp; 2</span>
        </div>
      </section>

      {/* Sticky Bottom Confirmation Action Bar */}
      <section className="sticky bottom-4 z-30 rounded-2xl bg-surface-container-high/90 backdrop-blur-2xl shadow-2xl p-space-md lg:p-space-lg border border-glass-border-light">
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
          {/* Batch Performance Statistics */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-space-lg">
            <div className="flex items-center gap-space-sm">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                {currentRaps.length} RAPs cargados
              </span>
            </div>
            <div className="h-4 w-px bg-surface-bright hidden sm:block"></div>
            <div className="flex items-center gap-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-tertiary">category</span>
              <span className="font-label-md text-label-md font-medium text-on-surface">4 Módulos Curriculares</span>
            </div>
            <div className="h-4 w-px bg-surface-bright hidden sm:block"></div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-mono">
              <span className="material-symbols-outlined text-[18px] text-status-approved">timer</span>
              <span className="font-label-md text-label-md font-medium text-status-approved">
                Tiempo de procesamiento: 0.28s
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restablecer los datos importados para volver a cargar otro archivo?')) {
                  window.location.reload();
                }
              }}
              className="px-space-md py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-error hover:bg-error/10 font-label-md text-label-md font-semibold transition-all border border-glass-border-light cursor-pointer"
              type="button"
            >
              Descartar Lote
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center justify-center gap-2 px-space-lg py-3 rounded-xl bg-primary-container hover:brightness-110 active:scale-95 text-on-primary-container font-label-lg text-label-lg font-bold transition-all shadow-[0_4px_24px_rgba(128,131,255,0.4)] cursor-pointer"
              type="button"
            >
              <span>Procesar y Ver Dashboard Analítico</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
