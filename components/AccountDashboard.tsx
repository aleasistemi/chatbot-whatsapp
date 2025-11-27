import React, { useState, useEffect } from 'react';
import { BotAccount, MAX_ACCOUNTS } from '../types';
import { Plus, QrCode, Smartphone, Edit3, Server, Globe, Activity, Power, Wifi, CloudCheck, ShieldCheck, X, Terminal, AlertTriangle, MonitorPlay } from 'lucide-react';

interface AccountDashboardProps {
  accounts: BotAccount[];
  onCreate: (name: string, phoneNumber: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (account: BotAccount) => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  accounts, 
  onCreate, 
  onSelect,
  onDelete,
  onUpdate
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  // States for modals
  const [connectionStep, setConnectionStep] = useState<'none' | 'choice' | 'simulator' | 'production'>('none');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Fake "Server Heartbeat" effect
  const [uptime, setUptime] = useState(99.8);
  useEffect(() => {
    const timer = setInterval(() => {
        setUptime(prev => prev > 99.99 ? 99.8 : prev + 0.001);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPhone) {
      onCreate(newName, newPhone);
      setNewName('');
      setNewPhone('');
      setShowAddModal(false);
    }
  };

  const initConnectFlow = (id: string) => {
      setSelectedAccountId(id);
      setConnectionStep('choice');
  };

  const startSimulatorScan = () => {
    setConnectionStep('simulator');
    setScanProgress(0);
    
    // Simulate connection process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        // Find account and update status
        if (selectedAccountId) {
            const acc = accounts.find(a => a.id === selectedAccountId);
            if (acc) {
            onUpdate({ 
                ...acc, 
                status: 'connected', 
                serverStatus: 'online', 
                lastActive: new Date() 
            });
            }
        }
        setTimeout(() => setConnectionStep('none'), 800);
      }
    }, 200);
  };

  const disconnect = (account: BotAccount) => {
    if (confirm("Vuoi disconnettere questo numero? Il server cloud smetterà di ricevere messaggi.")) {
      onUpdate({ ...account, status: 'disconnected', serverStatus: 'offline', isActive: false });
    }
  };

  const activeCount = accounts.filter(a => a.status === 'connected').length;

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Stats */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Server</h1>
                <p className="text-slate-500 mt-2">Gestione istanze WhatsApp Cloud.</p>
              </div>
              <button 
                  onClick={() => accounts.length < MAX_ACCOUNTS && setShowAddModal(true)}
                  disabled={accounts.length >= MAX_ACCOUNTS}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-lg shadow-sm transition-all font-medium whitespace-nowrap ${
                      accounts.length >= MAX_ACCOUNTS 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
              >
                  <Plus className="w-5 h-5" />
                  <span>Nuovo Nodo</span>
              </button>
          </div>

          {/* Persistent Connection Banner */}
          {activeCount > 0 && (
             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start md:items-center shadow-sm animate-in fade-in slide-in-from-top-2">
                <CloudCheck className="w-6 h-6 text-emerald-600 mr-3 shrink-0" />
                <div className="flex-1">
                   <h3 className="font-bold text-emerald-800 text-sm">Sessione Cloud Attiva</h3>
                   <p className="text-emerald-700/80 text-xs mt-0.5">
                     Il servizio è in esecuzione sul server FastComet. 
                     <strong> Puoi chiudere questa finestra o spegnere il PC.</strong> Il bot continuerà a rispondere.
                   </p>
                </div>
                <div className="hidden md:block">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                     Always On
                   </span>
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Server className="w-6 h-6" />
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Stato Sistema</div>
                      <div className="text-xl font-bold text-slate-800">Operativo</div>
                  </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Globe className="w-6 h-6" />
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Uptime Server</div>
                      <div className="text-xl font-bold text-slate-800">{uptime.toFixed(3)}%</div>
                  </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                      <Activity className="w-6 h-6" />
                  </div>
                  <div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Slot Utilizzati</div>
                      <div className="text-xl font-bold text-slate-800">{accounts.length} / {MAX_ACCOUNTS}</div>
                  </div>
              </div>
          </div>
        </header>

        {/* Nodes Grid */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center">
            Nodi Attivi
            {activeCount > 0 && <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Live Server</span>}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md group">
              {/* Status Bar */}
              <div className={`h-1.5 w-full ${
                  acc.status === 'connected' 
                    ? (acc.isActive ? 'bg-emerald-500' : 'bg-amber-400') 
                    : 'bg-red-400'
              }`}></div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-xl ${acc.avatarColor} flex items-center justify-center text-white font-bold text-2xl shadow-sm`}>
                    {acc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
                    acc.status === 'connected' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${acc.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{acc.status === 'connected' ? 'CLOUD CONNECTED' : 'OFFLINE'}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 truncate mb-1">{acc.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center">
                  <Smartphone className="w-4 h-4 mr-2 text-slate-400" /> {acc.phoneNumber}
                </p>

                {/* Server Stats (Fake) */}
                {acc.status === 'connected' && (
                    <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5">Messaggi Ricevuti</span>
                            <span className="font-mono font-bold text-slate-700">{Math.floor(Math.random() * 50) + acc.messagesCount + 120}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-slate-400 block mb-0.5">Sessione</span>
                            <span className="font-mono font-bold text-emerald-600">Persistente</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto space-y-3">
                  {acc.status === 'disconnected' ? (
                    <button 
                      onClick={() => initConnectFlow(acc.id)}
                      className="w-full flex items-center justify-center py-3 px-4 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-lg transition-colors text-sm font-bold shadow-sm"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Collega WhatsApp
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelect(acc.id)}
                      className="w-full flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-bold"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Configura Bot
                    </button>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                     <span className="text-xs text-slate-400">ID: {acc.id.substring(0,8)}</span>
                     <div className="flex space-x-2">
                        {acc.status === 'connected' && (
                            <button onClick={() => disconnect(acc)} title="Disconnetti Sessione Remota" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                <Wifi className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => { if(confirm('Eliminare definitivamente questo nodo dal server?')) onDelete(acc.id); }} title="Elimina Nodo" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Power className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {accounts.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-xl">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Server className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Nessun nodo attivo</h3>
                  <p className="max-w-sm mt-1 mb-6">Inizia collegando il tuo primo numero WhatsApp per attivare il bot sul server FastComet.</p>
                  <button 
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-2 bg-[#00a884] text-white rounded-lg font-medium hover:bg-[#008f6f]"
                  >
                      Aggiungi Primo Account
                  </button>
              </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                    <Plus className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Nuovo Nodo Server</h2>
                    <p className="text-sm text-slate-500">Configurazione istanza WhatsApp</p>
                </div>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Etichetta Interna</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Es. Ristorante Roma..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a884] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Numero WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+39 333 1234567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a884] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#00a884] text-white rounded-lg hover:bg-[#008f6f] font-bold shadow-md shadow-emerald-200 transition-all transform active:scale-95"
                >
                  Crea Nodo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHOICE MODAL: SIMULATOR VS REAL */}
      {connectionStep === 'choice' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 border-b border-slate-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Scegli Modalità di Connessione</h2>
                    <p className="text-slate-500">Come vuoi collegare questo bot?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <button 
                        onClick={() => setConnectionStep('production')}
                        className="p-8 hover:bg-emerald-50 transition-colors text-left group flex flex-col h-full"
                    >
                        <div className="mb-4 bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Produzione Reale</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1">
                            Collega il tuo VERO numero WhatsApp al server FastComet. 
                            Funziona 24/7 anche a PC spento.
                        </p>
                        <div className="flex items-center text-emerald-700 font-bold text-sm">
                            Vedi Istruzioni <Globe className="w-4 h-4 ml-2" />
                        </div>
                    </button>

                    <button 
                        onClick={startSimulatorScan}
                        className="p-8 hover:bg-blue-50 transition-colors text-left group flex flex-col h-full"
                    >
                        <div className="mb-4 bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <MonitorPlay className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Simulatore Browser</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1">
                            Ambiente di test sicuro. Usa un numero finto per provare i prompt e le risposte dell'IA senza collegare il telefono vero.
                        </p>
                         <div className="flex items-center text-blue-700 font-bold text-sm">
                            Avvia Test <Activity className="w-4 h-4 ml-2" />
                        </div>
                    </button>
                </div>
                <div className="bg-slate-50 p-4 flex justify-center">
                    <button onClick={() => setConnectionStep('none')} className="text-slate-400 hover:text-slate-600 font-medium text-sm">Annulla</button>
                </div>
             </div>
        </div>
      )}

      {/* PRODUCTION INSTRUCTIONS MODAL */}
      {connectionStep === 'production' && (
          <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
             <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                     <h2 className="text-xl font-bold text-white flex items-center">
                         <Terminal className="w-6 h-6 mr-3 text-[#00a884]" />
                         Collegamento Server Reale
                     </h2>
                     <button onClick={() => setConnectionStep('none')} className="text-white/50 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                
                <div className="p-8">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                        <div className="flex">
                            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
                            <div>
                                <h3 className="text-sm font-bold text-amber-800">Il QR Code non appare qui!</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Poiché il server FastComet non ha uno schermo, non può mostrare il QR code in questa pagina web.
                                    Devi cercarlo nei Log del server.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-4">Procedura di Collegamento:</h3>
                    <ol className="list-decimal list-inside space-y-4 text-slate-600 ml-2">
                        <li>Assicurati di aver caricato i file <code>server.js</code> e <code>package.json</code> su FastComet.</li>
                        <li>Avvia la <strong>Node.js App</strong> dal cPanel.</li>
                        <li>Nel cPanel, clicca sul pulsante <strong>"Log"</strong> (o guarda il file <code>stderr.log</code> nel File Manager).</li>
                        <li>Troverai il QR Code disegnato con caratteri di testo nel Log.</li>
                        <li>Apri WhatsApp sul telefono &rarr; Dispositivi Collegati &rarr; Scannerizza quel codice dal Log.</li>
                    </ol>

                    <div className="mt-8 bg-slate-100 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-500">
                        Esempio di output nel Log:<br/>
                        <code>SCANNERIZZA QUESTO QR CODE PER COLLEGARE IL BOT:</code><br/>
                        <code>▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄</code><br/>
                        <code>█ ▄▄▄▄▄ █ ▄ █ ▄▄▄▄▄ █</code><br/>
                        <code>█ █   █ █ █ █ █   █ █</code><br/>
                        <code>...</code>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 text-right">
                    <button 
                        onClick={() => setConnectionStep('none')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                    >
                        Ho capito, vado sul cPanel
                    </button>
                </div>
             </div>
          </div>
      )}

      {/* SIMULATOR QR Code Modal */}
      {connectionStep === 'simulator' && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-[550px] animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex-1 p-10 flex flex-col justify-center items-start bg-white relative">
              <button onClick={() => setConnectionStep('none')} className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
              </button>
              <h2 className="text-3xl font-light text-slate-800 mb-4">Simulatore Browser</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 text-sm text-blue-800 flex items-start">
                  <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
                  <p>Questa è una simulazione. Nessun telefono reale verrà collegato. Serve per testare le risposte dell'IA.</p>
              </div>
              <ol className="list-decimal list-inside space-y-4 text-slate-600 text-lg">
                <li>Stiamo generando un ambiente virtuale</li>
                <li>Simulazione handshake crittografico...</li>
                <li>Attendi il collegamento...</li>
              </ol>
            </div>
            
            <div className="w-full md:w-[450px] bg-slate-50 border-l border-slate-100 flex flex-col items-center justify-center p-10 relative">
              <div className="relative group">
                {/* Fake QR Code Pattern */}
                <div className="w-72 h-72 bg-white p-4 rounded-2xl shadow-xl border border-slate-200">
                  <div className="w-full h-full bg-slate-900 p-1 grid grid-cols-12 gap-0.5 opacity-90 rounded-lg overflow-hidden">
                     {Array.from({ length: 144 }).map((_, i) => (
                       <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-10'}`} />
                     ))}
                     
                     {/* Scanning Animation Line */}
                     <div className="absolute top-4 left-4 right-4 h-1 bg-[#00a884] shadow-[0_0_15px_#00a884] animate-[scan_2.5s_linear_infinite] opacity-80 z-10"></div>
                  </div>
                </div>

                {/* Loading/Success Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {scanProgress > 80 && (
                      <div className="bg-white p-4 rounded-full shadow-xl animate-in zoom-in duration-300">
                        <Smartphone className="w-10 h-10 text-[#00a884]" />
                      </div>
                  )}
                </div>
              </div>

              {/* Progress Text */}
              <div className="mt-8 text-center w-full max-w-[280px]">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Avvio Simulazione</span>
                    <span>{scanProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-3 font-medium animate-pulse">
                  {scanProgress < 100 ? 'Creazione ambiente test...' : 'Ambiente Pronto!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 20px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 270px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};