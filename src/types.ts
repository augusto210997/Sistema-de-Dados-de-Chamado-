export type UserRole = 'operador' | 'mecanico';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatarColor: string;
  badge: string;
}

export type TicketStatus = 'aberto' | 'em_atendimento' | 'encerrado' | 'cancelado';
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type Category = 'mecanica' | 'eletrica' | 'hidraulica' | 'pneumatica' | 'geral';

export interface Chamado {
  id: string;
  protocol: string;
  title: string;
  equipment: string;
  sector: string;
  priority: Priority;
  category: Category;
  status: TicketStatus;
  description: string;
  operator_name: string;
  operator_id?: string;
  created_at: string;
  started_at?: string | null;
  closed_at?: string | null;
  mechanic_name?: string | null;
  mechanic_id?: string | null;
  resolution_notes?: string | null;
  replaced_parts?: string | null;
  downtime_minutes?: number | null;
  photo_url?: string | null;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  usingFallback: boolean;
}
