import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rapsDataPath = path.join(__dirname, '..', 'data', 'default_raps.json');
const raps = JSON.parse(fs.readFileSync(rapsDataPath, 'utf8'));

const header = 'id_rap,codigo_competencia,competencia_modulo,descripcion_rap,horas,fase,estado,fecha_evaluacion,instructor_evaluador,observaciones\n';

const rows = raps.map(r => {
  const fields = [
    r.id || '',
    r.code || '',
    r.competency || '',
    (r.description || '').replace(/"/g, '""'),
    r.hours || 0,
    r.phase || '',
    r.status || 'No Evaluado',
    r.evaluationDate || '',
    r.evaluator || '',
    (r.evaluatorFeedback || '').replace(/"/g, '""')
  ];
  return fields.map(f => `"${f}"`).join(',');
});

const fullCsv = header + rows.join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'datos_muestra_adso_48_raps.csv'), fullCsv, 'utf8');

// Also create a clean template with 4 sample rows
const templateRows = rows.slice(0, 4);
const templateCsv = header + templateRows.join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'plantilla_resultados_aprendizaje.csv'), templateCsv, 'utf8');

console.log('Successfully generated sample CSVs!');
