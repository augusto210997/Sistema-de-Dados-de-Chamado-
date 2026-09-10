import { Wrench, HardHat, Database, LogOut, ArrowLeftRight, Plus, Menu } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  isSupabaseConnected: boolean;
  onLogout: () => void;
  onSwitchRole: () => void;
  onOpenSupabaseModal: () => void;
  onOpenNewTicket?: () => void;
  pendingCount: number;
  completedCount: number;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({
  user,
  isSupabaseConnected,
  onLogout,
  onSwitchRole,
  onOpenSupabaseModal,
  onOpenNewTicket,
  pendingCount,
  completedCount,
  onToggleMobileSidebar,
}: NavbarProps) {
  const isOperator = user.role === 'operador';

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-20 shadow-sm"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Gestão de Manutenção
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase tracking-wider">
              {pendingCount} PENDENTES
            </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded uppercase tracking-wider">
              {completedCount} CONCLUÍDOS
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Ticket for Operator */}
        {isOperator && onOpenNewTicket && (
          <button
            type="button"
            onClick={onOpenNewTicket}
            id="btn-nav-new-ticket"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Chamado</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}

        {/* Switch Role Button */}
        <button
          type="button"
          onClick={onSwitchRole}
          id="btn-switch-role"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
          <span>Modo: <strong className="text-blue-300 capitalize">{user.badge}</strong></span>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          id="btn-logout"
          className="px-3 py-1.5 sm:py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Sair da sessão"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
