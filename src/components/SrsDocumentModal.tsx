import React, { useState } from 'react';

interface SrsDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SrsDocumentModal: React.FC<SrsDocumentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'entradas' | 'procesamiento' | 'dashboard' | 'usuarios' | 'alcance' | 'criterios' | 'supuestos'>('all');

  if (!isOpen) return null;

  const downloadMarkdown = () => {
    const srsContent = `# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS v1.0)
## Sistema de Seguimiento Formativo y Analítica de Resultados de Aprendizaje (EduTrack Analytics)

**Autor:** Analista Senior de Requerimientos de Software Educativo
**Fecha:** Mayo 2026
**Objetivo del software:** Cargar un archivo en formato Excel con resultados de aprendizaje (RAPs), verificar juicios evaluativos (Aprobado / Por Mejorar / Pendiente / No Evaluado), normalizar inconsistencias de formato y calcular el avance ponderado y nominal en un dashboard interactivo local-first con privacidad absoluta.

---

### 1. ENTRADAS Y ESTRUCTURA DEL ARCHIVO EXCEL

#### 1.1 Estructura Recomendada de Columnas
Para garantizar interoperabilidad y procesamiento determinista en el cliente, el archivo Excel (.xlsx, .xls o .csv) debe contener una hoja principal denominada \`Resultados_Aprendizaje\` o \`Consolidado_RAP\` con las siguientes columnas obligatorias y opcionales:

| Columna | Tipo de Dato | Obligatoria | Justificación Técnica y Pedagógica |
| :--- | :--- | :--- | :--- |
| **ID_RAP** | Texto (ej. 'RAP-01') | Sí | Identificador unívoco e inmutable para indexación y trazabilidad en la matriz curricular. |
| **Codigo_Competencia** | Texto numérico (ej. '220501096') | No | Código oficial de la norma de competencia laboral (estándar SENA/Mineducación). |
| **Competencia_Modulo** | Texto (ej. 'Desarrollo Web') | Sí | Agrupador curricular para calcular el avance modular y segmentar la responsabilidad del instructor. |
| **Descripcion_RAP** | Texto largo | Sí | Declaración explícita del resultado de aprendizaje u objetivo pedagógico a demostrar. |
| **Horas** (o Horas_Creditos) | Numérico entero (ej. 20, 30) | Sí | Carga horaria que pondera el peso relativo del RAP frente al total del programa (1.120 horas). |
| **Fase** | Texto ('Fase 1', 'Fase 2', 'Fase 3') | No | Etapa pedagógica (Análisis, Planeación, Ejecución, Evaluación) para el seguimiento cronológico. |
| **Estado** | Texto ('Aprobado', 'Por Mejorar', 'Pendiente', 'No Evaluado') | Sí | Juicio formativo vigente del estudiante frente al resultado evaluado. |
| **Instructor_Evaluador**| Texto (ej. 'Ing. Roberto Torres') | No | Responsable técnico de emitir el juicio formativo y retroalimentación cualitativa. |
| **Fecha_Evaluacion** | Fecha (YYYY-MM-DD o DD/MM/AAAA) | No | Sello temporal del último juicio para trazar la curva longitudinal de avance acumulado. |
| **Observaciones_Tecnicas**| Texto descriptivo | No | Retroalimentación pedagógica detallando observaciones, oportunidades de mejora o evidencias faltantes. |

#### 1.2 Reglas de Validación Sintáctica y Semántica
1. **Detección tolerante de cabeceras:** El motor realiza coincidencia insensible a mayúsculas, tildes y espacios ('descripcion_rap', 'DESCRIPCIÓN', 'Resultado' son homologados automáticamente).
2. **Normalización de Estados:**
   - \`Aprobado\`: homologa cadenas como 'aprobado', 'superado', 'si', 'a', '1', 'pass', eliminando espacios periféricos.
   - \`Por Mejorar\`: homologa 'por mejorar', 'mejorar', 'd', 'no aprobado', 'observacion', 'alerta', 'insatisfactorio'.
   - \`Pendiente\`: homologa 'pendiente', 'en revision', 'en proceso', 'evaluando'.
   - \`No Evaluado\`: homologa celdas vacías, null, 'no evaluado', 'n/a', '-', 'futuro'.
3. **Tratamiento de Inconsistencias:**
   - Si una fila carece de ID_RAP, el sistema le asigna un identificador secuencial auto-generado \`RAP-XX\` y registra una alerta en la bitácora de sanitización.
   - Si la columna Horas está vacía o contiene texto no numérico, el sistema aplica un valor neutro configurable (20 horas) y marca la fila para advertencia del usuario.
   - IDs duplicados son detectados y renombrados con sufijo correlativo (-1, -2).

---

### 2. MOTOR DE PROCESAMIENTO Y REGLAS DE NEGOCIO

#### 2.1 Definición Semántica de Estados
- **Aprobado:** El estudiante ha aportado evidencias suficientes y verificables que demuestran el logro pleno del resultado de aprendizaje según los criterios del diseño curricular. Otorga el 100% de las horas del RAP al acumulado del programa.
- **Por Mejorar (Crítico / Alerta):** El estudiante presentó evidencias pero presentan no conformidades técnicas. No suma horas aprobadas y activa de inmediato una alerta en el dashboard para solicitar nivelación o re-evaluación prioritaria.
- **Pendiente (En Proceso):** El resultado se encuentra en ejecución activa o el instructor está revisando la entrega. No penaliza como alerta crítica pero no suma horas de superación.
- **No Evaluado:** Corresponde a etapas posteriores de la formación que aún no han iniciado en el ciclo lectivo. Se excluye del denominador en el cálculo de efectividad sobre lo impartido.

#### 2.2 Fórmulas de Cálculo de Avance
1. **Avance Nominal por Conteo:**
   $$\\text{Avance Nominal (\\%)} = \\left( \\frac{\\sum \\text{RAPs Aprobados}}{\\text{Total de RAPs en Matriz}} \\right) \\times 100$$
2. **Avance Ponderado por Horas (Indicador Oficial de Certificación):**
   $$\\text{Avance Ponderado (\\%)} = \\left( \\frac{\\sum \\text{Horas de RAPs Aprobados}}{\\sum \\text{Horas Totales del Programa}} \\right) \\times 100$$
3. **Avance por Competencia / Módulo:**
   $$\\text{Avance Modular (\\%)} = \\left( \\frac{\\sum \\text{Horas Aprobadas del Módulo}}{\\sum \\text{Horas Totales del Módulo}} \\right) \\times 100$$
4. **Índice de RAPs Críticos ($I_c$):**
   $$I_c = \\left( \\frac{\\text{RAPs Por Mejorar}}{\\text{RAPs Evaluados (Aprobados + Por Mejorar)}} \\right) \\times 100$$
   - $I_c \\le 10\\%$: Bajo Riesgo (Dictamen Favorable).
   - $10\\% < I_c \\le 20\\%$: Riesgo Medio (Atención Requerida).
   - $I_c > 20\\%$: Riesgo Alto (Comité de Evaluación Inmediato).

---

### 3. DASHBOARD INTERACTIVO Y EXPERIENCIA DE USUARIO

#### 3.1 Indicadores Clave Inmediatos (Top KPIs)
- **Avance Ponderado Global:** Porcentaje acumulado y horas aprobadas vs. horas totales (ej. 840 / 1.120 h = 75.0%).
- **Índice de RAPs Críticos ($I_c$):** Porcentaje de rezago y número de RAPs en observación inmediata.
- **Velocidad de Superación:** RAPs aprobados por semana vs. proyección curricular estipulada.
- **Cobertura Curricular:** Proporción de RAPs evaluados frente a no evaluados (ej. 44 / 48 RAPs = 91.6%).

#### 3.2 Vistas y Visualizaciones
1. **Curva de Tendencia y Cumplimiento Acumulado:** Gráfico de área brillante que compara el avance real mensual (Ene - Jun 2026) con la línea base teórica programada.
2. **Desglose Modular por Instructor:** Tarjetas con foto, cargo, porcentaje de superación, barra segmentada por estado y enlace a auditoría.
3. **Matriz Curricular Filtrable:** Tabla con paginación, búsqueda en tiempo real, filtros por competencia, fase y chips de estado (Aprobado 36, Por Mejorar 4, Pendiente 6, No Evaluado 2).
4. **Drawer Lateral de Inspección de RAP:** Panel deslizante al hacer clic en cualquier fila para consultar el detalle pedagógico, retroalimentación del evaluador, historial de intentos y emitir nuevas notas o solicitudes de re-evaluación.
5. **Bitácora Criptográfica de Ingestas:** Historial de cargas con hash SHA-256 inmutable, sellos de tiempo, auditor responsable y descarga de logs JSON.
6. **Generador de Certificado de Cumplimiento:** Modal interactivo con sello criptográfico oficial y opción de exportación a PDF.

---

### 4. USUARIOS, DISPOSITIVOS Y ACCESO

- **Audiencia Objetivo:**
  1. *Aprendices / Estudiantes:* Para auto-monitorear su progreso, identificar RAPs en riesgo y solicitar aclaraciones.
  2. *Instructores / Docentes:* Para evaluar evidencias, emitir juicios y registrar retroalimentaciones técnicas.
  3. *Coordinadores Académicos:* Para auditar el cumplimiento del programa y expedir certificados modulares.
- **Entorno de Ejecución:** Web client-side local-first. Los archivos Excel se procesan en la memoria RAM del navegador y se almacenan opcionalmente en IndexedDB. No existe envío de datos a servidores externos, garantizando privacidad total y cumplimiento de leyes de protección de datos (Habeas Data).
- **Dispositivos:** Optimizado para escritorio y laptops (1440px y 1280px), adaptable a tabletas (1024px) y con vista responsive para teléfonos móviles.

---

### 5. REQUERIMIENTOS NO FUNCIONALES

- **Rendimiento:** Procesamiento de archivos de hasta 5.000 registros en menos de 1.5 segundos en navegadores estándar.
- **Compatibilidad:** 100% funcional en Chrome, Edge, Safari, Firefox y Opera sin necesidad de instalar plugins.
- **Privacidad y Seguridad:** Procesamiento hermético en cliente; cálculo de hashes SHA-256 para validación de integridad inmutable.
- **Usabilidad y Accesibilidad:** Contraste WCAG AA, soporte de teclado, tipografías geométricas de alta legibilidad (Plus Jakarta Sans e Inter) y cifras tabulares continuas.

---

### 6. ALCANCE: FASE 1 (MVP) VS FASE 2

- **Dentro del Alcance (Fase 1 - Actual):**
  - Carga interactiva Drag & Drop de archivos .xlsx, .xls y .csv.
  - Validación de esquema en tiempo real y corrección automática de estados.
  - Descarga de plantilla oficial estructurada en formato Excel (.xlsx).
  - Dashboard completo con KPIs, curva real vs proyectada y tarjetas por instructor.
  - Matriz de RAPs con búsqueda, filtros cruzados y drawer de inspección de detalles.
  - Generador de certificado oficial con folio y hash SHA-256.
  - Bitácora de trazabilidad e historial de ingestas.
  - Exportación de informes en PDF e ingestas en JSON/Excel.

- **Para Fases Posteriores (Fase 2):**
  - Sincronización multi-usuario en tiempo real mediante base de datos relacional Cloud SQL / Firebase.
  - Conexión vía API directa al sistema institucional SENA SofiaPlus / Territorium.
  - Notificaciones push al correo electrónico ante cambios en juicios evaluativos.
  - Módulo de predicción de riesgo académico mediante modelos estadísticos avanzados.

---

### 7. CRITERIOS DE ACEPTACIÓN VERIFICABLES

1. **Criterio CA-01 (Carga y Validación):** Dado un archivo Excel con 48 filas de RAPs, al arrastrarlo a la zona de carga, el sistema debe parsear el 100% de las filas, calcular el hash SHA-256 en menos de 1 segundo y mostrar la vista previa tabular sin errores de renderizado.
2. **Criterio CA-02 (Cálculo Ponderado):** Dado un lote con 36 RAPs aprobados equivalentes a 840 horas de un total de 1.120 horas, el dashboard debe mostrar con precisión matemática el 75.0% de avance ponderado.
3. **Criterio CA-03 (Filtro Reactivo):** Al presionar el chip "Por Mejorar", la tabla debe actualizarse instantáneamente mostrando únicamente los 4 registros en observación crítica.
4. **Criterio CA-04 (Inspección y Feedback):** Al hacer clic en el RAP-02, el panel lateral debe desplegarse con las observaciones del evaluador, historial de envíos y permitir registrar una nota de seguimiento.
5. **Criterio CA-05 (Exportación de Certificado):** Al presionar "Generar Certificado", el sistema debe abrir el documento oficial con el código de folio CERT-2026-ADSO-8492 y habilitar la descarga en PDF.

---

### 8. SUPUESTOS Y PREGUNTAS ABIERTAS PARA CONFIRMACIÓN

#### 8.1 Supuestos Asumidos en esta Versión
- **Supuesto S1:** Se asume el modelo de formación técnica y tecnológica basado en competencias (referenciado en el programa SENA ADSO - Ficha 2670189 con 1.120 horas lectivas).
- **Supuesto S2:** Se asume que el cálculo principal de certificación debe ser *ponderado por horas* de cada RAP y no un simple promedio aritmético de cantidad de RAPs.
- **Supuesto S3:** Se asume una arquitectura local-first para proteger la confidencialidad de las calificaciones del aprendiz, sin requerir usuario ni contraseña en el primer despliegue.

#### 8.2 Preguntas Abiertas para Validación con el Usuario
1. ¿El cálculo institucional debe exigir que TODOS los RAPs de un módulo estén en 100% para expedir la certificación de ese módulo, o se permiten excepciones por comité?
2. ¿Se requiere compatibilidad con plantillas de múltiples hojas (por ejemplo, una hoja por trimestre o una hoja por aprendiz)?
3. ¿Deseas que los estudiantes puedan auto-modificar el estado de sus RAPs o debe haber un rol de sólo lectura para ellos?
4. ¿Prefieres que las notas y solicitudes de re-evaluación se exporten en un archivo Excel de novedades para remitir al instructor líder?`;

    const blob = new Blob([srsContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Especificacion_Requerimientos_Software_EduTrack_SRS_v1.0.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas-base/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-surface-container-low/95 border border-glass-border-light shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-space-lg border-b border-glass-border-light bg-surface-container/60 shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-[26px]">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Documento Oficial de Ingeniería</span>
                <span className="text-outline text-xs">•</span>
                <span className="text-xs text-outline font-mono">SRS v1.0 • Estándar IEEE 830</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Especificación de Requerimientos de Software (SRS)</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-secondary text-label-md font-semibold transition-all border border-secondary/20"
              title="Descargar en formato Markdown (.md)"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Descargar .MD</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container text-on-primary-container text-label-md font-semibold transition-all hover:brightness-110 shadow-md"
              title="Imprimir documento"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
              title="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 px-space-lg py-2.5 bg-surface-container-lowest/60 border-b border-glass-border-light overflow-x-auto no-scrollbar shrink-0 text-label-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Ver Todo el Documento
          </button>
          <button
            onClick={() => setActiveTab('entradas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'entradas' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            1. Entradas & Plantilla
          </button>
          <button
            onClick={() => setActiveTab('procesamiento')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'procesamiento' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            2. Procesamiento & Reglas
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            3. Dashboard & UI
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'usuarios' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            4. Usuarios & NFRs
          </button>
          <button
            onClick={() => setActiveTab('alcance')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'alcance' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            5. Alcance (MVP vs F2)
          </button>
          <button
            onClick={() => setActiveTab('criterios')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'criterios' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            6. Criterios de Aceptación
          </button>
          <button
            onClick={() => setActiveTab('supuestos')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'supuestos' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            7. Supuestos & Preguntas
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-space-lg sm:p-space-xl space-y-space-lg text-body-md text-on-surface-variant leading-relaxed">
          {/* Section: Overview */}
          {(activeTab === 'all' || activeTab === 'entradas') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 1</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Entradas: Estructura del Archivo Excel y Validaciones</h3>
              </div>
              <p>
                Para garantizar interoperabilidad y procesamiento determinista en el cliente sin requerir dependencias complejas, la aplicación acepta archivos en formato <strong className="text-on-surface font-semibold">.xlsx, .xls o .csv</strong>.
              </p>
              
              <h4 className="font-semibold text-on-surface pt-2">Plantilla Canónica Recomendada (Estructura de Columnas)</h4>
              <div className="overflow-x-auto rounded-xl border border-glass-border-light">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-surface-container-highest/60 text-outline text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3">Nombre Columna</th>
                      <th className="p-3">Tipo Dato</th>
                      <th className="p-3">Obligatoria</th>
                      <th className="p-3">Propósito y Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border-light font-body-sm">
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">ID_RAP</td>
                      <td className="p-3">Texto (ej. RAP-01)</td>
                      <td className="p-3 text-status-approved font-semibold">Sí</td>
                      <td className="p-3">Clave primaria inmutable para indexación y trazabilidad en la matriz formativa.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Codigo_Competencia</td>
                      <td className="p-3">Numérico (ej. 220501096)</td>
                      <td className="p-3 text-outline">No</td>
                      <td className="p-3">Código de la norma de competencia laboral en catálogos oficiales (SENA/Mineducación).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Competencia_Modulo</td>
                      <td className="p-3">Texto (ej. Desarrollo Web)</td>
                      <td className="p-3 text-status-approved font-semibold">Sí</td>
                      <td className="p-3">Agrupador curricular para calcular el avance por asignaturas y segmentar la responsabilidad del instructor.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Descripcion_RAP</td>
                      <td className="p-3">Texto largo</td>
                      <td className="p-3 text-status-approved font-semibold">Sí</td>
                      <td className="p-3">Declaración explícita del resultado de aprendizaje u objetivo cognitivo a demostrar.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Horas</td>
                      <td className="p-3">Entero (ej. 20, 30, 40)</td>
                      <td className="p-3 text-status-approved font-semibold">Sí</td>
                      <td className="p-3">Pondera el peso relativo del RAP frente al total del programa (1.120 horas lectivas).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Fase</td>
                      <td className="p-3">Texto (Fase 1, 2 o 3)</td>
                      <td className="p-3 text-outline">No</td>
                      <td className="p-3">Etapa cronológica (Análisis, Planeación, Ejecución) para proyectar el cronograma.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Estado</td>
                      <td className="p-3">Texto ('Aprobado', etc.)</td>
                      <td className="p-3 text-status-approved font-semibold">Sí</td>
                      <td className="p-3">Juicio formativo vigente del estudiante frente al resultado evaluado.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Instructor_Evaluador</td>
                      <td className="p-3">Texto</td>
                      <td className="p-3 text-outline">No</td>
                      <td className="p-3">Nombre del docente evaluador responsable de emitir el juicio pedagógico.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-primary">Fecha_Evaluacion</td>
                      <td className="p-3">Fecha (YYYY-MM-DD)</td>
                      <td className="p-3 text-outline">No</td>
                      <td className="p-3">Sello temporal del juicio para graficar la curva longitudinal acumulada.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-on-surface pt-2">Reglas de Validación Sintáctica y Sanitización</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Normalización insensible:</strong> El motor elimina espacios en blanco y tildes ('aprobado', 'APROBADO ', 'Superado' se mapean a <em>Aprobado</em>).</li>
                <li><strong>Manejo de vacíos y nulos:</strong> Celdas de estado vacías son asignadas preventivamente a <em>No Evaluado</em> (si no tienen fecha) o a <em>Pendiente</em> (si poseen evidencias en revisión).</li>
                <li><strong>Generación de claves de respaldo:</strong> Si una fila carece de ID_RAP, el analizador sintetiza un ID correlativo <code>RAP-XX</code> y notifica en el diagnóstico del lote.</li>
              </ul>
            </div>
          )}

          {/* Section: Processing */}
          {(activeTab === 'all' || activeTab === 'procesamiento') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 2</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Procesamiento y Fórmulas de Cálculo</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-sm rounded-xl bg-surface-container-high/60">
                  <h4 className="font-semibold text-on-surface text-sm mb-1">1. Avance Ponderado por Horas (Oficial)</h4>
                  <p className="text-xs text-on-surface-variant mb-2">
                    Refleja el verdadero progreso de certificación reconociendo la complejidad de cada temática:
                  </p>
                  <code className="text-xs text-secondary block bg-surface-container-lowest p-2 rounded">
                    % Avance Ponderado = (Σ Horas RAPs Aprobados / Σ Horas Totales Programa) * 100
                  </code>
                  <p className="text-xs text-outline mt-1">Ejemplo Ficha 2670189: (840h / 1.120h) = 75.0%</p>
                </div>

                <div className="p-space-sm rounded-xl bg-surface-container-high/60">
                  <h4 className="font-semibold text-on-surface text-sm mb-1">2. Avance Modular por Competencia</h4>
                  <p className="text-xs text-on-surface-variant mb-2">
                    Permite certificar módulos de forma independiente:
                  </p>
                  <code className="text-xs text-secondary block bg-surface-container-lowest p-2 rounded">
                    % Avance Módulo = (Horas Aprobadas Módulo / Horas Totales Módulo) * 100
                  </code>
                  <p className="text-xs text-outline mt-1">Ejemplo Desarrollo Web: (420h / 420h) = 100%</p>
                </div>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container-high/60">
                <h4 className="font-semibold text-on-surface text-sm mb-1">3. Índice de RAPs Críticos (Ic)</h4>
                <p className="text-xs text-on-surface-variant mb-2">
                  Mide el nivel de riesgo pedagógico de la cohorte para focalizar planes de nivelación técnica inmediata:
                </p>
                <code className="text-xs text-secondary block bg-surface-container-lowest p-2 rounded">
                  Ic = [ RAPs "Por Mejorar" / (RAPs Aprobados + RAPs "Por Mejorar") ] * 100
                </code>
                <p className="text-xs text-outline mt-1">
                  En el estado actual: [4 / (36 + 4)] * 100 = 8.3% &rarr; Categorizado como <strong>Bajo Riesgo</strong> (&lt; 10%).
                </p>
              </div>
            </div>
          )}

          {/* Section: Dashboard UI */}
          {(activeTab === 'all' || activeTab === 'dashboard') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 3</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Dashboard Interactivo y Componentes Visuales</h3>
              </div>
              <p>
                La interfaz implementa una estética de alta precisión técnica en modo oscuro luminoso con 4 módulos principales:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-sm">
                <div className="p-3 rounded-xl bg-surface-container-high/40">
                  <h4 className="font-semibold text-on-surface">Dashboard Principal</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Vista ejecutiva inmediata con medidor circular del 75%, desglose de 48 RAPs por estado, tarjetas de avance por competencia y alertas de rezago.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high/40">
                  <h4 className="font-semibold text-on-surface">Carga de Archivo Excel</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Área Drag & Drop con parser WebWorker, indicador de integridad al 97.9%, correcciones automáticas y visor de plantilla oficial descargable.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high/40">
                  <h4 className="font-semibold text-on-surface">Matriz Curricular de RAPs</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Tabla paginada con buscador universal, filtros por fase/competencia, chips reactivos y drawer lateral de inspección con retroalimentación del evaluador.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high/40">
                  <h4 className="font-semibold text-on-surface">Reportes & Trazabilidad</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Curva de avance real vs proyectado teórico (+6.5% adelanto), bitácora criptográfica con hashes SHA-256 y generador de certificado modular.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Users & NFR */}
          {(activeTab === 'all' || activeTab === 'usuarios') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 4</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Usuarios y Requerimientos No Funcionales</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Perfiles de Usuario:</strong></p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li><strong>Aprendiz / Estudiante:</strong> Consulta su progreso de horas, identifica RAPs en riesgo y solicita re-evaluación al docente.</li>
                  <li><strong>Instructor Líder (ej. Dra. Carolina Méndez):</strong> Carga cortes oficiales de Excel, revisa observaciones y valida solicitudes de nivelación.</li>
                  <li><strong>Coordinador Académico:</strong> Audita los hashes de integridad de los archivos y emite certificados con firmas digitales.</li>
                </ul>

                <p className="pt-2"><strong>Atributos de Calidad y No Funcionales:</strong></p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li><strong>Arquitectura Local-First y Privacidad:</strong> Cero fuga de telemetría a servidores de terceros; los archivos se leen en la RAM del navegador.</li>
                  <li><strong>Rendimiento:</strong> Tiempo de procesamiento &lt; 0.30s para matrices de 48 RAPs y &lt; 1.5s para lotes masivos de hasta 5.000 filas.</li>
                  <li><strong>Accesibilidad:</strong> Contraste tipográfico superior a 4.5:1, compatibilidad con lectores de pantalla y soporte de teclado.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section: Scope */}
          {(activeTab === 'all' || activeTab === 'alcance') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 5</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Alcance: MVP (Fase 1) vs Futuro (Fase 2)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-xs">
                <div className="p-3 rounded-xl bg-status-approved/10 border border-status-approved/20">
                  <h4 className="font-semibold text-status-approved text-sm mb-1">Dentro del Alcance (Fase 1 - Disponible)</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Carga y parseo instantáneo de archivos Excel (.xlsx, .xls, .csv).</li>
                    <li>Validación de cabeceras obligatorias y normalización tolerante de estados.</li>
                    <li>Descarga de plantilla oficial estructurada.</li>
                    <li>Dashboard interactivo con métricas de horas, porcentajes y módulos.</li>
                    <li>Drawer de inspección de RAPs con formulario de notas y re-evaluación.</li>
                    <li>Bitácora inmutable con hashes SHA-256 e informe imprimible/PDF.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high/40 border border-glass-border-light">
                  <h4 className="font-semibold text-secondary text-sm mb-1">Para Fase 2 (Próximas Iteraciones)</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Conexión bidireccional vía API REST con sistemas institucionales (SENA SofiaPlus / Territorium).</li>
                    <li>Autenticación multi-rol con base de datos en la nube (PostgreSQL / Firestore).</li>
                    <li>Notificaciones automáticas por correo electrónico ante cambios en juicios evaluativos.</li>
                    <li>Modelos predictivos de riesgo basados en series de tiempo para estimación de fecha de graduación.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Acceptance Criteria */}
          {(activeTab === 'all' || activeTab === 'criterios') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 6</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Criterios de Aceptación Verificables (Given-When-Then)</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-container-high/50">
                  <span className="font-bold text-primary">CA-01 (Carga y Validación de Archivo):</span>
                  <p className="mt-0.5 text-on-surface-variant">
                    <em>Dado</em> un archivo Excel con 48 resultados de aprendizaje, <em>cuando</em> el usuario lo arrastra a la zona de carga, <em>entonces</em> el sistema procesa los datos en menos de 1 segundo, genera su hash SHA-256 y muestra la vista previa con el estado normalizado de cada fila.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-high/50">
                  <span className="font-bold text-primary">CA-02 (Cálculo Ponderado de Avance):</span>
                  <p className="mt-0.5 text-on-surface-variant">
                    <em>Dado</em> un lote con 36 RAPs aprobados equivalentes a 840 horas de 1.120h, <em>cuando</em> se accede al Dashboard, <em>entonces</em> el indicador de Eficiencia por Horas debe reflejar con exactitud matemática el 75.0% de avance.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-high/50">
                  <span className="font-bold text-primary">CA-03 (Interacción y Filtro de Matriz):</span>
                  <p className="mt-0.5 text-on-surface-variant">
                    <em>Dado</em> el catálogo completo de 48 RAPs, <em>cuando</em> el usuario presiona el chip de filtro "Por Mejorar", <em>entonces</em> la tabla se re-renderiza mostrando únicamente los 4 RAPs en estado crítico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Assumptions */}
          {(activeTab === 'all' || activeTab === 'supuestos') && (
            <div className="rounded-2xl bg-surface-container/40 p-space-lg border border-glass-border-light space-y-space-sm">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase">Sección 7</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Supuestos y Preguntas Abiertas</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-status-improve/10 border border-status-improve/20 text-on-surface">
                  <h4 className="font-semibold text-status-improve mb-1">Supuestos Asumidos:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>[Supuesto S1]:</strong> Se asume el modelo de formación modular técnica ADSO con 1.120 horas lectivas distribuidas en módulos de Desarrollo Web, Bases de Datos, Inglés y Calidad.</li>
                    <li><strong>[Supuesto S2]:</strong> Se asume que el avance de formación se pondera por las horas asignadas a cada RAP y no por el simple conteo de filas.</li>
                    <li><strong>[Supuesto S3]:</strong> Se adopta una arquitectura client-side para permitir el uso libre y sin necesidad de infraestructura de servidor en el aula o el hogar.</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container-high/50">
                  <h4 className="font-semibold text-secondary mb-1">Preguntas Abiertas para Confirmación:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>1. ¿Existen RAPs transversales cuya aprobación sea prerrequisito obligatorio antes de certificar las materias técnicas?</li>
                    <li>2. ¿Se prefiere que el reporte PDF descargable incluya la firma digital del instructor con sello de tiempo criptográfico oficial? (Ya implementado como propuesta).</li>
                    <li>3. ¿El umbral de alerta para RAPs críticos debe fijarse en 10% o 15% según las directrices institucionales de tu centro de formación?</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-space-md border-t border-glass-border-light bg-surface-container/60 shrink-0 text-xs text-outline">
          <span>EduTrack SRS Specification v1.0 • Formación Basada en Competencias</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-bright font-semibold transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
