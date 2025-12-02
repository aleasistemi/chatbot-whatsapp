import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BotAccount, SupabaseConfig } from '../types';

let supabase: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

export const supabaseService = {
  
  // Inizializza il client
  init: (url: string, key: string) => {
    try {
      if (!url || !key) return false;
      supabase = createClient(url, key);
      currentConfig = { url, key };
      // Salva config nel browser per non reinserirla sempre su QUESTO pc
      localStorage.setItem('supabase_config', JSON.stringify({ url, key }));
      return true;
    } catch (e) {
      console.error("Supabase init error", e);
      return false;
    }
  },

  // Controlla se abbiamo già una configurazione salvata
  getSavedConfig: (): SupabaseConfig | null => {
    const saved = localStorage.getItem('supabase_config');
    return saved ? JSON.parse(saved) : null;
  },

  clearConfig: () => {
    localStorage.removeItem('supabase_config');
    supabase = null;
    currentConfig = null;
  },

  isConfigured: () => !!supabase,

  // --- CRUD OPERATIONS ---

  // Carica tutti i nodi per un dato token master (userId)
  loadNodes: async (userToken: string): Promise<BotAccount[]> => {
    if (!supabase) throw new Error("Database non connesso");
    
    const { data, error } = await supabase
      .from('bot_nodes')
      .select('*')
      .eq('user_token', userToken);
      
    if (error) {
      console.error("Load Error", error);
      throw error;
    }

    // Converti dal formato DB al formato App
    return data.map((row: any) => {
        // La colonna data contiene il JSON dell'account
        const acc = row.data;
        // Ripristina le date
        return {
            ...acc,
            lastActive: acc.lastActive ? new Date(acc.lastActive) : undefined
        };
    });
  },

  // Salva o Aggiorna un nodo
  saveNode: async (userToken: string, account: BotAccount) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('bot_nodes')
      .upsert({ 
          id: account.id,
          user_token: userToken,
          data: account
      });
      
    if (error) console.error("Save Error", error);
  },

  // Elimina un nodo
  deleteNode: async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase
      .from('bot_nodes')
      .delete()
      .eq('id', id);

    if (error) console.error("Delete Error", error);
  }
};