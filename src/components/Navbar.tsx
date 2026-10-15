import React from 'react';

export type NavTab = 'dashboard' | 'upload' | 'matrix' | 'reports';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSrs: () => void;
  selectedFicha: string;
  onSelectFicha: (ficha: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSrs,
  selectedFicha,
  onSelectFicha,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40">
      <div className="h-20 max-w-[1600px] mx-auto px-4 lg:px-10 flex items-center justify-between">
        <div className="w-full flex items-center justify-between backdrop-blur-xl bg-slate-900/60 rounded-2xl border border-glass-border-light shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] px-4 sm:px-6 py-2">
          {/* Zone 1: Brand & Status */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
            >
              <img
                alt="EduTrack Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XXYb5ceVaF2xOokqDn7V5r3YXCXRzqb0Wvw33fOsROLQXC3xeO0qjnPMyXJnQDnL-njV35gfWhPoCezP6aIZ-YpSXvsaIDiZTcOpaKga9Ev28jjRTc6zlGWDTFuUfsFC2a5tSMwWF5-dHAgO_THH9yDfyIsuNf47cUvrqWhdaLn5GJODSVkpl-MYwsa43sk9mZ1H7zy6GkaOoZqpoVE65RKY31Lzp1jOs2wYXplBJVBRkMepq-HMJcGrZB"
              />
              <div className="flex flex-col">
                <span className="font-headline font-bold text-base tracking-tight text-on-surface">EduTrack</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Analytics</span>
              </div>
            </button>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-approved/10 border border-status-approved/30 text-status-approved">
              <span className="w-2 h-2 rounded-full bg-status-approved animate-pulse"></span>
              <span className="text-[11px] font-semibold tracking-wide">En Línea / Local-First</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              Dashboard Principal
            </button>
            <button
              onClick={() => onSelectTab('upload')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'upload'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              Carga de Archivo Excel
            </button>
            <button
              onClick={() => onSelectTab('matrix')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'matrix'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              Matriz de RAPs
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'reports'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              Reportes y Auditoría
            </button>

            {/* SRS Documentation Trigger */}
            <button
              onClick={onOpenSrs}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/20 transition-all ml-1 border border-secondary/25"
              title="Abrir Documento Formal de Requerimientos SRS"
            >
              <span className="material-symbols-outlined text-[17px]">description</span>
              <span className="hidden lg:inline">Ver SRS</span>
            </button>
          </nav>

          {/* Zone 3: Ficha Selector & User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center rounded-xl bg-surface-container-high/70 border border-glass-border-light px-3 py-1.5">
              <span className="material-symbols-outlined text-outline mr-2 text-[18px]">school</span>
              <select
                value={selectedFicha}
                onChange={(e) => onSelectFicha(e.target.value)}
                className="bg-transparent text-xs text-on-surface border-none focus:outline-none cursor-pointer pr-1 font-semibold"
              >
                <option className="bg-surface-container text-on-surface" value="Ficha: 2670189 - ADSO">
                  Ficha: 2670189 - ADSO
                </option>
                <option className="bg-surface-container text-on-surface" value="Ficha: 2670190 - Redes">
                  Ficha: 2670190 - Redes
                </option>
                <option className="bg-surface-container text-on-surface" value="Ficha: 2670191 - Multimedia">
                  Ficha: 2670191 - Multimedia
                </option>
              </select>
            </div>

            <button
              onClick={onOpenSrs}
              aria-label="Notificaciones y Requerimientos"
              className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all"
              type="button"
              title="Alertas pedagógicas activas"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-status-improve border-2 border-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            </button>

            <div className="flex items-center gap-2.5 pl-1">
              <img
                alt="Profile Dra. Carolina Méndez"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvE-J3FSiK7hhl9jXOmkBbaERIzfpSX-bWTtPAOxzXWacAkSAOdBky-ZCbHFb3LNRIqGLwXusjPNrqEIgfzAvmt1u0tCIaemE796N6L_vBMWZI7qRecu1xK-HWpBrK6-Bla7kRe1cIRPHieQRyFfadTDtgH2TBhVJ-Ofq0tvdy8LkzOTbwH8MgQpferCRzM7pozig3xS0BOF0N_U_cgq5pjVv4mQrYCjj9UF457XqlQF9OwusoHqGdQg"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-on-surface leading-tight">Dra. Carolina Méndez</span>
                <span className="text-[10px] text-on-surface-variant leading-tight">Instructora Líder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Strip */}
      <div className="md:hidden flex items-center justify-around bg-surface-container-low/95 border-b border-glass-border-light px-2 py-2">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2 py-1 text-xs rounded-lg ${currentTab === 'dashboard' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('upload')}
          className={`px-2 py-1 text-xs rounded-lg ${currentTab === 'upload' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'}`}
        >
          Carga Excel
        </button>
        <button
          onClick={() => onSelectTab('matrix')}
          className={`px-2 py-1 text-xs rounded-lg ${currentTab === 'matrix' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'}`}
        >
          Matriz RAPs
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`px-2 py-1 text-xs rounded-lg ${currentTab === 'reports' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'}`}
        >
          Reportes
        </button>
        <button
          onClick={onOpenSrs}
          className="px-2 py-1 text-xs rounded-lg text-secondary font-bold bg-secondary/10"
        >
          SRS
        </button>
      </div>
    </header>
  );
};
