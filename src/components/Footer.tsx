import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full mt-space-xl py-space-lg border-t border-glass-border-light bg-surface-container-lowest/40">
      <div className="max-w-[1600px] mx-auto px-margin-mobile lg:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant text-xs">
        <div className="flex items-center gap-space-sm flex-wrap justify-center">
          <span className="font-semibold text-on-surface">EduTrack Analytics Engine</span>
          <span>•</span>
          <span>Ambiente de Seguimiento Formativo de Precisión</span>
          <span>•</span>
          <span className="text-status-approved">Arquitectura Local-First (Habeas Data)</span>
        </div>
        <div className="flex items-center gap-space-lg text-outline">
          <span>v2.4.0 High-Fidelity Glass</span>
          <span>© 2026 Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  );
};
