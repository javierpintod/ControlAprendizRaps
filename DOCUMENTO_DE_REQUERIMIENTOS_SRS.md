# DOCUMENTO DE ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## Sistema de Seguimiento Formativo y Dashboard de Resultados de Aprendizaje (RAPs)

**Versión:** 1.0  
**Fecha:** Octubre 2026  
**Rol:** Analista de Requerimientos de Software y Sistemas Educativos  
**Estado:** Propuesta de Definición para Validación  
**Tecnología de Despliegue:** PHP 8.x + Apache (XAMPP Local) + JavaScript Vanilla / Chart.js  

---

## 1. INTRODUCCIÓN Y OBJETIVO DEL SISTEMA

### 1.1 Objetivo del Software
Construir una aplicación web orientada al ámbito formativo que permita a aprendices, tutores y coordinadores cargar un archivo en formato Excel o CSV con la matriz de Resultados de Aprendizaje (RAPs), clasificar automáticamente los juicios evaluativos vigentes (identificando cuáles han sido aprobados y cuáles requieren refuerzo), y calcular con precisión el avance porcentual y ponderado de la formación. Dicha información se presentará a través de un **dashboard interactivo** de alta fidelidad visual, local-first y sincronizado en un entorno de desarrollo local con **XAMPP**.

### 1.2 Alcance del Problema
En programas de formación técnica y tecnológica (como los del SENA y universidades), los aprendices a menudo carecen de una herramienta visual inmediata para saber:
- Cuántos resultados de aprendizaje han completado satisfactoriamente.
- Cuántas horas curriculares han acumulado sobre el total exigido para certificar.
- Cuáles competencias presentan rezago crítico ("Por Mejorar") que impiden el paso a etapa productiva o graduación.
- Cómo se distribuye el avance por fases del proyecto o módulos formativos.

La presente solución resuelve esta necesidad mediante una arquitectura ligera en **PHP**, ejecutada de forma local y soberana en **XAMPP**, garantizando privacidad y retroalimentación instantánea.

---

## 2. ENTRADAS Y ESTRUCTURA DEL ARCHIVO EXCEL

### 2.1 Plantilla de Datos Estandarizada
Para asegurar un procesamiento libre de errores y estandarizado, el archivo Excel (`.xlsx`, `.xls` o `.csv`) debe estructurarse con una hoja de cálculo principal denominada `Resultados_Aprendizaje` o `Consolidado_RAP`.

A continuación, se define la estructura técnica de columnas recomendada:

| # | Columna | Nombre Técnico Cabecera | Tipo de Dato | Obligatoria | Justificación Técnica y Pedagógica | Ejemplo |
|---|---|---|---|---|---|---|
| **1** | **ID RAP** | `id_rap` / `codigo_rap` | Texto | **Sí** | Identificador único y correlativo del resultado para indexación, búsqueda y trazabilidad curricular. | `RAP-01`, `RAP-02` |
| **2** | **Código Competencia** | `codigo_competencia` | Texto / Numérico | No | Código oficial de la norma de competencia laboral (estándar curricular institucional). | `220501096` |
| **3** | **Competencia / Módulo** | `competencia_modulo` | Texto | **Sí** | Nombre de la asignatura, módulo o competencia pedagógica. Agrupa los RAPs para calcular el avance modular. | `Desarrollo Web Fullstack` |
| **4** | **Descripción del RAP** | `descripcion_rap` | Texto largo | **Sí** | Declaración explícita del aprendizaje u objetivo formativo que el estudiante debe evidenciar y dominar. | `Construir la interfaz gráfica según requerimientos del cliente.` |
| **5** | **Horas Curriculares** | `horas` / `horas_creditos` | Numérico entero | **Sí** | Carga horaria asignada al RAP. Permite calcular el **avance ponderado real** frente al total del programa (ej. 1.120 h). | `40`, `60`, `20` |
| **6** | **Fase Curricular** | `fase` / `fase_proyecto` | Texto | No | Etapa metodológica del programa (ej. Análisis, Planeación, Ejecución, Evaluación) para análisis cronológico. | `Fase 1: Análisis` |
| **7** | **Estado del Juicio** | `estado` / `juicio_evaluativo`| Texto | **Sí** | Juicio formativo oficial emitido frente al resultado evaluado (`Aprobado`, `Por Mejorar`, `Pendiente`, `No Evaluado`). | `Aprobado` |
| **8** | **Fecha de Evaluación** | `fecha_evaluacion` | Fecha (`YYYY-MM-DD` o `DD/MM/AAAA`) | No | Sello temporal de emisión del juicio; permite graficar la curva histórica de aprendizaje en el tiempo. | `2026-04-15` |
| **9** | **Instructor / Docente**| `instructor_evaluador` | Texto | No | Nombre del instructor responsable de impartir el módulo y calificar la evidencia de aprendizaje. | `Ing. Roberto Torres` |
| **10**| **Observaciones** | `observaciones` | Texto largo | No | Retroalimentación cualitativa detallando fortalezas, no conformidades o evidencias pendientes. | `Cumple con la arquitectura MVC solicitada.` |

### 2.2 Reglas de Validación al Cargar el Archivo
El motor en PHP aplicará las siguientes validaciones durante la ingesta:
1. **Detección Flexible de Cabeceras (Tolerancia Sintáctica):**
   - El sistema normalizará nombres de cabeceras convirtiéndolas a minúsculas y omitiendo tildes y caracteres especiales (por ejemplo: `DESCRIPCIÓN`, `descripcion`, `Descripcion_RAP` se mapean al mismo campo).
2. **Validación de Integridad de Filas:**
   - Filas sin descripción o sin competencia serán marcadas con advertencia.
   - Si el `id_rap` está ausente, el sistema auto-generará un identificador secuencial `RAP-AUTO-[N]`.
   - Si la columna `horas` no es numérica o está vacía, se asignará un valor por defecto configurable (por defecto: `20` horas) notificando al usuario.
3. **Normalización Semántica del Estado (Juicio Evaluativo):**
   - **`Aprobado`**: acepta variaciones como `'aprobado'`, `'superado'`, `'aprobada'`, `'a'`, `'si'`, `'1'`, `'pass'`.
   - **`Por Mejorar`**: acepta variaciones como `'por mejorar'`, `'no aprobado'`, `'d'`, `'deficiente'`, `'observacion'`, `'reprobo'`.
   - **`Pendiente`**: acepta `'pendiente'`, `'en proceso'`, `'en revision'`, `'por evaluar'`, `'evaluando'`.
   - **`No Evaluado`**: celdas vacías, `null`, `'no evaluado'`, `'n/a'`, `'-'`, `'futuro'`.
4. **Validación de Formato de Archivo:**
   - Se validan extensiones permitidas: `.xlsx`, `.xls` y `.csv`. Tamaño máximo permitido: 15 MB.

---

## 3. MOTOR DE PROCESAMIENTO Y REGLAS DE NEGOCIO

### 3.1 Definición Semántica de los Estados
- **Aprobado:** El estudiante demostró dominio completo de las evidencias de conocimiento, desempeño y producto requeridas por el resultado de aprendizaje. **Suma el 100% de las horas del RAP al acumulado formativo**.
- **Por Mejorar (Alerta Crítica):** El estudiante presentó evidencias pero no alcanzaron el nivel de suficiencia técnica o pedagógica requerido. **No suma horas** y genera una alerta visual prioritaria en el dashboard para solicitar plan de mejoramiento o reevaluación.
- **Pendiente (En Proceso):** El RAP está en curso o el docente aún no ha registrado el juicio definitivo. **No penaliza como alerta crítica, pero no suma horas de aprobación**.
- **No Evaluado:** Corresponde a resultados de fases curriculares futuras que aún no han sido impartidas. Se excluye del cálculo de deficiencia académica.

### 3.2 Fórmulas Matemáticas de Avance

#### A. Avance Nominal por Conteo (Número de RAPs)
Mide la cantidad bruta de resultados superados frente al catálogo total:
$$\text{Avance Nominal (\%)} = \left( \frac{\text{Total de RAPs Aprobados}}{\text{Total de RAPs Registrados en el Programa}} \right) \times 100$$

#### B. Avance Ponderado por Horas (Indicador Oficial de Certificación)
Mide el progreso real teniendo en cuenta el peso crediticio u horario de cada resultado:
$$\text{Avance Ponderado (\%)} = \left( \frac{\sum \text{Horas de RAPs con Estado 'Aprobado'}}{\sum \text{Horas Totales Curriculares del Programa}} \right) \times 100$$
*Ejemplo:* Si el programa tiene 1.120 horas y los RAPs aprobados suman 840 horas:
$$\text{Avance Ponderado} = \left(\frac{840}{1120}\right) \times 100 = 75.0\%$$

#### C. Avance Modular / Por Competencia
Permite evaluar el nivel de cumplimiento individual de cada asignatura o competencia:
$$\text{Avance de la Competencia } C_i \text{ (\%)} = \left( \frac{\sum \text{Horas Aprobadas de } C_i}{\sum \text{Horas Totales de } C_i} \right) \times 100$$

#### D. Índice de Criticidad Formativa ($I_c$)
Indica qué porcentaje de los resultados ya evaluados han resultado reprobados o deficientes:
$$I_c = \left( \frac{\text{Total RAPs 'Por Mejorar'}}{\text{Total RAPs Evaluados ('Aprobados' + 'Por Mejorar')}} \right) \times 100$$
- **$I_c \le 5\%$:** Estado **Óptimo** (Bajo Riesgo).
- **$5\% < I_c \le 15\%$:** Estado de **Atención** (Riesgo Moderado - Requiere Seguimiento).
- **$I_c > 15\%$:** Estado de **Alerta Crítica** (Riesgo Alto - Requiere Comité o Plan de Choque Inmediato).

#### E. Tasa de Cobertura Curricular Evaluada ($T_c$)
Indica qué proporción del currículo ya ha sido abordado y calificado:
$$T_c = \left( \frac{\text{RAPs Aprobados} + \text{RAPs Por Mejorar} + \text{RAPs Pendientes}}{\text{Total de RAPs}} \right) \times 100$$

---

## 4. DASHBOARD INTERACTIVO Y EXPERIENCIA DE USUARIO (UI/UX)

### 4.1 Indicadores Clave Inmediatos (Top KPIs)
Al ingresar o tras cargar el archivo, el usuario debe visualizar instantáneamente cuatro tarjetas de métricas en la parte superior:
1. **Avance Ponderado Global (% y Horas):** Porcentaje general con barra de progreso estilizada y etiqueta de horas (ej. `840 / 1.120 Horas`).
2. **Resultados Aprobados:** Conteo de RAPs aprobados y porcentaje nominal (ej. `36 de 48 RAPs - 75%`).
3. **Resultados Por Mejorar (Alerta):** Conteo de RAPs críticos que requieren plan de mejoramiento inmediato (ej. `4 RAPs`).
4. **Resultados Pendientes / En Proceso:** Conteo de RAPs en revisión o no iniciados (ej. `8 RAPs`).

### 4.2 Visualizaciones Requeridas
1. **Gráfico de Cumplimiento por Competencia / Módulo (Barras Horizontales o Gráfico de Radar):**
   - Desglose del porcentaje de avance en cada competencia.
   - Código de colores: Verde ($\ge 80\%$), Amarillo ($50\% - 79\%$), Rojo ($< 50\%$).
2. **Gráfico Circular / Dona de Distribución de Juicios:**
   - Muestra la proporción visual de los 4 estados: Aprobado (Verde esmeralda), Por Mejorar (Rojo carmesí), Pendiente (Ámbar), No Evaluado (Gris pizarra).
3. **Curva de Avance Longitudinal en el Tiempo:**
   - Gráfico lineal o de área mostrando el ritmo acumulativo de RAPs aprobados por mes.
4. **Matriz Detallada de Resultados (Tabla Interactiva):**
   - Tabla paginada y responsiva con todas las columnas del archivo cargado.
   - Badges visuales de estado.
   - Barra de búsqueda reactiva (filtra por texto en ID, competencia o descripción).
   - Filtros desplegables por Competencia, Fase y Estado del Juicio.
5. **Modal / Drawer de Detalle de RAP:**
   - Al hacer clic en cualquier fila de la tabla, se abre un modal con la información exhaustiva del RAP: descripción completa, instructor, fecha, observaciones pedagógicas y opción para simular reevaluación.

### 4.3 Interacciones y Acciones Disponibles
- **Carga Drag & Drop:** Zona interactiva para arrastrar y soltar el archivo Excel o CSV, con barra de progreso y resumen inmediato de diagnóstico.
- **Descarga de Plantilla de Ejemplo:** Botón para generar y descargar un archivo Excel/CSV prediseñado con datos de muestra para que el usuario conozca la estructura esperada.
- **Filtros Dinámicos Combinables:** Filtrar simultáneamente por estado ("Por Mejorar") y por competencia específica.
- **Exportación de Reporte:** Botón para imprimir o exportar a PDF el informe de estado formativo para comités de evaluación.

---

## 5. USUARIOS, DISPOSITIVOS Y ENTORNO DE USO

### 5.1 Perfiles de Usuario
1. **Aprendiz / Estudiante:**
   - *Objetivo:* Conocer su situación académica real, identificar qué evidencias le faltan para graduarse y preparar planes de mejoramiento antes del cierre de periodo.
   - *Frecuencia:* Semanal o al finalizar cada entrega de proyecto.
2. **Instructor / Tutor de Área:**
   - *Objetivo:* Monitorear el progreso de su ficha o grupo, detectar aprendices con RAPs no aprobados y registrar observaciones pedagógicas.
   - *Frecuencia:* Diaria o semanal durante periodos de calificación.
3. **Coordinador Académico / Subdirector:**
   - *Objetivo:* Evaluar el rendimiento global del programa de formación, cumplimiento de metas de certificación y carga horaria evaluada.
   - *Frecuencia:* Quincenal o mensual en comités de seguimiento.

### 5.2 Dispositivos y Resoluciones
- **Computador de Escritorio y Portátil (Desktop/Laptop):** Pantallas principales de 1366x768 px hasta 1920x1080 px y superiores (experiencia óptima para análisis de tablas y dashboards multidimensionales).
- **Tablets y Dispositivos Móviles:** Diseño responsive adaptativo (rejilla fluida, tarjetas apiladas y scroll horizontal en tablas extensas).

### 5.3 Modelo de Acceso y Despliegue Local
- **Entorno Local XAMPP:** La aplicación corre sobre el servidor web Apache local (`http://localhost/controlaprendizraps`) y PHP 8.x.
- **Modo de Acceso:**
  - *Modo Local Autónomo:* No requiere conexión a internet obligatoria una vez instaladas las dependencias estáticas (CSS/JS locales o descargados).
  - *Sesiones PHP:* Permite mantener el estado del archivo cargado en memoria de sesión o persistirlo en almacenamiento local del navegador (`localStorage`) para que el usuario no pierda su visualización al recargar la página.

---

## 6. REQUERIMIENTOS NO FUNCIONALES (RNF)

| Categoría | Requerimiento | Métrica / Criterio de Verificación |
|---|---|---|
| **RNF-01: Rendimiento** | Tiempo de procesamiento de archivo | La lectura y cálculo de un archivo de 500 filas debe completarse en menos de **1.5 segundos**. Para archivos de hasta 5.000 filas, en menos de **3 segundos**. |
| **RNF-02: Tiempo de Respuesta UI** | Interactividad y filtrado | El filtrado de la tabla y la actualización de los gráficos debe ser reactivo e instantáneo (**< 150 ms**). |
| **RNF-03: Compatibilidad** | Navegadores web modernos | Soporte completo para Google Chrome, Microsoft Edge, Mozilla Firefox y Safari (versiones de los últimos 2 años). |
| **RNF-04: Plataforma Servidor** | Entorno XAMPP | Compatible con Apache 2.4+ y PHP 8.1 / 8.2 / 8.3 sobre Windows 10/11 sin necesidad de extensiones no estándar. |
| **RNF-05: Privacidad de Datos** | Tratamiento local-first | Los datos de aprendices y notas se procesan y almacenan en el entorno local (Apache/XAMPP o memoria del cliente). Cero transmisión de datos hacia servidores en la nube no autorizados. |
| **RNF-06: Usabilidad** | Interfaz moderna e intuitiva | Diseño limpio, tipografía legible (Inter/Segoe UI), contraste según estándar WCAG 2.1 AA, paleta de colores institucional con semáforo formativo. |
| **RNF-07: Resiliencia de Entrada** | Manejo de errores de carga | En caso de cargar un archivo con formato inválido o columnas faltantes, la aplicación debe mostrar un mensaje explicativo claro indicando qué columna falta o qué fila causó el fallo. |

---

## 7. ALCANCE DEL PROYECTO

### 7.1 En el Alcance de la Versión 1.0 (MVP Local en PHP + XAMPP)
- [x] Módulo de carga de archivos Excel (`.xlsx`, `.xls`) y archivos `.csv`.
- [x] Motor de sanitización de datos y normalización de estados en PHP y JavaScript.
- [x] Cálculo exacto de avance nominal (%), ponderado por horas (%) y modular por competencia.
- [x] Dashboard interactivo con 4 KPIs principales y gráficos de progreso (Chart.js).
- [x] Matriz de RAPs interactiva con búsqueda en tiempo real y filtros por estado y competencia.
- [x] Modal de detalle de cada resultado de aprendizaje con notas y observaciones.
- [x] Generador y descargador de plantilla Excel/CSV para el usuario.
- [x] Despliegue y sincronización completa en la carpeta `htdocs` de XAMPP para ejecución local.
- [x] Visor interactivo integrado de este documento de requerimientos dentro de la propia plataforma.

### 7.2 Fuera del Alcance (Fases Futuras - Versión 2.0+)
- Conexión directa vía Web Scraping o API oficial con sistemas cerrados de gestión académica (ej. SOFIA Plus, Territorium, Blackboard).
- Envío automatizado de correos electrónicos a aprendices con alertas de rezago.
- Módulo de firma digital o generación de certificados con código QR verificable en blockchain.
- Aplicación móvil nativa para Android / iOS.

---

## 8. CRITERIOS DE ACEPTACIÓN (BDD / GHERKIN)

### CA-01: Carga y Procesamiento Exitoso de Archivo
- **Dado** que el usuario se encuentra en la pantalla de carga del sistema en `http://localhost/...`,
- **Cuando** selecciona o arrastra un archivo `.xlsx` o `.csv` que contiene las columnas obligatorias (`id_rap`, `competencia_modulo`, `descripcion_rap`, `horas`, `estado`),
- **Entonces** el sistema debe procesar el archivo en menos de 2 segundos, emitir un mensaje de confirmación con el total de registros detectados, y redirigir inmediatamente al dashboard mostrando los indicadores calculados.

### CA-02: Manejo de Inconsistencias en los Juicios Evaluativos
- **Dado** un archivo Excel que contiene estados en minúscula (`aprobado`), sin tilde (`si`) o con espacios adicionales,
- **Cuando** el sistema procesa el lote,
- **Entonces** debe normalizarlos automáticamente a `'Aprobado'`, sumando sus horas al total acumulado y reportando el conteo de filas normalizadas en la bitácora de carga.

### CA-03: Precisión del Cálculo Ponderado
- **Dado** un programa con 1.120 horas totales y un conjunto de RAPs aprobados que suman exactamente 560 horas,
- **Cuando** se genera el dashboard,
- **Entonces** el indicador de Avance Ponderado debe mostrar exactamente `50.0%`, independientemente del número nominal de RAPs.

### CA-04: Detección y Alerta de RAPs "Por Mejorar"
- **Dado** un aprendiz que tiene 3 RAPs con juicio `'Por Mejorar'`,
- **Cuando** se visualiza el dashboard,
- **Entonces** la tarjeta de alerta debe resaltar en color rojo con el número `3`, y al hacer clic en ella, la tabla de resultados debe filtrarse automáticamente para mostrar únicamente dichos 3 RAPs en riesgo.

### CA-05: Descarga de Plantilla
- **Dado** un usuario nuevo sin archivo estructurado,
- **Cuando** hace clic en el botón *"Descargar Plantilla Excel/CSV"*,
- **Entonces** el navegador debe iniciar de inmediato la descarga de un archivo con las cabeceras requeridas y 3 filas de ejemplo prellenadas.

---

## 9. SUPUESTOS Y PREGUNTAS ABIERTAS PARA CONFIRMACIÓN

### 9.1 Supuestos Adoptados
1. **Regla de Ponderación:** Se asume que las horas curriculares son la métrica oficial de ponderación del avance (si no se proporciona horas, se asume un valor neutro de 20 horas por RAP).
2. **Juicio Binario de Superación:** Para el avance acumulado, únicamente el estado `Aprobado` suma horas; `Por Mejorar`, `Pendiente` y `No Evaluado` aportan 0% de avance en el acumulado.
3. **Persistencia Local:** Los datos cargados se mantienen en la sesión activa del navegador o sesión PHP local sin necesidad de configurar bases de datos complejas para el uso individual básico.
4. **Entorno XAMPP:** Se asume que XAMPP está instalado en la ruta estándar `C:\xampp\` con el servicio Apache activo en el puerto 80.

### 9.2 Preguntas Abiertas para Decisión del Usuario
1. *¿Deseas que los datos cargados se guarden en una base de datos MySQL local (vía phpMyAdmin de XAMPP) para consultar el historial de múltiples cortes, o prefieres un procesador puramente en memoria/sesión sin dependencias de base de datos?*
2. *¿El archivo Excel original que utilizas contiene el consolidado de un solo estudiante, o contiene una matriz de muchos estudiantes con múltiples filas? (Esta versión modela el avance formativo del aprendiz individual o la ficha seleccionada).*
3. *¿Requieres que el sistema exporte un certificado en PDF con membrete institucional al alcanzar el 100% de los RAPs aprobados?*

---
*Fin de la Especificación de Requerimientos de Software (SRS v1.0)*
