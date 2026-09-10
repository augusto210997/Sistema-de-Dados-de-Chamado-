import React, { useState } from 'react';
import { X, CheckCircle2, Wrench, Clock, Layers, AlertCircle, FileCheck } from 'lucide-react';
import { Chamado } from '../types';

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Chamado | null;
  mechanicName: string;
  mechanicId: string;
  onConfirmClose: (params: {
    ticketId: string;
    resolutionNotes: string;
    replacedParts: string;
    downtimeMinutes: number;
  }) => Promise<void>;
}

export function CloseTicketModal({
  isOpen,
  onClose,
  ticket,
  mechanicName,
  mechanicId,
  onConfirmClose,
}: CloseTicketModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [replacedParts, setReplacedParts] = useState('');
  const [downtimeMinutes, setDowntimeMinutes] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setErrorMsg('Por favor, descreva o que foi feito para solucionar a falha.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirmClose({
        ticketId: ticket.id,
        resolutionNotes: resolutionNotes.trim(),
        replacedParts: replacedParts.trim(),
        downtimeMinutes: Number(downtimeMinutes) || 0,
      });
      setResolutionNotes('');
      setReplacedParts('');
      setDowntimeMinutes(30);
      onClose();
    } catch (err) {
      console.error('Erro ao encerrar chamado:', err);
      setErrorMsg('Falha ao registrar encerramento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span>Encerrar Chamado Técnico</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                  {ticket.protocol}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Mecânico: <span className="text-slate-800 font-bold">{mechanicName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ticket Context Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{ticket.equipment} - {ticket.title}</span>
              <span className="text-slate-500 text-[11px]">{ticket.sector}</span>
            </div>
            <p className="text-slate-600 text-[11px] italic bg-white p-2 rounded border border-slate-200">
              "{ticket.description}"
            </p>
          </div>

          {/* Descrever o que foi feito */}
          <div>
            <label
              htmlFor="resolution-notes"
              className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              Laudo Técnico / Descreva o que foi feito para solucionar o problema *
            </label>
            <textarea
              id="resolution-notes"
              required
              rows={4}
              placeholder="Ex: Realizada desmontagem do mancal dianteiro, identificado desgaste por fadiga no rolamento 6205. Efetuada limpeza da caixa de engrenagens, substituição dos retentores e lubrificação com graxa sintética EP2. Máquina testada em ciclo contínuo sem vibração."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:ring-2 focus:ring-green-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Peças Substituídas */}
          <div>
            <label
              htmlFor="replaced-parts"
              className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Peças / Componentes Substituídos (Opcional)
            </label>
            <input
              id="replaced-parts"
              type="text"
              placeholder="Ex: 01x Rolamento SKF 6205-2RS, 02L Óleo Hidráulico ISO 68..."
              value={replacedParts}
              onChange={(e) => setReplacedParts(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Tempo de Intervenção */}
          <div>
            <label
              htmlFor="downtime-minutes"
              className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Tempo Total de Intervenção / Reparo (Minutos)
            </label>
            <div className="flex items-center gap-2.5">
              <input
                id="downtime-minutes"
                type="number"
                min="5"
                max="1440"
                step="5"
                value={downtimeMinutes}
                onChange={(e) => setDowntimeMinutes(Number(e.target.value))}
                className="w-28 px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-green-500 outline-none"
              />
              <span className="text-xs text-slate-500">
                (~{(downtimeMinutes / 60).toFixed(1)} horas de parada técnica)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              id="btn-confirm-close-ticket"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Salvando Laudo...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmar & Encerrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
