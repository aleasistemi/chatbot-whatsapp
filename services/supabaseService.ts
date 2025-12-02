
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BotAccount, SupabaseConfig } from '../types';

let supabase: SupabaseClient | null = null;
let currentConfig: SupabaseConfig | null = null;

// DEFAULT CONFIGURATION (Hardcoded for instant access)
const DEFAULT_URL = "https://ugtxetihyghgerrazanq.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndHhldGloeWdoZ2VycmF6YW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTk3NDEsImV4cCI6MjA4MDIzNTc0MX0.8Ylw8zoQubEgSveV-Gx-szvZXBpMRNGZ61GzQsZFUg0";

export const supabaseService = {
  
  // Inizializza il client
  init: (url?: string, key?: string) => {
    try {
      // 1. Try passed args
      // 2. Try localStorage
      // 3. Fallback to Hardcoded Defaults
      
      let targetUrl = url;
      let targetKey = key;

      if (!targetUrl || !targetKey) {
          const saved = localStorage.getItem('supabase_config');
          if (saved) {
              const parsed = JSON.parse(saved);
              targetUrl = parsed.url;
              targetKey = parsed.key;
          }
      }

      // If still nothing, use defaults
      if (!targetUrl || !targetKey) {
          targetUrl = DEFAULT_URL;
          targetKey = DEFAULT_KEY;
      }

      if (!targetUrl || !targetKey) return false;

      supabase = createClient(targetUrl, targetKey);
      currentConfig = { url: targetUrl, key: targetKey };
      
      // Save config locally ONLY if it differs from default (optional, but keeps logic clean)
      if (targetUrl !== DEFAULT_URL) {
        localStorage.setItem('supabase_config', JSON.stringify({ url: targetUrl, key: targetKey }));
      }
      
      return true;
    } catch (e) {
      console.error("Supabase init error", e);
      return false;
    }
  },

  getCurrentConfig: () => currentConfig || { url: DEFAULT_URL, key: DEFAULT_KEY },

  resetToDefault: () => {
      localStorage.removeItem('supabase_config');
      return supabaseService.init(DEFAULT_URL, DEFAULT_KEY);
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
