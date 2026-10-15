import React from 'react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvedHours: number;
  totalHours: number;
  criticalIndex: number;
  fichaId: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  approvedHours,
  criticalIndex,
  fichaId,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-xl">
      <div className="relative w-full max-w-3xl rounded-3xl bg-surface-container-low/95 border border-glass-border-light p-space-lg sm:p-space-xl shadow-2xl overflow-hidden">
        {/* Decorative subtle aura within container */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-glass-border-light">
          <div className="flex items-center gap-space-sm">
            <div className="p-2.5 rounded-2xl bg-secondary/15 text-secondary">
              <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">
                Generador de Documento Oficial
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Certificado de Cumplimiento Curricular</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Certificate Preview Box */}
        <div className="rounded-2xl bg-surface-container-lowest/90 p-space-lg mb-space-lg space-y-space-md relative overflow-hidden border border-glass-border-light print-only">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                className="h-10 w-10 object-contain rounded-lg bg-surface-container p-1"
                alt="Emblema de certificación técnica institucional y escudo académico oficial"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDROxDob-5IPma04xxnFQ2Tm5moVvglZuJkuPQ4g6HEx8ayUkk3mUnVzln6HHhl1GGUZEPl0xLmBUZbOvo_0gyePwCJ3JVaHIB1C84tJHx4kuKtA6BYTRErkR5dYI1bfF5DGiFnkCJF91F_pPphc09M2DpvHxm-X2cEKJ7rxoETWuZoe4kEG-vsS3MH39ilb0ShqQG8yRwFDRJw2EDKLR-Olhr4sTA78MGmU0D-Srg8dK0qvq2kbWkemA"
              />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Sistema Nacional de Formación Profesional
              </span>
            </div>
            <span className="font-mono text-xs text-status-approved font-semibold">FOLIO: CERT-2026-ADSO-8492</span>
          </div>

          <div className="text-center py-space-sm">
            <p className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider mb-1">
              Se deja constancia fehaciente que la cohorte formativa:
            </p>
            <h4 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1 font-bold">
              {fichaId.toUpperCase()}
            </h4>
            <p className="font-body-md text-body-md text-secondary font-medium">
              Análisis y Desarrollo de Software • Modalidad Presencial / Dual
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 text-center rounded-xl bg-surface-container-high/60 border border-glass-border-light">
            <div>
              <span className="block font-label-sm text-label-sm text-outline">Horas Validadas</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{approvedHours} h</span>
            </div>
            <div>
              <span className="block font-label-sm text-label-sm text-outline">Índice Ic (Rezago)</span>
              <span className="font-headline-sm text-headline-sm text-status-approved font-bold">{criticalIndex}%</span>
            </div>
            <div>
              <span className="block font-label-sm text-label-sm text-outline">Dictamen</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">APTO FASE 2</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-label-sm text-label-sm text-outline pt-2 gap-2">
            <span>
              Expedido digitalmente por: <strong className="text-on-surface">Dra. Carolina Méndez</strong> (Líder)
            </span>
            <span className="font-mono text-xs text-secondary">Sello Criptográfico: SHA-256 Validado</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm no-print">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-space-lg py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
            type="button"
          >
            Cerrar Previsualización
          </button>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-label-md text-label-md font-semibold shadow-lg shadow-secondary-container/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Descargar Certificado Firmado (.PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
