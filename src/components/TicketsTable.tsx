import { useState, useMemo, MouseEvent } from 'react';
import {
  HardHat,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Check,
  Eye,
  FileCheck,
  Layers,
  Filter,
  ArrowUpDown,
  User as UserIcon,
} from 'lucide-react';
import { Chamado, Priority, TicketStatus, User } from '../types';

interface TicketsTableProps {
  chamados: Chamado[];
  currentUser: User;
  onSelectTicket: (ticket: Chamado) => void;
  onStartMaintenance?: (ticketId: string) => Promise<void>;
  onOpenCloseModal?: (ticket: Chamado) => void;
  onOpenNewTicket?: () => void;
  customTitle?: string;
  defaultStatusFilter?: string;
}

export function TicketsTable({
  chamados,
  currentUser,
  onSelectTicket,
  onStartMaintenance,
  onOpenCloseModal,
  onOpenNewTicket,
  customTitle = 'Tabela Geral de Chamados e Encerramentos',
  defaultStatusFilter = 'todos',
}: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isMechanic = currentUser.role === 'mecanico';

  const filteredTickets = useMemo(() => {
    return chamados.filter((ticket) => {
      const matchSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.operator_name && ticket.operator_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.mechanic_name && ticket.mechanic_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || ticket.status === statusFilter;
      const matchPriority = priorityFilter === 'todos' || ticket.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [chamados, searchTerm, statusFilter, priorityFilter]);

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${time} (${date})`;
    } catch {
      return isoStr;
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgente':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-red-200">
            <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-orange-200">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px] inline-flex items-center gap-1 border border-amber-200">
            Média
          </span>
        );
      case 'baixa':
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px] inline-flex items-center gap-1 border border-slate-200">
            Baixa
          </span>
        );
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'aberto':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Aberto
          </span>
        );
      case 'em_atendimento':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Em Reparo
          </span>
        );
      case 'encerrado':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Encerrado
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold uppercase tracking-wider">
            Cancelado
          </span>
        );
    }
  };

  const handleStartTicket = async (e: MouseEvent, ticketId: string) => {
    e.stopPropagation();
    if (!onStartMaintenance) return;
    setActionLoadingId(ticketId);
    try {
      await onStartMaintenance(ticketId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseTicketClick = (e: MouseEvent, ticket: Chamado) => {
    e.stopPropagation();
    if (onOpenCloseModal) {
      onOpenCloseModal(ticket);
    } else {
      onSelectTicket(ticket);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-6 bg-blue-600 rounded-xs"></div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{customTitle}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                {filteredTickets.length} registros
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Acompanhamento de solicitações por operador e encerramentos por mecânico
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar operador, mecânico, máquina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="todos">Status: Todos</option>
            <option value="aberto">Abertos</option>
            <option value="em_atendimento">Em Reparo</option>
            <option value="encerrado">Encerrados</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="todos">Prioridade: Todas</option>
            <option value="urgente">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {onOpenNewTicket && currentUser.role === 'operador' && (
            <button
              type="button"
              onClick={onOpenNewTicket}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              + Novo Chamado
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {filteredTickets.length === 0 ? (
        <div className="py-12 px-4 text-center text-slate-500 space-y-3">
          <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Nenhum chamado encontrado com os filtros selecionados.</p>
          <p className="text-xs text-slate-400">Altere os filtros acima ou registre uma nova ordem de serviço.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-100/90 text-slate-600 text-[11px] uppercase font-bold sticky top-0 border-b border-slate-200 select-none">
              <tr>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <HardHat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Operador (Solicitante)</span>
                  </div>
                </th>
                <th className="px-4 py-3">Equipamento & Setor</th>
                <th className="px-4 py-3">Defeito Relatado</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mecânico Responsável</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Ação do Mecânico</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredTickets.map((ticket) => {
                const isAberto = ticket.status === 'aberto';
                const isAndamento = ticket.status === 'em_atendimento';
                const isEncerrado = ticket.status === 'encerrado';

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isAndamento
                        ? 'bg-amber-50/25'
                        : isAberto
                        ? 'bg-blue-50/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* 1. Protocolo */}
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                        {ticket.protocol}
                      </span>
                    </td>

                    {/* 2. Operador Solicitante */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] border border-emerald-300">
                          OP
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">
                            {ticket.operator_name || 'Operador de Turno'}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Equipamento & Setor */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-slate-900 text-xs">{ticket.equipment}</p>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {ticket.sector}
                      </span>
                    </td>

                    {/* 4. Defeito Relatado */}
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <p className="font-semibold text-slate-900 text-xs truncate leading-snug">
                        {ticket.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {ticket.description}
                      </p>
                    </td>

                    {/* 5. Prioridade */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>

                    {/* 6. Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>

                    {/* 7. Mecânico Responsável */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isEncerrado ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] border border-emerald-300">
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-900 text-xs">
                              {ticket.mechanic_name || 'Mecânico Técnico'}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Encerrado: {formatDate(ticket.closed_at)}
                            </span>
                          </div>
                        </div>
                      ) : isAndamento ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] border border-amber-300">
                            MC
                          </div>
                          <div>
                            <p className="font-bold text-amber-900 text-xs">
                              {ticket.mechanic_name || 'Mecânico em Atendimento'}
                            </p>
                            <span className="text-[10px] text-amber-700 font-semibold">
                              Intervenção em andamento
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[10px] font-semibold italic flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Aguardando Mecânico
                        </span>
                      )}
                    </td>

                    {/* 8. Ação do Mecânico / Encerramento */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Se estiver em atendimento: Botão principal para ENCERRAR O CHAMADO */}
                        {isAndamento && (
                          <button
                            type="button"
                            id={`btn-table-close-${ticket.id}`}
                            onClick={(e) => handleCloseTicketClick(e, ticket)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Encerrar chamado e registrar laudo técnico"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Encerrar Chamado</span>
                          </button>
                        )}

                        {/* Se estiver aberto: Botão para Iniciar Atendimento */}
                        {isAberto && onStartMaintenance && (
                          <button
                            type="button"
                            id={`btn-table-start-${ticket.id}`}
                            onClick={(e) => handleStartTicket(e, ticket.id)}
                            disabled={actionLoadingId === ticket.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Assumir chamado e iniciar reparo"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Atender / Iniciar</span>
                          </button>
                        )}

                        {/* Se encerrado: Ver Laudo */}
                        {isEncerrado && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTicket(ticket);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ver Laudo</span>
                          </button>
                        )}

                        {/* Botão de Ficha / Detalhes */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTicket(ticket);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Abrir ficha completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Exibindo {filteredTickets.length} de {chamados.length} chamados registrados</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-medium">
            Mecânicos podem clicar em <strong>"Atender"</strong> e <strong>"Encerrar Chamado"</strong> diretamente na tabela.
          </span>
        </div>
      </div>
    </div>
  );
}
