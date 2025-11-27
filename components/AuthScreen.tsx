import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, Database } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simula delay network
    await new Promise(r => setTimeout(r, 1000));

    if (isLogin) {
      const result = authService.login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Errore login');
      }
    } else {
      if (!name) {
        setError("Il nome è obbligatorio");
        setIsLoading(false);
        return;
      }
      const result = authService.register(name, email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Errore registrazione');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00a884] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col md:flex-row max-w-4xl h-auto md:h-[600px]">
        
        {/* Left Side: Brand (Visible on desktop) */}
        <div className="hidden md:flex w-1/2 bg-slate-950 p-12 flex-col justify-between text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
             <div>
                <div className="flex items-center space-x-3 mb-6">
                    <Database className="w-8 h-8 text-[#00a884]" />
                    <span className="text-2xl font-bold tracking-tight">BotManager SaaS</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">Gestisci i tuoi Agenti AI WhatsApp.</h2>
                <p className="text-slate-400">Piattaforma multi-utente per automatizzare il supporto clienti. Installa sui tuoi server, gestisci dal cloud.</p>
             </div>
             
             <div className="space-y-4 text-sm text-slate-500">
                <div className="flex items-center"><div className="w-2 h-2 bg-[#00a884] rounded-full mr-3"></div>Dashboard Centralizzata</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>Multi-Account</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>Gemini AI Integrata</div>
             </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{isLogin ? 'Bentornato' : 'Crea Account'}</h3>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Accedi alla tua dashboard di controllo.' : 'Inizia la tua prova gratuita oggi stesso.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a884] focus:border-transparent outline-none transition-all"
                    placeholder="Mario Rossi"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a884] focus:border-transparent outline-none transition-all"
                  placeholder="nome@azienda.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a884] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center transform active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Accedi alla Dashboard' : 'Registrati Ora'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {isLogin ? "Non hai ancora un account?" : "Hai già un account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 font-bold text-[#00a884] hover:underline"
              >
                {isLogin ? "Registrati" : "Accedi"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center text-slate-600 text-xs">
         &copy; 2024 BotManager SaaS Platform. v2.0 Multi-User
      </div>
    </div>
  );
};