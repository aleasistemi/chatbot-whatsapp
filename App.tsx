import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ConfigScreen } from './components/ConfigScreen';
import { ChatSimulator } from './components/ChatSimulator';
import { AccountDashboard } from './components/AccountDashboard';
import { AuthScreen } from './components/AuthScreen';
import { DatabaseConfigScreen } from './components/DatabaseConfigScreen';
import { BotAccount, DEFAULT_INSTRUCTION, User } from './types';
import { initChatSession } from './services/geminiService';
import { authService } from './services/authService';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Database State
  const [isDbConfigured, setIsDbConfigured] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<'accounts' | 'config' | 'chat'>('accounts');
  const [accounts, setAccounts] = useState<BotAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || null;

  // 1. Check Login on Mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Check if DB is already configured on this machine
      const savedConfig = supabaseService.getSavedConfig();
      if (savedConfig && supabaseService.init(savedConfig.url, savedConfig.key)) {
          setIsDbConfigured(true);
          // Load nodes immediately
          loadCloudNodes();
      }
    }
    setIsAuthChecking(false);
  }, []);

  // 2. Load Accounts from Cloud
  const loadCloudNodes = async () => {
    setIsDbLoading(true);
    try {
        // We use the Master Token as the 'User Token' in the DB
        // In this architecture, everyone with the master token shares the same DB slice
        // You can change this to use unique IDs if needed.
        const token = "ALEASISTEMI1409"; 
        const nodes = await supabaseService.loadNodes(token);
        setAccounts(nodes);
    } catch (e) {
        console.error("Cloud Load Error", e);
        // Fallback or empty
        setAccounts([]);
    } finally {
        setIsDbLoading(false);
    }
  };

  // 3. Gemini Init (Existing Logic)
  useEffect(() => {
    if (selectedAccount && selectedAccount.isActive && selectedAccount.status === 'connected') {
      initChatSession(selectedAccount.config);
    }
  }, [selectedAccount?.id, selectedAccount?.config, selectedAccount?.isActive]);

  // --- Handlers ---

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Check DB config again just in case
    const savedConfig = supabaseService.getSavedConfig();
    if (savedConfig && supabaseService.init(savedConfig.url, savedConfig.key)) {
        setIsDbConfigured(true);
        loadCloudNodes();
    } else {
        setIsDbConfigured(false);
    }
  };

  const handleDbConfigured = () => {
      setIsDbConfigured(true);
      loadCloudNodes();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAccounts([]);
    setSelectedAccountId(null);
    // Optional: Clear DB config on logout? No, keep it for convenience on same PC
    // supabaseService.clearConfig(); 
  };

  // Helper to generate PlanifyX style Instance ID
  const generateInstanceId = () => {
    return Array.from({length: 13}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  };

  const handleCreateAccount = async (name: string, phoneNumber: string) => {
    if (!currentUser) return;
    
    const newAccount: BotAccount = {
      id: Date.now().toString(),
      instanceId: generateInstanceId(),
      userId: currentUser.id, 
      name,
      phoneNumber,
      isActive: true,
      status: 'disconnected',
      serverStatus: 'offline',
      messagesCount: 0,
      avatarColor: ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600'][accounts.length % 5],
      config: {
        systemInstruction: DEFAULT_INSTRUCTION,
        temperature: 0.7
      }
    };

    // Optimistic UI Update
    setAccounts([...accounts, newAccount]);
    setSelectedAccountId(newAccount.id);

    // Cloud Save
    await supabaseService.saveNode("ALEASISTEMI1409", newAccount);
  };

  const handleUpdateAccount = async (updatedAccount: BotAccount) => {
    // Optimistic
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    
    // Cloud Save
    await supabaseService.saveNode("ALEASISTEMI1409", updatedAccount);
  };

  const handleDeleteAccount = async (id: string) => {
    // Optimistic
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    if (selectedAccountId === id) setSelectedAccountId(null);

    // Cloud Delete
    await supabaseService.deleteNode(id);
  };

  const handleTabChange = (tab: 'accounts' | 'config' | 'chat') => {
    if ((tab === 'config' || tab === 'chat') && !selectedAccount) {
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
        setActiveTab(tab);
        return;
      }
      alert("Crea prima un account WhatsApp nella Dashboard.");
      setActiveTab('accounts');
      return;
    }
    setActiveTab(tab);
  };

  // --- Render ---

  if (isAuthChecking) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Caricamento SaaS...</div>;

  // 1. Auth Check
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Database Config Check
  if (!isDbConfigured) {
      return <DatabaseConfigScreen onConfigured={handleDbConfigured} />;
  }

  // 3. Loading Data
  if (isDbLoading && accounts.length === 0) {
       return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 font-bold animate-pulse">Sincronizzazione Cloud...</div>;
  }

  // 4. Main App
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        accountCount={accounts.length}
        user={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {activeTab === 'accounts' && (
          <AccountDashboard 
            accounts={accounts}
            onCreate={handleCreateAccount}
            onSelect={(id) => { setSelectedAccountId(id); setActiveTab('config'); }}
            onDelete={handleDeleteAccount}
            onUpdate={handleUpdateAccount}
          />
        )}

        {activeTab === 'config' && selectedAccount && (
          <ConfigScreen 
            account={selectedAccount}
            allAccounts={accounts}
            onSwitchAccount={setSelectedAccountId}
            onSave={handleUpdateAccount} 
          />
        )}

        {activeTab === 'chat' && selectedAccount && (
          <ChatSimulator account={selectedAccount} />
        )}
      </main>
    </div>
  );
};

export default App;