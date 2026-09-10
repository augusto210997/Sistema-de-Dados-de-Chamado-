import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Chamado, Priority, Category } from './types';
import { getStoredUser, setStoredUser, clearStoredUser } from './lib/auth';
import {
  fetchChamados,
  createChamado,
  startChamado,
  closeChamado,
  getSupabaseCredentials,
  INITIAL_MOCK_CHAMADOS,
} from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OperatorView } from './components/OperatorView';
import { MechanicView } from './components/MechanicView';
import { NewTicketModal } from './components/NewTicketModal';
import { CloseTicketModal } from './components/CloseTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [activeNav, setActiveNav] = useState('painel');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal states
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isCloseTicketOpen, setIsCloseTicketOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);

  // Selected ticket for modal details or closing
  const [selectedTicket, setSelectedTicket] = useState<Chamado | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check Supabase connection state
  const checkConnectionStatus = useCallback(() => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConnected(Boolean(creds.url && creds.anonKey));
  }, []);

  // Load tickets
  const reloadChamados = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchChamados();
      setChamados(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error('Falha ao carregar chamados:', err);
      showToast('Aviso: Utilizando dados locais.', 'info');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize App on mount
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
    checkConnectionStatus();
    reloadChamados();
  }, [checkConnectionStatus, reloadChamados]);

  // Handle Login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    showToast(`Bem-vindo, ${user.name}! (${user.badge})`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Quick switch role (Operator <-> Mechanic) for testing
  const handleSwitchRole = () => {
    if (!currentUser) return;
    const newRole = currentUser.role === 'operador' ? 'mecanico' : 'operador';
    const updatedUser: User = {
      id: newRole === 'operador' ? 'op-01' : 'mec-01',
      username: newRole === 'operador' ? 'operador' : 'mecânico',
      name: newRole === 'operador' ? 'Carlos Oliveira' : 'Roberto Silva',
      role: newRole,
      avatarColor: newRole === 'operador' ? 'bg-emerald-600' : 'bg-amber-600',
      badge: newRole === 'operador' ? 'Operador de Produção' : 'Mecânico de Manutenção',
    };
    setCurrentUser(updatedUser);
    setStoredUser(updatedUser);
    showToast(`Perfil alterado para ${updatedUser.badge}`, 'info');
  };

  // Handle New Ticket Submission
  const handleCreateTicket = async (ticketData: {
    title: string;
    equipment: string;
    sector: string;
    priority: Priority;
    category: Category;
    description: string;
    photo_url?: string | null;
  }) => {
    if (!currentUser) return;
    try {
      const res = await createChamado({
        ...ticketData,
        operator_name: currentUser.name,
        operator_id: currentUser.username,
      });
      const newTicket = (res as any).data || res;
      setChamados((prev) => [newTicket, ...prev]);
      showToast(`Chamado ${newTicket.protocol} criado com sucesso!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar chamado.', 'error');
      throw err;
    }
  };

  // Handle Start Maintenance
  const handleStartMaintenance = async (ticketId: string) => {
    if (!currentUser) return;
    try {
      const updated = await startChamado(ticketId, currentUser);
      setChamados((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
      showToast(`Atendimento iniciado no chamado ${updated.protocol}.`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Erro ao iniciar atendimento.', 'error');
      throw err;
    }
  };

  // Handle Close Ticket
  const handleConfirmClose = async ({
    ticketId,
    resolutionNotes,
    replacedParts,
    downtimeMinutes,
  }: {
    ticketId: string;
    resolutionNotes: string;
    replacedParts: string;
    downtimeMinutes: number;
  }) => {
    if (!currentUser) return;
    try {
      const updated = await closeChamado(
        ticketId,
        resolutionNotes,
        currentUser,
        replacedParts,
        downtimeMinutes
      );
      setChamados((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
      showToast(`Chamado ${updated.protocol} encerrado com sucesso!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao encerrar chamado.', 'error');
      throw err;
    }
  };

  // Handlers for modal openings
  const handleOpenDetail = (ticket: Chamado) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleOpenCloseModal = (ticket: Chamado) => {
    setSelectedTicket(ticket);
    setIsCloseTicketOpen(true);
  };

  // Pending and Completed Counts for Badges
  const pendingCount = useMemo(
    () => chamados.filter((c) => c.status === 'aberto' || c.status === 'em_atendimento').length,
    [chamados]
  );
  const completedCount = useMemo(
    () => chamados.filter((c) => c.status === 'encerrado').length,
    [chamados]
  );

  // If not logged in, render LoginScreen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          isSupabaseConnected={isSupabaseConnected}
          onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseOpen}
          onClose={() => setIsSupabaseOpen(false)}
          onCredentialsSaved={() => {
            checkConnectionStatus();
            reloadChamados();
            showToast('Configurações do Supabase salvas.', 'success');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Desktop & Mobile Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          user={currentUser}
          isSupabaseConnected={isSupabaseConnected}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
          pendingCount={pendingCount}
          completedCount={completedCount}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col">
            <Sidebar
              user={currentUser}
              isSupabaseConnected={isSupabaseConnected}
              activeNav={activeNav}
              onSelectNav={(nav) => {
                setActiveNav(nav);
                setMobileSidebarOpen(false);
              }}
              onOpenSupabaseModal={() => {
                setIsSupabaseOpen(true);
                setMobileSidebarOpen(false);
              }}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top High Density Header */}
        <Navbar
          user={currentUser}
          isSupabaseConnected={isSupabaseConnected}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
          onOpenNewTicket={() => setIsNewTicketOpen(true)}
          pendingCount={pendingCount}
          completedCount={completedCount}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-2 text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Carregando ordens de manutenção...</p>
            </div>
          ) : currentUser.role === 'operador' ? (
            <OperatorView
              user={currentUser}
              chamados={chamados}
              onOpenNewTicket={() => setIsNewTicketOpen(true)}
              onSelectTicket={handleOpenDetail}
              isSupabaseConnected={isSupabaseConnected}
              onQuickCreateTicket={handleCreateTicket}
            />
          ) : (
            <MechanicView
              user={currentUser}
              chamados={chamados}
              onSelectTicket={handleOpenDetail}
              onStartMaintenance={handleStartMaintenance}
              onOpenCloseModal={handleOpenCloseModal}
              isSupabaseConnected={isSupabaseConnected}
              onQuickCloseTicket={handleConfirmClose}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSubmit={handleCreateTicket}
        operatorName={currentUser.name}
      />

      <CloseTicketModal
        isOpen={isCloseTicketOpen}
        onClose={() => setIsCloseTicketOpen(false)}
        ticket={selectedTicket}
        mechanicName={currentUser.name}
        mechanicId={currentUser.username}
        onConfirmClose={handleConfirmClose}
      />

      <TicketDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
        currentUser={currentUser}
        onStartMaintenance={handleStartMaintenance}
        onOpenCloseModal={handleOpenCloseModal}
      />

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onCredentialsSaved={() => {
          checkConnectionStatus();
          reloadChamados();
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 bg-slate-900 text-white border-slate-800">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-400" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
