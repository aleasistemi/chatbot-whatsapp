import React, { useState, useEffect } from 'react';
import { BotAccount, DEFAULT_INSTRUCTION } from '../types';
import { Save, RefreshCw, ChevronDown, Check, Smartphone, Cloud, UploadCloud, Loader2, Power, Key, ExternalLink, ShieldAlert, Eye, EyeOff, HelpCircle, X, Server, FileUp, Globe, MonitorOff, Download, FileJson, FileCode, Terminal, Link as LinkIcon, Zap, Trash2 } from 'lucide-react';

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
  const [serverUrl, setServerUrl] = useState(localStorage.getItem(`server_url_${account.id}`) || '');
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
    setServerUrl(localStorage.getItem(`server_url_${account.id}`) || '');
  }, [account.id]);

  const handleConfigChange = (field: keyof typeof localConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleUrlChange = (val: string) => {
      setServerUrl(val);
      localStorage.setItem(`server_url_${account.id}`, val);
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

  // --- GENERATION LOGIC FOR REAL SERVER CODE (BAILEYS EDITION V4.1) ---
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
      "name": `whatsapp-bot-v4`,
      "version": "4.1.0",
      "description": "Bot WhatsApp Baileys V4.1 (No Puppeteer)",
      "main": "server.js",
      "scripts": {
        "start": "node server.js"
      },
      "dependencies": {
        "@whiskeysockets/baileys": "^6.6.0",
        "qrcode": "^1.5.3", 
        "@google/genai": "^1.30.0",
        "pino": "^7.0.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    };
    downloadFile('package.json', JSON.stringify(pkg, null, 2));
  };

  const generateServerJs = () => {
    const content = `/**
 * BOT WA V4.1 - LIGHTWEIGHT EDITION (NO PUPPETEER/CHROME)
 * Motore: Baileys (WebSocket)
 * Compatibile con FastComet/cPanel Shared Hosting
 * Configurazione: ${account.name}
 * Generato il: ${new Date().toLocaleString()}
 */

const http = require('http');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const { GoogleGenAI } = require("@google/genai");
const pino = require('pino');
const fs = require('fs');

// --- SERVER WEB PER CPANEL KEEP-ALIVE ---
const PORT = process.env.PORT || 3000;

// Stato Globale
let qrCodeDataUrl = '';
let statusMessage = 'Inizializzazione V4.1...';
let isConnected = false;
let logs = [];
let retryCount = 0;

function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    logs.unshift(\`[\${time}] \${msg}\`);
    if(logs.length > 50) logs.pop();
    console.log(msg);
}

// Configurazione AI
const API_KEY = "${localConfig.apiKey || ''}";
const SYSTEM_INSTRUCTION = \`${localConfig.systemInstruction.replace(/`/g, '\\`')}\`;
let ai;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (e) { addLog("Errore AI config: " + e.message); }


// 1. Web Server UI (BACKGROUND AZZURRO PER DISTINGUERE V4)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    let html = \`
    <!DOCTYPE html>
    <html>
        <head>
            <title>Bot V4.1: ${account.name}</title>
            <meta http-equiv="refresh" content="5">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: sans-serif; background: #e0f2fe; color: #0c4a6e; padding: 20px; text-align: center; }
                .card { background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #bae6fd; }
                .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; font-size: 14px; }
                .online { background: #d9fdd3; color: #008069; }
                .wait { background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; }
                .log-box { text-align: left; background: #0f172a; color: #38bdf8; padding: 15px; border-radius: 8px; font-size: 11px; margin-top: 20px; max-height: 300px; overflow-y: auto; font-family: monospace; white-space: pre-wrap; }
                h1 { color: #0369a1; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>💎 ${account.name} (V4.1)</h1>
                <div class="status-badge \${isConnected ? 'online' : 'wait'}">
                    \${isConnected ? '✅ ONLINE & ATTIVO' : '⏳ STATO: ' + statusMessage}
                </div>
    \`;

    if (qrCodeDataUrl && !isConnected) {
        html += \`
            <div style="background: #fff; padding: 20px; border: 2px dashed #0284c7; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #0284c7; margin-top: 0;">SCANSIONA ORA IL QR:</h3>
                <img src="\${qrCodeDataUrl}" alt="QR Code" width="280" />
                <p>Apri WhatsApp > Impostazioni > Dispositivi collegati</p>
            </div>
        \`;
    }

    html += \`
                <div class="log-box">
                    \${logs.map(l => \`<div>\${l}</div>\`).join('')}
                </div>
                <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
                   <strong>Engine:</strong> Baileys (WebSocket) • <strong>No Chrome/Puppeteer</strong><br/>
                   Server Node.js V4.1
                </p>
            </div>
        </body>
    </html>
    \`;
    res.end(html);
});

server.listen(PORT, () => {
    addLog(\`WEB SERVER V4.1 STARTED ON PORT \${PORT}\`);
    startBaileys();
});


// 2. LOGICA BAILEYS (Lightweight WhatsApp)
async function startBaileys() {
    addLog("Avvio modulo Baileys...");
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Gestiamo noi il QR
        logger: pino({ level: 'silent' }), // Zittiamo i log interni
        browser: ["${account.name}", "Chrome", "120.0.6099.199"], // Spoof browser, non lancia Chrome vero!
        connectTimeoutMs: 60000,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if(qr) {
            statusMessage = "QR Code Pronto.";
            addLog("QR Code ricevuto! Visualizzalo sopra.");
            qrcode.toDataURL(qr, (err, url) => {
                if(!err) qrCodeDataUrl = url;
            });
        }

        if(connection === 'close') {
            isConnected = false;
            qrCodeDataUrl = '';
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            addLog('Connessione chiusa. Riconnessione: ' + shouldReconnect);
            statusMessage = "Disconnesso. Riprovo...";
            
            if(shouldReconnect) {
                setTimeout(startBaileys, 3000);
            } else {
                addLog("Sessione scaduta (Logout). Cancella cartella 'auth_info_baileys' per riavviare.");
                statusMessage = "Sessione Scaduta. Riavviare pulito.";
            }
        } else if(connection === 'open') {
            isConnected = true;
            qrCodeDataUrl = '';
            statusMessage = "Connesso a WhatsApp!";
            addLog(">>> DISPOSITIVO CONNESSO CON SUCCESSO <<<");
            retryCount = 0;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if(type !== 'notify') return;
        
        for(const msg of messages) {
            if(!msg.message || msg.key.fromMe) continue; // Ignora i nostri messaggi

            const remoteJid = msg.key.remoteJid;
            const textBody = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if(!textBody) continue;

            addLog(\`Messaggio da \${remoteJid.substring(0,6)}...: \${textBody.substring(0, 20)}...\`);

            try {
                if(ai) {
                    await sock.sendPresenceUpdate('composing', remoteJid);
                    
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: textBody,
                        config: { systemInstruction: SYSTEM_INSTRUCTION }
                    });
                    
                    const replyText = response.text;
                    await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg });
                    addLog("Risposto con AI.");
                }
            } catch (e) {
                addLog("Errore risposta AI: " + e.message);
            }
        }
    });
}
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
                className="flex items-center px-3 py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors shadow-sm"
             >
                <Zap className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                Guida Installazione v4.1
             </button>
             
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
                        <Zap className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center text-blue-300">
                        <Download className="w-5 h-5 mr-2" />
                        Step 1: Scarica File V4.1
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xl">
                        Versione <strong>4.1 Clean Install</strong>. Risolve definitivamente l'errore "Browser Process" usando Baileys. <br/>
                        <span className="text-yellow-400 font-bold">NOTA: Devi cancellare la cartella node_modules prima di caricare questi file!</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button 
                            onClick={generateServerJs}
                            disabled={!localConfig.apiKey}
                            className={`flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors ${!localConfig.apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FileCode className="w-5 h-5 mr-3 text-blue-400" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Scarica server.js</div>
                                <div className="text-xs text-slate-500">v4.1 Baileys (No Puppeteer)</div>
                            </div>
                        </button>
                        
                        <button 
                             onClick={generatePackageJson}
                             className="flex-1 flex items-center justify-center p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            <FileJson className="w-5 h-5 mr-3 text-red-400" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Scarica package.json</div>
                                <div className="text-xs text-slate-500">Nuove Dipendenze v4.1</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. Connection Link Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-slate-900">
                        <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Step 2: Verifica e Connetti
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Dopo aver caricato i file e riavviato su FastComet, apri questo link. <br/>
                        <span className="font-bold text-slate-700">Se vedi una pagina AZZURRA, è la V4.1 corretta. Se è bianca, è ancora la vecchia.</span>
                    </p>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="https://iltuosito.com/bot/"
                            value={serverUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <a 
                            href={serverUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => !serverUrl && e.preventDefault()}
                            className={`px-6 py-2 rounded-lg font-bold text-white flex items-center ${serverUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            APRI (Cerca Pagina Azzurra) <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
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
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={localConfig.apiKey || ''}
                                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                                placeholder="Incolla qui la tua API Key..."
                                className={`w-full pl-3 pr-10 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#00a884] transition-all ${!localConfig.apiKey ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`}
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
                        <label className="text-sm font-medium text-slate-700">Creatività</label>
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

        {/* Modal Guida FastComet V4.1 */}
        {showDeployGuide && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-3">
                     <div className="bg-white/20 p-2 rounded-lg">
                        <Trash2 className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold">Installazione Pulita V4.1</h2>
                        <p className="text-blue-100 text-sm">Passaggio a Baileys (No Puppeteer)</p>
                     </div>
                  </div>
                  <button onClick={() => setShowDeployGuide(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                 <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-sm text-red-800 flex items-start">
                    <ShieldAlert className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                    <p>
                        <strong>Se vedi errore Puppeteer:</strong> Significa che stai ancora usando i file vecchi. La V4.1 non ha Puppeteer. Segui la procedura qui sotto per rimuoverli.
                    </p>
                 </div>

                 <h3 className="font-bold text-slate-900 mb-4">Procedura CLEAN INSTALL:</h3>
                 <ol className="list-decimal list-inside space-y-4 text-slate-600 ml-2 text-sm">
                    <li>Scarica i nuovi file <strong>server.js</strong> (V4.1) e <strong>package.json</strong> da questa schermata.</li>
                    <li>
                        Vai su FastComet File Manager e <strong>CANCELLA</strong> la cartella <code>node_modules</code>.
                        <br/><span className="text-xs text-slate-400 ml-5">Questo rimuove la vecchia libreria Puppeteer.</span>
                    </li>
                    <li>Carica i due nuovi file sovrascrivendo quelli esistenti.</li>
                    <li>Vai su <strong>Setup Node.js App</strong> nel cPanel.</li>
                    <li>Clicca il pulsante <strong>Run NPM Install</strong> e aspetta che finisca.</li>
                    <li>Clicca <strong>RESTART</strong>.</li>
                 </ol>
                 
                 <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded text-center">
                     <p className="text-blue-800 font-bold text-sm">Come capire se funziona?</p>
                     <p className="text-blue-600 text-xs">Apri il tuo link. Se la pagina è <strong className="text-blue-800">AZZURRA</strong>, hai installato la V4.1 correttamente.</p>
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