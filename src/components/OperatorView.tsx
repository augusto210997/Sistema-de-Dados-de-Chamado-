import { useState, useMemo, FormEvent } from 'react';
import {
  Plus,
  Cpu,
  MapPin,
  Tag,
  HardHat,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Chamado, Priority, TicketStatus, User, Category } from '../types';
import { TicketsTable } from './TicketsTable';

interface OperatorViewProps {
  user: User;
  chamados: Chamado[];
  onOpenNewTicket: () => void;
  onSelectTicket: (ticket: Chamado) => void;
  isSupabaseConnected?: boolean;
  onQuickCreateTicket?: (data: {
    title: string;
    equipment: string;
    sector: string;
    priority: Priority;
    category: Category;
    description: string;
  }) => Promise<void>;
}

const COMMON_MACHINES = [
  'Torno CNC 04',
  'Prensa Hidráulica 12',
  'Centro de Usinagem 02',
  'Braço Robótico KUKA',
  'Esteira Transportadora',
  'Injetora de Plástico 08',
  'Compressor de Ar Atlas',
];

export function OperatorView({
  user,
  chamados,
  onOpenNewTicket,
  onSelectTicket,
  onQuickCreateTicket,
}: OperatorViewProps) {
  // Quick form in side panel
  const [quickTitle, setQuickTitle] = useState('');
  const [quickEquipment, setQuickEquipment] = useState('Torno CNC 04');
  const [quickSector, setQuickSector] = useState('Usinagem - Célula 01');
  const [quickPriority, setQuickPriority] = useState<Priority>('alta');
  const [quickDescription, setQuickDescription] = useState('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const total = chamados.length;
    const abertos = chamados.filter((c) => c.status === 'aberto').length;
    const emAtendimento = chamados.filter((c) => c.status === 'em_atendimento').length;
    const concluidos = chamados.filter((c) => c.status === 'encerrado').length;
    const urgentes = chamados.filter(
      (c) => (c.priority === 'urgente' || c.priority === 'alta') && c.status !== 'encerrado'
    ).length;
    return { total, abertos, emAtendimento, concluidos, urgentes };
  }, [chamados]);

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickDescription.trim() || !onQuickCreateTicket) {
      onOpenNewTicket();
      return;
    }
    setIsQuickSubmitting(true);
    try {
      await onQuickCreateTicket({
        title: quickTitle.trim(),
        equipment: quickEquipment,
        sector: quickSector,
        priority: quickPriority,
        category: 'mecanica',
        description: quickDescription.trim(),
      });
      setQuickTitle('');
      setQuickDescription('');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* High Density Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Total Cadastrado
            </span>
            <span className="text-xl font-bold font-mono text-slate-800">{stats.total}</span>
          </div>
          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
            TOTAL
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Fila Pendente
            </span>
            <span className="text-xl font-bold font-mono text-blue-600">{stats.abertos}</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
            ABERTOS
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Em Manutenção
            </span>
            <span className="text-xl font-bold font-mono text-amber-600">{stats.emAtendimento}</span>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
            ANDAMENTO
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              Concluídos / Laudo
            </span>
            <span className="text-xl font-bold font-mono text-green-600">{stats.concluidos}</span>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">
            RESOLVIDOS
          </span>
        </div>
      </div>

      {/* Main 12-Column High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Main Active Tickets Queue Table */}
        <div className="lg:col-span-8">
          <TicketsTable
            chamados={chamados}
            currentUser={user}
            onSelectTicket={onSelectTicket}
            onOpenNewTicket={onOpenNewTicket}
            customTitle="Quadro Geral de Ordens (Operador & Mecânico)"
          />
        </div>

        {/* Right 4 Cols: Quick Actions & New Ticket Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quick Ticket Box (High Density) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2 uppercase tracking-tight">
              <span className="w-2 h-4 bg-blue-600 rounded-sm"></span>
              Abrir Novo Chamado
            </h3>

            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Máquina / Equipamento
                </label>
                <select
                  value={quickEquipment}
                  onChange={(e) => setQuickEquipment(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {COMMON_MACHINES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Título Resumido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barulho na esteira, Vazamento..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Prioridade
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['baixa', 'media', 'alta', 'urgente'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setQuickPriority(p)}
                      className={`py-1 text-[10px] font-bold rounded uppercase cursor-pointer ${
                        quickPriority === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Descrição do Problema
                </label>
                <textarea
                  required
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  placeholder="Descreva o defeito ou anomalia observada..."
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  disabled={isQuickSubmitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isQuickSubmitting ? 'Registrando...' : 'Registrar Chamado'}
                </button>
                <button
                  type="button"
                  onClick={onOpenNewTicket}
                  title="Abrir formulário completo com fotos"
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                >
                  + Opções
                </button>
              </div>
            </form>
          </div>

          {/* Quick Notice Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-tight text-blue-400 mb-2 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5" />
              Orientações do Operador
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ao registrar uma ocorrência, informe com precisão a máquina e a célula de trabalho. O mecânico assumirá a ordem na fila e registrará o laudo assim que os reparos forem concluídos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
