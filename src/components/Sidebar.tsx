import { LayoutDashboard, ClipboardList, History } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  isSupabaseConnected?: boolean;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenSupabaseModal?: () => void;
  pendingCount: number;
  completedCount: number;
}

export function Sidebar({
  user,
  activeNav,
  onSelectNav,
  pendingCount,
  completedCount,
}: SidebarProps) {
  const isOperator = user.role === 'operador';

  const navItems = [
    { id: 'painel', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'chamados', label: isOperator ? 'Meus Chamados' : 'Fila Técnica', icon: ClipboardList, count: pendingCount },
    { id: 'historico', label: 'Histórico & Concluídos', icon: History, count: completedCount },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 flex-shrink-0 select-none"
    >
      {/* Brand */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-base text-white shadow-sm shadow-blue-500/30">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center leading-none">
              MaintSync<span className="text-blue-400">Pro</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              High Density OS
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 px-3">
          Navegação Principal
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Section */}
      <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/40">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm ${
              isOperator ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          >
            {isOperator ? 'OP' : 'MC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white leading-tight truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="capitalize">{user.badge}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
