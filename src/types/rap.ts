export type RAPStatus = 'Aprobado' | 'Por Mejorar' | 'Pendiente' | 'No Evaluado';

export interface RAPHistoryItem {
  id: string;
  title: string;
  note: string;
  date: string;
  status: RAPStatus;
  author: string;
}

export interface RAPItem {
  id: string; // e.g. "RAP-01"
  code?: string; // e.g. "220501096-01"
  competency: string; // e.g. "Desarrollo Web"
  description: string;
  hours: number;
  phase: 'Fase 1' | 'Fase 2' | 'Fase 3';
  status: RAPStatus;
  evaluationDate?: string;
  evaluator: string;
  evaluatorRole: string;
  evaluatorFeedback?: string;
  history: RAPHistoryItem[];
  priority?: 'high' | 'normal' | 'low';
}

export interface IngestionLog {
  id: string;
  filename: string;
  sheetName: string;
  fileSize: string;
  sha256: string;
  auditor: string;
  auditorInitials: string;
  totalRecords: number;
  approvedRecords: number;
  validationStatus: string;
  isBaseLine?: boolean;
  normalizedCount: number;
  timestamp: string;
}

export interface BatchDiagnostic {
  totalRecords: number;
  validRecords: number;
  sanitizedWarnings: number;
  duplicateIds: number;
  memoryUsageMb: number;
  processingTimeSec: number;
  integrityPercent: number;
}
