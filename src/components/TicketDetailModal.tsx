import { X, Wrench, HardHat, Clock, Calendar, CheckCircle2, AlertTriangle, Layers, Cpu, MapPin, Printer } from 'lucide-react';
import { Chamado, User } from '../types';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Chamado | null;
  currentUser: User;
  onStartMaintenance?: (ticketId: string) => Promise<void>;
  onOpenCloseModal?: (ticket: Chamado) => void;
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  currentUser,
  onStartMaintenance,
  onOpenCloseModal,
}: TicketDetailModalProps) {
  if (!isOpen || !ticket) return null;

  const isMechanic = currentUser.role === 'mecanico';
  const isClosed = ticket.status === 'encerrado';
  const isInProgress = ticket.status === 'em_atendimento';
  const isOpenStatus = ticket.status === 'aberto';

  const statusConfig = {
    aberto: {
      label: 'Em Aberto (Fila)',
      bg: 'bg-blue-100 text-blue-800',
      dot: 'bg-blue-600',
    },
    em_atendimento: {
      label: 'Em Atendimento Técnico',
      bg: 'bg-amber-100 text-amber-800',
      dot: 'bg-amber-600 animate-pulse',
    },
    encerrado: {
      label: 'Encerrado / Resolvido',
      bg: 'bg-green-100 text-green-800',
      dot: 'bg-green-600',
    },
    cancelado: {
      label: 'Cancelado',
      bg: 'bg-slate-100 text-slate-700',
      dot: 'bg-slate-500',
    },
  }[ticket.status];

  const priorityConfig = {
    baixa: { label: 'Baixa', badge: 'text-slate-600 bg-slate-100' },
    media: { label: 'Média', badge: 'text-amber-700 bg-amber-100' },
    alta: { label: 'Alta', badge: 'text-red-700 bg-red-100' },
    urgente: { label: 'Crítica / Urgente', badge: 'text-red-800 bg-red-200' },
  }[ticket.priority];

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:border-b-2 print:border-slate-300 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs print:hidden">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {ticket.protocol}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 mt-0.5 print:text-black">
                {ticket.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handlePrint}
              title="Imprimir Ordem de Serviço"
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible text-slate-900">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Equipamento</span>
              <span className="font-bold text-slate-900">{ticket.equipment}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Setor / Linha</span>
              <span className="font-bold text-slate-900">{ticket.sector}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Prioridade</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${priorityConfig.badge}`}>
                {priorityConfig.label}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Categoria</span>
              <span className="font-bold uppercase text-slate-800">{ticket.category}</span>
            </div>
          </div>

          {/* Timeline Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Linha do Tempo da Intervenção
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">1. Abertura</span>
                <span className="font-bold text-slate-800">{formatDate(ticket.created_at)}</span>
                <span className="text-[10px] text-slate-500 block">Por: {ticket.operator_name}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">2. Início Atendimento</span>
                <span className="font-bold text-blue-700">{formatDate(ticket.started_at)}</span>
                <span className="text-[10px] text-slate-500 block">
                  {ticket.mechanic_name ? `Mecânico: ${ticket.mechanic_name}` : 'Aguardando'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">3. Encerramento</span>
                <span className="font-bold text-green-700">{formatDate(ticket.closed_at)}</span>
                <span className="text-[10px] text-slate-500 block">
                  {ticket.downtime_minutes ? `${ticket.downtime_minutes} min parada` : isClosed ? 'Concluído' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          {/* Relato do Operador */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-blue-600" />
              Informações Registradas pelo Operador
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
              {ticket.description}
            </div>

            {ticket.photo_url && (
              <div className="mt-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Evidência Anexada:</span>
                <img
                  src={ticket.photo_url}
                  alt="Evidência"
                  className="rounded border border-slate-200 max-h-40 w-auto object-cover"
                />
              </div>
            )}
          </div>

          {/* Laudo do Mecânico */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-green-600" />
              Laudo e Resolução Técnica (O que foi feito)
            </h3>

            {isClosed ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50/60 border border-green-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                  {ticket.resolution_notes || 'Chamado encerrado sem laudo adicional.'}
                </div>

                {ticket.replaced_parts && (
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500 font-bold">Peças Trocadas:</span>
                    <span className="font-mono text-slate-900 font-semibold">{ticket.replaced_parts}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                Aguardando intervenção e encerramento técnico pelo mecânico.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
          >
            Fechar Janela
          </button>

          {isMechanic && !isClosed && (
            <div className="flex items-center gap-2">
              {isOpenStatus && onStartMaintenance && (
                <button
                  onClick={async () => {
                    await onStartMaintenance(ticket.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Iniciar Atendimento
                </button>
              )}

              {onOpenCloseModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCloseModal(ticket);
                  }}
                  className="px-3.5 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Encerrar Chamado</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
