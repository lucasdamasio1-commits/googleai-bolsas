import React from 'react';
import { RefreshCw, Bot, Bell, BookOpen, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'ai-scout' | 'web-search' | 'subscribe';
  setActiveTab: (tab: 'catalog' | 'ai-scout' | 'web-search' | 'subscribe') => void;
  onOpenSyncModal: () => void;
  isSyncing: boolean;
  totalActive: number;
  totalExpiredEliminated: number;
  lastSyncDate: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSyncModal,
  isSyncing,
  totalActive,
  totalExpiredEliminated,
  lastSyncDate,
}) => {
  const formattedSyncTime = new Date(lastSyncDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Institutional Micro-bar */}
      <div className="bg-[#0F172A] text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-3">
            <span className="font-semibold tracking-wider text-slate-100 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-amber-400" />
              PORTAL OFICIAL: <strong className="text-white font-mono tracking-normal">www.cadebolsa.com.br</strong>
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">
              Fomento à Pesquisa, Iniciação Científica, Pós-Graduação e Extensão
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Varredura Diária:</span> {formattedSyncTime}
            </span>
            <span>·</span>
            <span className="text-slate-300 font-mono tabular-nums">{totalActive} ativas</span>
            <span>·</span>
            <span className="text-amber-300/90 font-mono tabular-nums">{totalExpiredEliminated} expiradas expurgadas</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Wordmark (Academic Press Style) */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('catalog')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0F172A] text-amber-400 flex items-center justify-center font-serif text-lg sm:text-xl border border-slate-700 shadow-xs shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5 sm:space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] group-hover:text-blue-900 transition-colors">
                  Cadê Bolsa
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono tracking-tight text-slate-500 hidden sm:inline">
                  cadebolsa.com.br
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-widest font-sans font-medium line-clamp-1">
                Agregador Acadêmico de Fomento
              </p>
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Sync Button */}
            <button
              onClick={onOpenSyncModal}
              disabled={isSyncing}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors border border-slate-200 cursor-pointer disabled:opacity-60"
              title="Executar sincronização e varredura diária de fontes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Varredura Diária</span>
            </button>

            {/* AI Scout Button */}
            <button
              onClick={() => setActiveTab('ai-scout')}
              className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-3.5 py-1.5 min-h-[38px] text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'ai-scout'
                  ? 'bg-[#0F172A] text-amber-300 shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Agente IA</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Editorial Clean Underscore Style - Mobile Horizontal Scrollable) */}
        <div className="flex space-x-4 sm:space-x-8 border-t border-slate-100 -mb-px text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'catalog'
                ? 'border-[#0F172A] text-[#0F172A] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catálogo</span>
            <span className="font-mono text-slate-400 tabular-nums font-normal">({totalActive})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-scout')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'ai-scout'
                ? 'border-[#0F172A] text-[#0F172A] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agente Scout</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1 py-0.2 rounded font-mono font-semibold">
              IA
            </span>
          </button>

          <button
            onClick={() => setActiveTab('web-search')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'web-search'
                ? 'border-[#0F172A] text-[#0F172A] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Navegador Institucional</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ao Vivo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subscribe')}
            className={`py-3 px-1 border-b-2 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer transition-colors shrink-0 ${
              activeTab === 'subscribe'
                ? 'border-[#0F172A] text-[#0F172A] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alertas por E-mail</span>
          </button>
        </div>
      </div>
    </header>
  );
};
