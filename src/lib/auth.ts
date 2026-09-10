import { User } from '../types';

export const USERS: Record<string, { password: string; user: User }> = {
  operador: {
    password: 'operador123',
    user: {
      id: 'op-01',
      username: 'operador',
      name: 'Carlos Oliveira',
      role: 'operador',
      avatarColor: 'bg-emerald-600',
      badge: 'Operador de Produção',
    },
  },
  mecanico: {
    password: 'mecanico123',
    user: {
      id: 'mec-01',
      username: 'mecânico',
      name: 'Roberto Silva',
      role: 'mecanico',
      avatarColor: 'bg-amber-600',
      badge: 'Mecânico de Manutenção',
    },
  },
  'mecânico': {
    password: 'mecanico123',
    user: {
      id: 'mec-01',
      username: 'mecânico',
      name: 'Roberto Silva',
      role: 'mecanico',
      avatarColor: 'bg-amber-600',
      badge: 'Mecânico de Manutenção',
    },
  },
};

const SESSION_KEY = 'sistema_chamados_current_user';

export function getCurrentUser(): User {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return USERS.operador.user;
    const parsed = JSON.parse(raw);
    return parsed || USERS.operador.user;
  } catch {
    return USERS.operador.user;
  }
}

export const getStoredUser = getCurrentUser;
export const setStoredUser = saveUserSession;
export const clearStoredUser = clearUserSession;

export function saveUserSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; user?: User; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const found = USERS[cleanUsername];

  if (!found) {
    return {
      success: false,
      error: 'Usuário não encontrado. Use "operador" ou "mecânico".',
    };
  }

  if (found.password !== passwordInput) {
    return {
      success: false,
      error: 'Senha incorreta. Verifique as credenciais de acesso.',
    };
  }

  saveUserSession(found.user);
  return {
    success: true,
    user: found.user,
  };
}
