import React, { useState, useEffect } from 'react';
import { BotAccount, DEFAULT_INSTRUCTION } from '../types';
import { Save, RefreshCw, ChevronDown, Check, Smartphone, Cloud, UploadCloud, Loader2, Power, Key, ExternalLink, ShieldAlert, Eye, EyeOff, HelpCircle, X, Server, FileUp, Globe, MonitorOff, Download, FileJson, FileCode, Terminal } from 'lucide-react';

interface ConfigScreenProps {
  account: BotAccount;
  allAccounts: BotAccount[];
  onSwitchAccount: (id: string) => void;
  onSave: (updatedAccount: BotAccount) => void;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({ account, allAccounts, onSwitchAccount, onSave }) => {
  // Local state to handle form edits before saving
  const [localConfig, setLocalConfig] = useState(account.config);
  const [isActive, setIsActive] = useState(account.isActive);
  const [isDirty, setIsDirty] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  
  // Simulation states for "Cloud Deploy"
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastDeployed, setLastDeployed] = useState<Date | null>(new Date());

  // When switching accounts, update local state
  useEffect(() => {
    setLocalConfig(account.config);
    setIsActive(account.isActive);
    setIsDirty(false);
    setIsDropdownOpen(false);
    setLastDeployed(new Date()); 
  }, [account.id]);

  const handleConfigChange = (field: keyof typeof localConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleToggleActive = () => {
    setIsActive(!isActive);
    setIsDirty(true);
  };

  const handleDeploy = () => {
    if (!localConfig.apiKey) {
      alert("Devi inserire una API Key valida prima di attivare il server.");
      return;
    }

    setIsDeploying(true);
    
    // Simulate server delay
    setTimeout(() => {
        onSave({
            ...account,
            isActive,
            config: localConfig
        });
        setIsDirty(false);
        setIsDeploying(false);
        setLastDeployed(new Date());
    }, 1500);
  };

  const handleReset = () => {
    if(confirm("Sei sicuro di voler ripristinare il prompt originale?")) {
      setLocalConfig({
        ...localConfig,
        systemInstruction: DEFAULT_INSTRUCTION
      });
      setIsDirty(true);
    }
  };

  // --- GENERATION LOGIC FOR REAL SERVER CODE ---
  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePackageJson = () => {
    const pkg = {
      "name": `whatsapp-bot-${account.name.toLowerCase().replace(/\s+/g, '-')}`,
      "version": "1.1.0",
      "description": "Bot WhatsApp generato da BotManager Pro",
      "main": "server.js",
      "scripts": {
        "start": "node server.js"
      },
      "dependencies": {
        "whatsapp-web.js": "^1.23.0",
        "qrcode": "^1.5.3", 
        "@google/genai": "^1.30.0",
        "dotenv": "^16.0.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    };
    downloadFile('package.json', JSON.stringify(pkg, null, 2));
  };

  const generateServerJs = () => {
    const content = `/**
 * BOT WA GENERATO AUTOMATICAMENTE - VERSIONE FASTCOMET V2 (FIX 503)
 * Configurazione per: ${account.name}
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { GoogleGenAI } = require("@google/genai");
const http = require('http');

// --- CONFIGURAZIONE ---
const API_KEY = "${localConfig.apiKey || 'INSERISCI_LA_TUA_CHIAVE_QUI'}";
const SYSTEM_INSTRUCTION = \`${localConfig.systemInstruction.replace(/`/g, '\\`')}\`;
const TEMPERATURE = ${localConfig.temperature};

// Variabili di stato
let qrCodeDataUrl = '';
let statusMessage = 'Avvio del sistema in corso...';
let isConnected = false;

// --- 1. AVVIO IMMEDIATO WEBSERVER (Previene Errore 503) ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    let htmlContent = \`
    <html>
        <head>
            <title>Bot Status: ${account.name}</title>
            <meta http-equiv="refresh" content="5">
            <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background: #f0f2f5; }
                .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; }
                h1 { color: #333; }
                .status { font-weight: bold; color: #666; }
                .green { color: #00a884; }
                .red { color: #dc2626; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🤖 ${account.name}</h1>
                <p class="status">Stato: \${isConnected ? '<span class="green">ONLINE E CONNESSO</span>' : '<span class="red">DISCONNESSO</span>'}</p>
                <p>\${statusMessage}</p>
    \`;

    if (qrCodeDataUrl && !isConnected) {
        htmlContent += \`
            <div style="margin: 20px 0;">
                <img src="\${qrCodeDataUrl}" alt="QR Code" width="250" />
                <p>Scannerizza questo QR con WhatsApp (Dispositivi Collegati)</p>
            </div>
        \`;
    }

    htmlContent += \`
                <small>Pagina di controllo FastComet - Refresh automatico ogni 5s</small>
            </div>
        </body>
    </html>
    \`;
    
    res.end(htmlContent);
});

// Porta assegnata da cPanel
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(\`Server web avviato sulla porta \${PORT}\`);
});

// --- 2. INIZIALIZZAZIONE AI ---
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- 3. INIZIALIZZAZIONE WHATSAPP ---
console.log("Inizializzazione Client WhatsApp...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Parametri critici per evitare crash su cPanel/Linux
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('Nuovo QR Code generato');
    statusMessage = 'In attesa di scansione QR Code...';
    // Converti QR in immagine base64 per il browser
    qrcode.toDataURL(qr, (err, url) => {
        if(!err) qrCodeDataUrl = url;
    });
});

client.on('ready', () => {
    console.log('>>> BOT PRONTO <<<');
    isConnected = true;
    statusMessage = 'Il bot è attivo e sta ascoltando i messaggi.';
    qrCodeDataUrl = ''; // Nascondi QR
});

client.on('authenticated', () => {
    statusMessage = 'Autenticato! Caricamento chat...';
});

client.on('auth_failure', msg => {
    statusMessage = 'Errore Autenticazione: ' + msg;
});

client.on('disconnected', (reason) => {
    console.log('Bot disconnesso:', reason);
    isConnected = false;
    statusMessage = 'Disconnesso. Riavvio necessario o attesa nuovo QR.';
    client.initialize(); // Tenta riconnessione
});

// Gestione Messaggi
client.on('message', async msg => {
    if(msg.fromMe) return;

    try {
        const chat = await msg.getChat();
        await chat.sendStateTyping();

        console.log("Messaggio da:", msg.from);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: msg.body,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: TEMPERATURE
            }
        });

        await msg.reply(response.text);

    } catch (error) {
        console.error("Errore risposta:", error);
    }
});

client.initialize();
`;
    downloadFile('server.js', content);
  };
  // ---------------------------------------------

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto p-4 md:p-8" onClick={() => setIsDropdownOpen(false)}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Account Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative z-20">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Istanza Server</label>
             <button 
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                className="flex items-center space-x-3 bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-xl p-2 pr-4 transition-all min-w-[320px]"
             >
                <div className={`w-10 h-10 rounded-lg ${account.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                    <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">{account.name}</h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 font-mono truncate">{account.phoneNumber}</span>
                        {account.status === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Account Dropdown */}
             {isDropdownOpen && (
               <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="p-2 space-y-1">
                    {allAccounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => onSwitchAccount(acc.id)}
                        className={`w-full flex items-center p-2 rounded-lg transition-colors ${acc.id === account.id ? 'bg-emerald-50 text-[#00a884]' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                         <div className={`w-8 h-8 rounded-md ${acc.avatarColor} flex items-center justify-center text-white font-bold text-sm mr-3`}>
                            {acc.name.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{acc.name}</div>
                            <div className="text-xs opacity-70 flex justify-between">
                                <span>{acc.phoneNumber}</span>
                                {acc.status === 'connected' && <span className="text-emerald-600 font-bold text-[10px]">ONLINE</span>}
                            </div>
                         </div>
                         {acc.id === account.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
               </div>
             )}
          </div>
          
          <div className="flex items-center space-x-3">
             <button
                onClick={() => setShowDeployGuide(true)}
                className="flex items-center px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
             >
                <HelpCircle className="w-3.5 h-3.5 mr-2" />
                Guida FastComet
             </button>
             
             <div className="text-right hidden md:block border-l border-slate-200 pl-3 ml-1">
                 <div className="text-xs text-slate-400 font-medium">Ultimo Deploy</div>
                 <div className="text-sm font-mono text-slate-600">{lastDeployed?.toLocaleTimeString()}</div>
             </div>
             
             <div className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide ml-2 ${
                 account.status === 'connected' 
                 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                 : 'bg-red-100 text-red-700 border-red-200'
             }`}>
                 {account.status === 'connected' ? 'Cloud Link Active' : 'Cloud Link Offline'}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Editor */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Script Editor Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center space-x-2">
                        <Cloud className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Istruzioni Bot (Prompt)</h3>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-[#00a884] flex items-center transition-colors font-medium px-2 py-1 rounded hover:bg-slate-100"
                    >
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      Ripristina Default
                    </button>
                  </div>
                  
                  <textarea
                    value={localConfig.systemInstruction}
                    onChange={(e) => handleConfigChange('systemInstruction', e.target.value)}
                    className="flex-1 w-full px-6 py-5 resize-none outline-none text-slate-700 font-mono text-sm leading-relaxed"
                    placeholder="Scrivi qui le istruzioni per il tuo bot. Esempio: Sei un assistente per una pizzeria. Accetta prenotazioni solo se..."
                  />

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Supporta Markdown e Emoji</span>
                    <span>{localConfig.systemInstruction.length} chars</span>
                  </div>
                </div>

                {/* Export Real Bot Section */}
                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Server className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-[#00a884]" />
                        Esporta Bot per FastComet (Node.js)
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xl">
                        Versione 2.0 (Fix 503): Il nuovo codice mostra il QR Code direttamente sul tuo dominio 
                        (es. <code>aleasistemi.eu/chatbot-whatsapp/</code>) invece che nei log.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button 
                            onClick={generateServerJs}
                            disabled={!localConfig.apiKey}
                            className={`flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors ${!localConfig.apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FileCode className="w-5 h-5 mr-3 text-yellow-400" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Scarica server.js</div>
                                <div className="text-xs text-slate-500">v2.0 con Web QR</div>
                            </div>
                        </button>
                        
                        <button 
                             onClick={generatePackageJson}
                             className="flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            <FileJson className="w-5 h-5 mr-3 text-red-400" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Scarica package.json</div>
                                <div className="text-xs text-slate-500">Aggiornato</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Settings & Key */}
            <div className="space-y-6">
                
                {/* API Key Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                    
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center">
                        <Key className="w-4 h-4 mr-2 text-[#00a884]" />
                        Licenza & API Key
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Chiave necessaria per il file <code>server.js</code>.
                    </p>

                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={localConfig.apiKey || ''}
                                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                                placeholder="Incolla qui la tua API Key..."
                                className={`w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent transition-all ${!localConfig.apiKey ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`}
                            />
                            <button 
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Params */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 className="font-bold text-slate-900 mb-4">Parametri Comportamento</h3>
                   
                   <div className="mb-2">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-slate-700">Creatività (Temperature)</label>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">{localConfig.temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={localConfig.temperature}
                        onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a884]"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide">
                        <span>Preciso</span>
                        <span>Creativo</span>
                      </div>
                   </div>
                </div>

                <div className="pt-4 sticky bottom-4">
                  <button
                    onClick={handleDeploy}
                    disabled={(!isDirty && !!localConfig.apiKey) || isDeploying}
                    className={`w-full flex items-center justify-center py-4 px-4 rounded-xl font-bold text-white transition-all shadow-lg transform active:scale-95 border-b-4 ${
                      isDirty || !localConfig.apiKey
                        ? 'bg-[#00a884] hover:bg-[#008f6f] border-[#007a5e] shadow-emerald-200' 
                        : 'bg-slate-300 border-slate-400 cursor-not-allowed shadow-none text-slate-500'
                    }`}
                  >
                    {isDeploying ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Salvataggio...
                        </>
                    ) : (
                        <>
                            <UploadCloud className="w-5 h-5 mr-2" />
                            {isDirty ? 'Aggiorna Configurazione' : 'Configurazione Salvata'}
                        </>
                    )}
                  </button>
                </div>
            </div>
        </div>

        {/* Modal Guida FastComet - UPDATED FOR NODE.JS APP */}
        {showDeployGuide && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-[#00a884] p-6 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-3">
                     <div className="bg-white/20 p-2 rounded-lg">
                        <Server className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold">Deploy 24/7 su FastComet</h2>
                        <p className="text-white/80 text-sm">Guida per Node.js App</p>
                     </div>
                  </div>
                  <button onClick={() => setShowDeployGuide(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                 <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 text-sm text-amber-800 flex items-start">
                    <MonitorOff className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                    <p>
                        <strong>Hai errore 503?</strong> Ho aggiornato i file per risolvere il problema. Segui i punti 1 e 3 attentamente.
                    </p>
                 </div>

                 <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                    Scarica i NUOVI File
                 </h3>
                 <p className="text-slate-600 text-sm mb-4 pl-8">
                    Usa i pulsanti neri "Esporta Bot" per scaricare la <strong>versione 2.0</strong> di <code>server.js</code> e <code>package.json</code>.
                 </p>

                 <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                    Sovrascrivi su cPanel
                 </h3>
                 <div className="space-y-4 pl-8 border-l-2 border-slate-100 ml-3 text-sm text-slate-600">
                    <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">A.</span>
                       <div>Vai su FastComet &gt; File Manager.</div>
                    </div>
                    <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">B.</span>
                       <div>Entra nella cartella <code>chatbot-whatsapp</code>.</div>
                    </div>
                    <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">C.</span>
                       <div>Cancella i vecchi file e carica i nuovi.</div>
                    </div>
                 </div>

                 <h3 className="font-bold text-slate-900 mb-4 mt-6 flex items-center">
                    <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
                    Installa Librerie e Riavvia (Fondamentale)
                 </h3>
                  <div className="space-y-4 pl-8 border-l-2 border-slate-100 ml-3 text-sm text-slate-600">
                    <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">A.</span>
                       <div>Vai su "Setup Node.js App".</div>
                    </div>
                    <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">B.</span>
                       <div>Clicca su <strong>"Run NPM Install"</strong> (deve installare 'qrcode').</div>
                    </div>
                     <div className="flex items-start">
                       <span className="font-bold mr-2 text-slate-800">C.</span>
                       <div>Clicca il pulsante verde <strong>"Restart"</strong>.</div>
                    </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-slate-100 bg-emerald-50/50 -mx-8 px-8 pb-4">
                     <h4 className="font-bold text-sm text-slate-800 mb-2 mt-4 flex items-center"><Globe className="w-4 h-4 mr-2"/>Test Finale</h4>
                     <p className="text-xs text-slate-600">
                       Ora apri il tuo link (es. <code>aleasistemi.eu/chatbot-whatsapp/</code>).
                       Dovresti vedere una pagina bianca con il <strong>QR Code</strong> al centro!
                     </p>
                 </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                 <button 
                    onClick={() => setShowDeployGuide(false)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                 >
                    Ho capito
                 </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};