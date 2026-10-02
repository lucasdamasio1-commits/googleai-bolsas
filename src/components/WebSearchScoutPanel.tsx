import React, { useState } from 'react';
import {
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Copy,
  Check,
  Download,
  PlusCircle,
  RefreshCw,
  BookOpen,
  ArrowRight,
  MousePointerClick,
  FileText,
  Mail,
  ListOrdered
} from 'lucide-react';
import { WebScoutResult, DiscoveredOpportunity } from '../types';
import { searchWebScout, importDiscoveredOpportunities } from '../lib/search';

interface WebSearchScoutPanelProps {
  onImportSuccess?: () => void;
}

export const WebSearchScoutPanel: React.FC<WebSearchScoutPanelProps> = ({ onImportSuccess }) => {
  const [portalId, setPortalId] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [region, setRegion] = useState<'Brasil' | 'Europa' | 'EUA' | 'Mundo' | 'Todas'>('Todas');
  const [careerLevel, setCareerLevel] = useState<'Iniciação Científica' | 'Mestrado' | 'Doutorado' | 'Pós-Doutorado' | 'Treinamento Técnico' | 'Projetos de Pesquisa' | 'Extensão' | 'Todas'>('Todas');
  const [theme, setTheme] = useState<'Administração' | 'Marketing' | 'Comunicação' | 'Todas'>('Todas');
  const [customKeywords, setCustomKeywords] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [result, setResult] = useState<WebScoutResult | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'cards' | 'markdown' | 'trace'>('cards');

  const handleExecuteCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(1);
    setImportMessage(null);

    // Simulate animated progress through crawler phases
    const t1 = setTimeout(() => setLoadingStep(2), 700);
    const t2 = setTimeout(() => setLoadingStep(3), 1600);
    const t3 = setTimeout(() => setLoadingStep(4), 2600);

    try {
      const data = await searchWebScout({
        portalId,
        customUrl: portalId === 'custom' ? customUrl.trim() : undefined,
        region,
        careerLevel,
        theme,
        customKeywords: customKeywords.trim() || undefined,
        onlyActive,
      });
      setResult(data);
    } catch (err: any) {
      console.error('Erro no navegador institucional:', err);
      alert(err.message || 'Falha ao executar a navegação nos portais oficiais.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result?.markdownReport) return;
    navigator.clipboard.writeText(result.markdownReport);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!result?.markdownReport) return;
    const blob = new Blob([result.markdownReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-auditoria-institucional-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSingle = async (op: DiscoveredOpportunity) => {
    setImporting(true);
    try {
      const res = await importDiscoveredOpportunities([op]);
      setImportMessage(res.message);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao importar oportunidade.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportAllToCatalog = async () => {
    if (!result?.discoveredOpportunities || result.discoveredOpportunities.length === 0) return;
    setImporting(true);
    try {
      const res = await importDiscoveredOpportunities(result.discoveredOpportunities);
      setImportMessage(res.message);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao importar oportunidades.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-emerald-400 uppercase">
            <Globe className="w-3.5 h-3.5" />
            <span>Navegador & Auditor Institucional Ao Vivo</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-white leading-tight">
            Navegação em Portais Oficiais com Auditoria e Clique em Links Reais
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
            Este módulo navega diretamente pelos portais oficiais de agências governamentais e de fomento (FAPESP Oportunidades, Fulbright, Chevening UK, FCT Portugal), identifica botões e links de editais, clica e acessa a página de destino final para checar se a oportunidade realmente existe e está com inscrições ativas. <strong>Se não há link ou botão clicável, o item é sumariamente descartado.</strong>
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <MousePointerClick className="w-3.5 h-3.5" /> Clique real no botão & destino final confirmado
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Descarte de páginas sem link clicável
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verificação estrita de prazos vigentes
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Crawler Configuration */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5 h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
              Parâmetros de Navegação Institucional
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Selecione o portal e os filtros temáticos para o agente navegar
            </p>
          </div>

          <form onSubmit={handleExecuteCrawl} className="space-y-4">
            {/* 1. Target Portal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                1. Portal Oficial de Origem
              </label>
              <select
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              >
                <option value="all">Todos os Portais Oficiais (Brasil, Europa, EUA & Cooperação Internacional)</option>
                <option value="fapesp">FAPESP Oportunidades (fapesp.br/oportunidades/) — [95+ Editais Ao Vivo]</option>
                <option value="confap_international">CONFAP Internacional & Transnacionais (Europa / Horizon Europe)</option>
                <option value="humboldt">Fundação Alexander von Humboldt (Alemanha / Europa) — [Refinamento 1 Clique]</option>
                <option value="fulbright">Comissão Fulbright Brasil (Estados Unidos / EUA)</option>
                <option value="france_eiffel">Campus France / Bolsa Eiffel (França / Europa)</option>
                <option value="carolina">Fundación Carolina (Espanha / Europa & América Latina)</option>
                <option value="chevening">Chevening Scholarships UK (Reino Unido / Europa)</option>
                <option value="custom">URL Direta de Portal Governamental / Institucional Customizado</option>
              </select>
            </div>

            {/* Custom URL Input if selected */}
            {portalId === 'custom' && (
              <div className="bg-slate-50 border border-slate-300 rounded-md p-2.5 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  URL Direta do Portal de Editais
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://fapesp.br/oportunidades/ ou https://confap.org.br/news/category/chamadas/"
                  className="w-full bg-white border border-slate-300 rounded py-1.5 px-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  required
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  O robô acessará essa página, localizará links e botões de editais, navegará até a página final e conferirá o status HTTP 200 e links para submissão/edital.
                </p>
              </div>
            )}

            {/* 2. Theme */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                2. Área Temática (Prioridade Editorial)
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              >
                <option value="Todas">Todas as Áreas Prioritárias (Admin, Mkt, Comunicação)</option>
                <option value="Administração">Administração / Gestão / Governança</option>
                <option value="Marketing">Marketing / Inteligência Comercial</option>
                <option value="Comunicação">Comunicação / Divulgação Científica</option>
              </select>
            </div>

            {/* 3. Level */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                3. Nível Acadêmico / Modalidade
              </label>
              <select
                value={careerLevel}
                onChange={(e) => setCareerLevel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              >
                <option value="Todas">Todos os Níveis Acadêmicos</option>
                <option value="Iniciação Científica">Iniciação Científica (IC / Graduação)</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutorado">Doutorado</option>
                <option value="Pós-Doutorado">Pós-Doutorado</option>
                <option value="Treinamento Técnico">Treinamento Técnico (TT)</option>
                <option value="Projetos de Pesquisa">Projetos de Pesquisa / Docente</option>
                <option value="Extensão">Projetos de Extensão</option>
              </select>
            </div>

            {/* 4. Region */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                4. Região Geográfica
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              >
                <option value="Todas">Todas as Regiões (Brasil, Europa, EUA, Mundo)</option>
                <option value="Brasil">Brasil (FAPESP, CONFAP Nacional)</option>
                <option value="Europa">Europa (Alemanha/Humboldt, França/Eiffel, Espanha/Carolina, Reino Unido/Chevening, Horizon Europe)</option>
                <option value="EUA">Estados Unidos / EUA (Fulbright Brasil)</option>
                <option value="Mundo">Mundo (Cooperação Transnacional e Internacional)</option>
              </select>
            </div>

            {/* 5. Custom Keywords */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                5. Palavras-chave Específicas (Opcional)
              </label>
              <input
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="Ex: dados, ESG, finanças, sustentabilidade..."
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              />
            </div>

            {/* 6. Active only toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-800 mt-0.5"
                />
                <span className="text-xs text-slate-800 font-medium leading-tight">
                  Exigir estritamente prazos vigentes e inscrições ativas
                </span>
              </label>
              <p className="text-[10px] text-slate-500 pl-5 leading-relaxed">
                Descarta automaticamente certames com prazo expirado, cancelados ou encerrados nas páginas oficiais.
              </p>
            </div>

            {/* Rule Callout */}
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-md p-3 text-[11px] text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Diretriz Estrita de Navegação:
              </span>
              <p className="text-[10.5px] leading-relaxed text-emerald-800">
                O robô checa diretamente o código de cada oportunidade. Se houver um botão ou link clicável direcionando à vaga, o agente clica e confere o edital. Se não houver link clicável, a página é sumariamente descartada.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Navegando e auditando links oficiais...</span>
                </>
              ) : (
                <>
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Navegar no Portal e Auditar Oportunidades</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Execution View & Opportunities */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="font-serif font-bold text-slate-800 text-lg mb-1">
                Pronto para Navegação em Portais Oficiais
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                Selecione as opções à esquerda. O agente acessará os portais institucionais, localizará os botões clicáveis de editais, acessará o link de destino e confirmará se a oportunidade é real e está ativa antes de exibir.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <RefreshCw className="w-9 h-9 text-slate-800 animate-spin mx-auto" />
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base">
                  Navegando em Portais e Clicando nos Links Oficiais
                </h4>
                <p className="text-xs text-slate-500 max-w-sm font-sans leading-relaxed mt-1">
                  Executando verificação de código remoto sem alucinação sintética.
                </p>
              </div>

              {/* Step indicator */}
              <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs font-mono space-y-2">
                <div className={`flex items-center gap-2 ${loadingStep >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {loadingStep > 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>1. Acessando portal oficial (FAPESP, Fulbright, Chevening...)</span>
                </div>
                <div className={`flex items-center gap-2 ${loadingStep >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {loadingStep > 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : loadingStep === 2 ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>○</span>}
                  <span>2. Mapeando botões clicáveis e descartando páginas rasas</span>
                </div>
                <div className={`flex items-center gap-2 ${loadingStep >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {loadingStep > 3 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : loadingStep === 3 ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>○</span>}
                  <span>3. Clicando no link e auditando página final da chamada</span>
                </div>
                <div className={`flex items-center gap-2 ${loadingStep >= 4 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {loadingStep === 4 ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>○</span>}
                  <span>4. Confirmando prazo de inscrição e links de submissão</span>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Header Status Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {result.discoveredOpportunities.length} Oportunidades Auditadas no Link Final
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-lg mt-1">
                      Auditoria de Navegação Concluída
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveView('cards')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer border ${
                        activeView === 'cards'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Cards & Botões
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('trace')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer border ${
                        activeView === 'trace'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Rastro de Cliques ({result.navigationSteps?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('markdown')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer border ${
                        activeView === 'markdown'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Relatório (.md)
                    </button>
                  </div>
                </div>

                {/* Audit Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                  <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200/80">
                    <span className="text-emerald-700 block">Links Clicáveis Válidos:</span>
                    <strong className="text-emerald-900">{result.discoveredOpportunities.length} confirmados</strong>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded border border-amber-200/80">
                    <span className="text-amber-800 block">Sem Botão Clicável:</span>
                    <strong className="text-amber-900">{result.discardedNoClickableLink ?? 0} descartados</strong>
                  </div>
                  <div className="bg-rose-50/60 p-2 rounded border border-rose-200/80">
                    <span className="text-rose-700 block">Prazo Encerrado:</span>
                    <strong className="text-rose-900">{result.discardedExpiredOrInactive ?? 0} eliminados</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                    <span className="text-slate-500 block">Links Rasos/Genéricos:</span>
                    <strong className="text-slate-800">{result.genericLinksBlocked} bloqueados</strong>
                  </div>
                </div>

                {/* Action Buttons: Copy, Download, Import All */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-md flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    {copiedMd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Relatório Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar Relatório Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-md flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Baixar Relatório (.md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleImportAllToCatalog}
                    disabled={importing || result.discoveredOpportunities.length === 0}
                    className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{importing ? 'Importando...' : 'Adicionar Todas ao Catálogo Ativo'}</span>
                  </button>
                </div>

                {importMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{importMessage} Você pode consultá-las agora na aba principal de Catálogo!</span>
                  </div>
                )}
              </div>

              {/* VIEW 1: Cards View */}
              {activeView === 'cards' && (
                <div className="space-y-3.5">
                  {result.discoveredOpportunities.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                      Nenhuma oportunidade atendeu aos filtros selecionados mantendo botão clicável e prazo aberto.
                    </div>
                  ) : (
                    result.discoveredOpportunities.map((op, idx) => (
                      <div
                        key={op.id || idx}
                        className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-400 transition-colors space-y-3"
                      >
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <FileCheck2 className="w-3 h-3 text-emerald-600" /> Botão & Link Clicável Confirmado
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                            {op.statusLabel}
                          </span>
                          <span className="text-slate-700 font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            {op.provider}
                          </span>
                          <span className="text-slate-600 text-[11px]">
                            {op.country}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-serif font-bold text-slate-900 text-base leading-snug">
                          {op.title}
                        </h4>

                        {/* Meta strip */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span><strong>Nível:</strong> {op.careerLevel}</span>
                          <span>·</span>
                          <span><strong>Modalidade:</strong> {op.modality}</span>
                          <span>·</span>
                          <span><strong>Área:</strong> {op.theme}</span>
                          {op.deadline && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-slate-900">
                                <strong>Prazo:</strong> {new Date(op.deadline).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Navigation & Click Trace Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between text-slate-900 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Rastro de Navegação & Cliques no Edital:</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded font-bold">
                              Validação Direta HTTP {op.httpStatus || 200}
                            </span>
                          </div>

                          {op.stepTrail && op.stepTrail.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              {op.stepTrail.map((st) => (
                                <div key={st.stepNumber} className="flex items-start gap-2 text-[10.5px]">
                                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                    {st.stepNumber}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-slate-800">{st.title}:</span>{' '}
                                    <span className="text-slate-600">{st.action}</span>
                                    <div className="text-[9.5px] text-slate-400 truncate font-mono">{st.url}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10.5px] text-slate-600 space-y-1 pl-1">
                              <div>
                                <span className="text-slate-400">1. Portal de Origem:</span>{' '}
                                <span className="text-slate-800 underline">{op.portalOrigin}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-800">
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-500">Botão Clicado:</span>{' '}
                                <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  "{op.clickedButtonText}"
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400">2. Link Final Alcançado:</span>{' '}
                                <span className="text-emerald-700 font-semibold">{op.finalUrl}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Evidence quote */}
                        <div className="bg-slate-50/70 border border-slate-200/80 p-2.5 rounded text-[11px] font-mono text-slate-700 select-text">
                          <span className="text-slate-400 font-bold block mb-0.5">Evidência Confirmada no Código HTML da Página Final:</span>
                          {op.evidenceQuote || op.extractedSnippet}
                        </div>

                        {/* Direct Action Buttons on destination */}
                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Primary Link Button (Mandatory) */}
                            <a
                              href={op.finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
                            >
                              <span>Acessar Edital no Link Final</span>
                              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                            </a>

                            {/* Secondary Action: Processo BV FAPESP */}
                            {op.editalProcessUrl && (
                              <a
                                href={op.editalProcessUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-medium rounded-md transition-colors border border-blue-200"
                              >
                                <span>Processo Oficial (BV FAPESP)</span>
                                <ExternalLink className="w-3 h-3 text-blue-600" />
                              </a>
                            )}

                            {/* Secondary Action: Edital PDF */}
                            {op.editalPdfUrl && (
                              <a
                                href={op.editalPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-md transition-colors border border-slate-200"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edital Oficial (PDF)</span>
                              </a>
                            )}

                            {/* Secondary Action: E-mail for submission */}
                            {op.applicationEmail && (
                              <a
                                href={`mailto:${op.applicationEmail}`}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-md transition-colors border border-slate-200"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-600" />
                                <span>Inscrição por E-mail</span>
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleImportSingle(op)}
                            disabled={importing}
                            className="text-xs text-slate-700 hover:text-slate-900 font-medium px-2.5 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Adicionar ao Catálogo</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VIEW 2: Navigation Steps Trace */}
              {activeView === 'trace' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-slate-600" />
                      Rastro Completo de Ações e Cliques Executados
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {result.navigationSteps?.length || 0} passos auditados
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                    {result.navigationSteps?.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                          step.isActive
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-sm">Origem: {step.portal}</span>
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            step.httpStatus === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            HTTP {step.httpStatus}
                          </span>
                        </div>

                        <div className="pl-6 text-[11px] text-slate-800">
                          <strong>Ação do Agente:</strong> Clique no botão "{step.clickedButton}"
                        </div>

                        <div className="pl-6 text-[10.5px] text-slate-600 truncate">
                          ↳ <strong>Destino Final:</strong>{' '}
                          <a href={step.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                            {step.destinationUrl}
                          </a>
                        </div>

                        {step.reason && (
                          <div className="pl-6 text-[10px] text-slate-500 italic">
                            Status: {step.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 3: Raw Markdown Report Container */}
              {activeView === 'markdown' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500 border-b border-slate-100 pb-2">
                    <span className="font-mono uppercase font-bold text-slate-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      Documento Estruturado em Markdown
                    </span>
                    <span className="font-mono text-[11px]">
                      {result.markdownReport.length} caracteres
                    </span>
                  </div>

                  <pre className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text max-h-[550px] overflow-y-auto">
                    {result.markdownReport}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
