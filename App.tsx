
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ConfigScreen } from './components/ConfigScreen';
import { ChatSimulator } from './components/ChatSimulator';
import { AccountDashboard } from './components/AccountDashboard';
import { AuthScreen } from './components/AuthScreen';
import { BotAccount, DEFAULT_INSTRUCTION, User } from './types';
import { initChatSession } from './services/geminiService';
import { authService } from './services/authService';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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
      loadUserAccounts(user.id);
    }
    setIsAuthChecking(false);
  }, []);

  // 2. Load Accounts specfic to User
  const loadUserAccounts = (userId: string) => {
    try {
      const saved = localStorage.getItem(`saas_data_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccounts(parsed.map((acc: any) => ({
          ...acc,
          lastActive: acc.lastActive ? new Date(acc.lastActive) : undefined
        })));
      } else {
        setAccounts([]);
      }
    } catch (e) {
      console.error("Failed to load user accounts", e);
      setAccounts([]);
    }
  };

  // 3. Save Accounts whenever they change (Only if logged in)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`saas_data_${currentUser.id}`, JSON.stringify(accounts));
    }
  }, [accounts, currentUser]);

  // 4. Gemini Init
  useEffect(() => {
    if (selectedAccount && selectedAccount.isActive && selectedAccount.status === 'connected') {
      initChatSession(selectedAccount.config);
    }
  }, [selectedAccount?.id, selectedAccount?.config, selectedAccount?.isActive]);

  // --- Handlers ---

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserAccounts(user.id);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAccounts([]);
    setSelectedAccountId(null);
  };

  // Helper to generate PlanifyX style Instance ID
  const generateInstanceId = () => {
    return Array.from({length: 13}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  };

  const handleCreateAccount = (name: string, phoneNumber: string) => {
    if (!currentUser) return;
    
    const newAccount: BotAccount = {
      id: Date.now().toString(),
      instanceId: generateInstanceId(), // Generates something like 692C275AE02BB
      userId: currentUser.id, // Bind to user
      name,
      phoneNumber,
      isActive: true,
      status: 'disconnected',
      serverStatus: 'offline',
      messagesCount: 0,
      avatarColor: ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600'][accounts.length % 5],
      config: {
        systemInstruction: DEFAULT_INSTRUCTION,
        temperature: 0.7,
        apiKey: '' 
      }
    };
    setAccounts([...accounts, newAccount]);
    setSelectedAccountId(newAccount.id);
  };

  const handleUpdateAccount = (updatedAccount: BotAccount) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    if (selectedAccountId === id) setSelectedAccountId(null);
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

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

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
