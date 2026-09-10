import { useState, useMemo, MouseEvent, FormEvent } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { Chamado, Priority, TicketStatus, User } from '../types';
import { TicketsTable } from './TicketsTable';

interface MechanicViewProps {
  user: User;
  chamados: Chamado[];
  onSelectTicket: (ticket: Chamado) => void;
  onStartMaintenance: (ticketId: string) => Promise<void>;
  onOpenCloseModal: (ticket: Chamado) => void;
  isSupabaseConnected?: boolean;
  onQuickCloseTicket?: (params: {
    ticketId: string;
    resolutionNotes: string;
    replacedParts: string;
    downtimeMinutes: number;
  }) => Promise<void>;
}

export function MechanicView({
  user,
  chamados,
  onSelectTicket,
  onStartMaintenance,
  onOpenCloseModal,
  onQuickCloseTicket,
}: MechanicViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Quick resolution form state
  const [quickResolution, setQuickResolution] = useState('');
  const [quickParts, setQuickParts] = useState('');
  const [quickDowntime, setQuickDowntime] = useState(30);
  const [isQuickClosing, setIsQuickClosing] = useState(false);

  // Metrics
  const metrics = useMemo(() => {
    const abertos = chamados.filter((c) => c.status === 'aberto').length;
    const andamento = chamados.filter((c) => c.status === 'em_atendimento').length;
    const encerrados = chamados.filter((c) => c.status === 'encerrado').length;
    const criticos = chamados.filter(
      (c) => (c.priority === 'urgente' || c.priority === 'alta') && c.status !== 'encerrado'
    ).length;

    return { abertos, andamento, encerrados, criticos, total: chamados.length };
  }, [chamados]);

  // Selected ticket for the mechanic fast resolution box
  const selectedTicket = useMemo(() => {
    if (selectedTicketId) {
      const found = chamados.find((c) => c.id === selectedTicketId);
      if (found) return found;
    }
    // Default to first in-progress or first open ticket
    return (
      chamados.find((c) => c.status === 'em_atendimento') ||
      chamados.find((c) => c.status === 'aberto') ||
      chamados[0] ||
      null
    );
  }, [chamados, selectedTicketId]);

  const handleStartTicketFromQuickPanel = async (ticketId: string) => {
    try {
      await onStartMaintenance(ticketId);
      setSelectedTicketId(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCloseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !quickResolution.trim()) return;

    if (onQuickCloseTicket) {
      setIsQuickClosing(true);
      try {
        await onQuickCloseTicket({
          ticketId: selectedTicket.id,
          resolutionNotes: quickResolution.trim(),
          replacedParts: quickParts.trim(),
          downtimeMinutes: quickDowntime,
        });
        setQuickResolution('');
        setQuickParts('');
      } finally {
        setIsQuickClosing(false);
      }
    } else {
      onOpenCloseModal(selectedTicket);
    }
  };

  return (
    <div className="space-y-5">
      {/* High Density Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Aguardando Atendimento
            </span>
            <span className="text-xl font-bold font-mono text-blue-600">{metrics.abertos}</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
            FILA
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Em Manutenção Ativa
            </span>
            <span className="text-xl font-bold font-mono text-amber-600">{metrics.andamento}</span>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
            REPARO
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Críticos / Alta Prioridade
            </span>
            <span className="text-xl font-bold font-mono text-red-600">{metrics.criticos}</span>
          </div>
          <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded">
            URGENTE
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Ordens Concluídas
            </span>
            <span className="text-xl font-bold font-mono text-green-600">{metrics.encerrados}</span>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">
            LAUDOS
          </span>
        </div>
      </div>

      {/* Main 12-Column High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Technical Queue Table */}
        <div className="lg:col-span-8">
          <TicketsTable
            chamados={chamados}
            currentUser={user}
            onSelectTicket={(t) => {
              setSelectedTicketId(t.id);
              onSelectTicket(t);
            }}
            onStartMaintenance={onStartMaintenance}
            onOpenCloseModal={onOpenCloseModal}
            customTitle="Fila Técnica: Ordens de Serviço & Encerramento"
          />
        </div>

        {/* Right 4 Cols: Mechanic Fast Action / Resolution Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-white">
            <h3 className="text-sm font-bold mb-3.5 flex items-center gap-2 uppercase tracking-tight text-blue-400">
              <span className="w-2 h-4 bg-blue-400 rounded-sm"></span>
              Painel de Encerramento do Mecânico
            </h3>

            {selectedTicket ? (
              <form onSubmit={handleQuickCloseSubmit} className="space-y-3">
                {/* Selected Ticket Preview */}
                <div className="p-3 bg-slate-800 rounded border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Chamado em Foco</p>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {selectedTicket.protocol}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-300 truncate">
                    {selectedTicket.equipment} - {selectedTicket.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Solicitante: <strong className="text-slate-200">{selectedTicket.operator_name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/60 p-1.5 rounded">
                    "{selectedTicket.description}"
                  </p>
                </div>

                {selectedTicket.status === 'aberto' ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-slate-300">
                      Este chamado está na fila aguardando início do atendimento.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartTicketFromQuickPanel(selectedTicket.id)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs uppercase tracking-widest cursor-pointer shadow transition-colors"
                    >
                      Iniciar Atendimento Técnico
                    </button>
                  </div>
                ) : selectedTicket.status === 'em_atendimento' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Resolução Executada (O que foi feito) *
                      </label>
                      <textarea
                        required
                        value={quickResolution}
                        onChange={(e) => setQuickResolution(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs h-20 text-white focus:ring-1 focus:ring-blue-400 outline-none resize-none leading-relaxed"
                        placeholder="Ex: Realizada troca do rolamento e calibração do sensor de pressão..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Peças / Componentes Trocados
                      </label>
                      <input
                        type="text"
                        value={quickParts}
                        onChange={(e) => setQuickParts(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-400 outline-none"
                        placeholder="Ex: Rolamento 6205, Retentor..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isQuickClosing}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs uppercase tracking-widest cursor-pointer shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isQuickClosing ? 'Encerrando...' : 'Encerrar Chamado'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCloseModal(selectedTicket)}
                        title="Formulário completo com parada de máquina"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer"
                      >
                        Opções
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1" />
                      Chamado finalizado por {selectedTicket.mechanic_name || 'Mecânico'}.
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectTicket(selectedTicket)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Visualizar Laudo Técnico
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <p className="text-xs text-slate-400">Nenhum chamado ativo selecionado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
