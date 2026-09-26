import React from 'react';
import {
  Search,
  Globe,
  Award,
  X,
  ShieldCheck,
  BookmarkCheck,
  FileCheck2,
  AlertTriangle,
  GraduationCap,
  ArrowUpDown,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTheme: string;
  setSelectedTheme: (t: string) => void;
  selectedCountry: string;
  setSelectedCountry: (c: string) => void;
  selectedModality: string;
  setSelectedModality: (m: string) => void;
  selectedLinkClassification: string;
  setSelectedLinkClassification: (v: string) => void;
  selectedVerificationStatus: string;
  setSelectedVerificationStatus: (v: string) => void;
  selectedCareerLevel: string;
  setSelectedCareerLevel: (v: string) => void;
  selectedSortBy: string;
  setSelectedSortBy: (v: string) => void;
  includeExpired: boolean;
  setIncludeExpired: (v: boolean) => void;
  totalExpiredHidden: number;
  totalDirectLinks?: number;
  totalWebFindings?: number;
  totalVerifiedOnPage?: number;
  totalDisqualifiedEliminated?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTheme,
  setSelectedTheme,
  selectedCountry,
  setSelectedCountry,
  selectedModality,
  setSelectedModality,
  selectedLinkClassification,
  setSelectedLinkClassification,
  selectedVerificationStatus,
  setSelectedVerificationStatus,
  selectedCareerLevel,
  setSelectedCareerLevel,
  selectedSortBy,
  setSelectedSortBy,
  includeExpired,
  setIncludeExpired,
  totalExpiredHidden,
  totalDirectLinks = 0,
  totalWebFindings = 0,
  totalVerifiedOnPage = 0,
  totalDisqualifiedEliminated = 0,
}) => {
  const priorityThemes: { id: string; label: string }[] = [
    { id: 'Administração', label: 'Administração' },
    { id: 'Marketing', label: 'Marketing' },
    { id: 'Comunicação', label: 'Comunicação' },
  ];

  const secondaryThemes: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos os Temas' },
    { id: 'Ciências Sociais Aplicadas', label: 'Ciências Sociais' },
    { id: 'Tecnologia e Inovação', label: 'Tecnologia & IA' },
    { id: 'Economia e Finanças', label: 'Economia & Finanças' },
    { id: 'Sustentabilidade e ESG', label: 'Sustentabilidade & ESG' },
  ];

  const modalities: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas as Modalidades' },
    { id: 'Iniciação Científica', label: 'Iniciação Científica (IC)' },
    { id: 'Mestrado', label: 'Mestrado' },
    { id: 'Doutorado', label: 'Doutorado' },
    { id: 'Pós-Doutorado', label: 'Pós-Doutorado' },
    { id: 'Projeto de Pesquisa', label: 'Projeto de Pesquisa' },
    { id: 'Projeto de Extensão', label: 'Projeto de Extensão' },
  ];

  const careerLevels: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos os Níveis Acadêmicos' },
    { id: 'Graduação', label: 'Graduação (Iniciação Científica)' },
    { id: 'Mestrado', label: 'Mestrado' },
    { id: 'Doutorado', label: 'Doutorado' },
    { id: 'Pós-Doutorado', label: 'Pós-Doutorado' },
    { id: 'Pesquisador / Docente', label: 'Pesquisador / Docente' },
  ];

  const countries: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos os Países' },
    { id: 'Brasil', label: 'Brasil (FAPESP, CNPq, CAPES, PROEX)' },
    { id: 'Portugal', label: 'Portugal (FCT, Gulbenkian)' },
    { id: 'Alemanha', label: 'Alemanha (DAAD, Humboldt)' },
    { id: 'França', label: 'França (Campus France, Eiffel)' },
    { id: 'Reino Unido', label: 'Reino Unido (Chevening)' },
    { id: 'Espanha', label: 'Espanha (Fundación Carolina)' },
    { id: 'Suíça', label: 'Suíça (Swiss Government)' },
    { id: 'União Europeia', label: 'União Europeia (Horizon, MSCA)' },
    { id: 'Estados Unidos', label: 'Estados Unidos (Fulbright)' },
    { id: 'Canadá', label: 'Canadá (Mitacs, Vanier)' },
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedTheme !== 'all' ||
    selectedCountry !== 'all' ||
    selectedModality !== 'all' ||
    selectedLinkClassification !== 'all' ||
    selectedVerificationStatus !== 'all' ||
    selectedCareerLevel !== 'all' ||
    selectedSortBy !== 'urgency';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTheme('all');
    setSelectedCountry('all');
    setSelectedModality('all');
    setSelectedLinkClassification('all');
    setSelectedVerificationStatus('all');
    setSelectedCareerLevel('all');
    setSelectedSortBy('urgency');
    setIncludeExpired(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5 mb-8 space-y-5">
      {/* 1. Main Search Input Bar with Clear Button */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="main-search" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            Pesquisa no Acervo & Refinamento de Editais
          </label>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Sistema Cadê Bolsa · Checagem Anti-Alucinação
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            id="main-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite palavras-chave, órgão, área ou termo (ex: ESG, Consumidor, FAPESP, Chevening, Extensão, CNPq...)"
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50/70 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* 2. CONFERÊNCIA DE PÁGINAS & CLASSIFICAÇÃO DE FONTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Link Classification */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              Classificação da Fonte do Link:
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Tipo de destino
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedLinkClassification('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedLinkClassification === 'all'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/10">
                {totalDirectLinks + totalWebFindings}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedLinkClassification('edital_direto')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedLinkClassification === 'edital_direto'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Editais Diretos</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-200/60 font-bold">
                {totalDirectLinks}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedLinkClassification('achado_web')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedLinkClassification === 'achado_web'
                  ? 'bg-amber-900 text-white border-amber-900'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Achados Web</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-200/60 font-bold">
                {totalWebFindings}
              </span>
            </button>
          </div>
        </div>

        {/* Live Page Reading Verification Filter */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Auditoria de Leitura de Página:
            </span>
            <span className="text-[10px] text-blue-800 font-mono">
              Anti-Alucinação
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedVerificationStatus('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedVerificationStatus === 'all'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Todos Validados</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVerificationStatus('only_verified')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedVerificationStatus === 'only_verified'
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-100/70'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Conteúdo Confirmado</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-200/60 font-bold">
                {totalVerifiedOnPage}
              </span>
            </button>

            {totalDisqualifiedEliminated > 0 && (
              <button
                type="button"
                onClick={() => setSelectedVerificationStatus('audit_disqualified')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
                  selectedVerificationStatus === 'audit_disqualified'
                    ? 'bg-rose-800 text-white border-rose-800'
                    : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                }`}
              >
                <span>Inconsistentes</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-rose-200 font-bold">
                  {totalDisqualifiedEliminated}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Priority Knowledge Areas Segmented Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookmarkCheck className="w-3.5 h-3.5 text-slate-600" /> Áreas Temáticas Prioritárias:
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" /> Limpar filtros aplicados
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {priorityThemes.map((t) => {
            const isSelected = selectedTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-amber-50/60 text-amber-950 border-amber-300/80 hover:bg-amber-100/70'
                }`}
              >
                ★ {t.label}
              </button>
            );
          })}

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          {secondaryThemes.map((t) => {
            const isSelected = selectedTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Multi-Criteria Selectors Grid (Country, Modality, Career Level, Sorting, Expired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Country Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> Jurisdição / País
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Modality Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" /> Modalidade
          </label>
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
          >
            {modalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Career Level Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Nível Acadêmico
          </label>
          <select
            value={selectedCareerLevel}
            onChange={(e) => setSelectedCareerLevel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
          >
            {careerLevels.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Order Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Ordenar Resultados
          </label>
          <select
            value={selectedSortBy}
            onChange={(e) => setSelectedSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
          >
            <option value="urgency">Prazo: Mais Urgente Primeiro</option>
            <option value="direct-first">Priorizar Editais Diretos Verificados</option>
            <option value="priority-themes">Prioridade: Admin, Mkt & Comunicação</option>
            <option value="deadline-desc">Prazo: Mais Distante Primeiro</option>
            <option value="title">Alfabética (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Automatic Expiration Switch & Integrity Bar */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
        <div className="flex items-center space-x-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Garantia Anti-Alucinação:</strong> Todos os editais e achados são checados contra fontes públicas primárias e diários oficiais.
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[11px] text-slate-500 font-mono">
            {includeExpired
              ? 'Modo auditoria: exibindo encerradas'
              : `${totalExpiredHidden} editais expirados eliminados`}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-slate-800"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
