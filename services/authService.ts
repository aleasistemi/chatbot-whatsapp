import { User } from '../types';

// Simulazione Database Utenti (In produzione userebbe Supabase/Firebase)
const USERS_KEY = 'saas_users_db';
const SESSION_KEY = 'saas_current_session';

export const authService = {
  // Registrazione Nuovo Utente
  register: (name: string, email: string, password: string): { success: boolean; message?: string; user?: User } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      return { success: false, message: "Email già registrata." };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In produzione va hashata!
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00a884&color=fff`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  // Login Utente Esistente
  login: (email: string, password: string): { success: boolean; message?: string; user?: User } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: "Credenziali non valide." };
    }

    const safeUser = { ...user };
    delete safeUser.password; // Non salviamo la password in sessione

    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  },

  // Recupera Utente Corrente
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};