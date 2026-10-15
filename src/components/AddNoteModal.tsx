import React, { useState } from 'react';
import { RAPItem } from '../types/rap';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rap: RAPItem | null;
  onSaveNote: (rapId: string, noteTitle: string, noteBody: string) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, rap, onSaveNote }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  if (!isOpen || !rap) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSaveNote(rap.id, title, body);
    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-xl">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low/95 border border-glass-border-light p-space-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-glass-border-light">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">add_comment</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Registrar Observación en {rap.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div>
            <label className="block text-label-sm font-semibold uppercase text-outline mb-1">
              Título o Tipo de Observación
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Revisión de Refactorización / Nivelación Técnica"
              className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-glass-border-light text-on-surface placeholder:text-outline text-body-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold uppercase text-outline mb-1">
              Detalle Pedagógico o Retroalimentación
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Detalla los puntos específicos a corregir o los logros constatados en la evidencia..."
              className="w-full p-3 rounded-xl bg-surface-container-lowest border border-glass-border-light text-on-surface placeholder:text-outline text-body-sm focus:outline-none focus:border-primary resize-none"
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-label-md hover:bg-surface-container-highest transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:brightness-110 transition-all shadow-md"
            >
              Guardar Observación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
