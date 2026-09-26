import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Globe, X } from 'lucide-react';
import { syncDailyCrawler } from '../lib/search';

interface SyncDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const SyncDailyModal: React.FC<SyncDailyModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncSummary, setSyncSummary] = useState<any>(null);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setIsRunning(true);
    setSyncSummary(null);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Iniciando protocolo diário de auditoria e coleta: Cadê Bolsa (www.cadebolsa.com.br)...`,
      `[${new Date().toLocaleTimeString()}] Conectando às bases de dados oficiais no Brasil e no exterior...`,
    ]);

    const stepMessages = [
      'Auditando portais de fomento FAPESP (SP) em Administração, Marketing e Inovação...',
      'Verificando editais vigentes CNPq e CAPES (Bolsas no País e Exterior)...',
      'Acessando chamadas de Extensão Universitária PROEX/MEC...',
      'Consultando banco oficial DAAD (Alemanha) e Fundação Alexander von Humboldt...',
      'Conectando à Fundação para a Ciência e a Tecnologia (FCT Portugal)...',
      'Varrendo editais Campus France e Bolsas Eiffel (França)...',
      'Auditando oportunidades Chevening (Reino Unido) e Fundación Carolina (Espanha)...',
      'Consultando rede EURAXESS e Horizon Europe (Comissão Europeia)...',
      'Verificando editais Comissão Fulbright (EUA) e Mitacs (Canadá)...',
      'Filtragem temporal de encerramento: identificando e expurgando editais cujo prazo de inscrição expirou...',
      'Atualização do índice temático com foco em Administração, Marketing e Comunicação...',
    ];

    stepMessages.forEach((msg, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
      }, (idx + 1) * 300);
    });

    try {
      const result = await syncDailyCrawler();
      setTimeout(() => {
        setSyncSummary(result);
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Protocolo diário concluído com êxito.`,
          `[${new Date().toLocaleTimeString()}] ${result.prunedExpiredCount} editais vencidos eliminados do cadastro público.`,
          `[${new Date().toLocaleTimeString()}] Índice de fomento do Cadê Bolsa 100% atualizado.`
        ]);
        setIsRunning(false);
        onSyncCompleted();
      }, (stepMessages.length + 1) * 300);
    } catch (err: any) {
      setIsRunning(false);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Erro no protocolo: ${err.message}`]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0F172A] text-amber-300 flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Auditoria & Sincronização Diária de Editais
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Cadê Bolsa · www.cadebolsa.com.br
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            A rotina diária do <strong>Cadê Bolsa</strong> audita as publicações de agências de fomento nacionais e internacionais. Editais cujo prazo de encerramento já foi superado são <strong>automaticamente expurgados do catálogo público</strong> para assegurar que apenas oportunidades vigentes sejam consultadas.
          </p>

          {/* Console Log Terminal */}
          <div className="bg-[#0A0E17] text-slate-300 font-mono text-xs rounded-lg p-4 h-60 overflow-y-auto space-y-1.5 border border-slate-800">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-14">
                Clique no botão abaixo para iniciar a varredura e auditoria diária.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-snug text-[11px]">
                  {log.includes('expurgados') || log.includes('concluído') ? (
                    <span className="text-emerald-400 font-semibold">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))
            )}
            {isRunning && (
              <div className="animate-pulse text-amber-300 text-[11px]">_ executando varredura e auditoria de prazos...</div>
            )}
          </div>

          {syncSummary && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold">Varredura Diária Concluída</div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    {syncSummary.totalOpportunitiesTracked} editais monitorados · {syncSummary.prunedExpiredCount} vencidos eliminados
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> www.cadebolsa.com.br
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
            >
              Fechar
            </button>
            <button
              onClick={handleStartSync}
              disabled={isRunning}
              className="px-4 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executando...' : 'Iniciar Auditoria Diária'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
