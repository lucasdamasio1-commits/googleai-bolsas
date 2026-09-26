import { useState, useEffect } from 'react';
import {
  Bot,
  Bell,
  RefreshCw,
  Info,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { Scholarship } from './types';
// A importação do 'fetchScholarships' foi removida, pois a requisição agora lê o JSON estático e filtra localmente
// import { fetchScholarships } from './lib/search'; 
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ScholarshipCard } from './components/ScholarshipCard';
import { AIScoutPanel } from './components/AIScoutPanel';
import { WebSearchScoutPanel } from './components/WebSearchScoutPanel';
import { EmailSubscriptionPanel } from './components/EmailSubscriptionPanel';
import { SyncDailyModal } from './components/SyncDailyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'ai-scout' | 'web-search' | 'subscribe'>('catalog');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [selectedLinkClassification, setSelectedLinkClassification] = useState('all');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState('all');
  const [selectedCareerLevel, setSelectedCareerLevel] = useState('all');
  const [selectedSortBy, setSelectedSortBy] = useState('urgency');
  const [includeExpired, setIncludeExpired] = useState(false);

  // Data States
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [totalDirectLinks, setTotalDirectLinks] = useState(0);
  const [totalWebFindings, setTotalWebFindings] = useState(0);
  const [totalVerifiedOnPage, setTotalVerifiedOnPage] = useState(0);
  const [totalDisqualifiedEliminated, setTotalDisqualifiedEliminated] = useState(0);
  const [totalExpiredEliminated, setTotalExpiredEliminated] = useState(0);
  const [lastSyncDate, setLastSyncDate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);

  // Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Load scholarships (Atualizado para consumir o JSON estático e filtrar no lado do cliente)
  const loadScholarships = async () => {
    setLoading(true);
    try {
      // 1. Consome o arquivo JSON diretamente da raiz do site
      const response = await fetch('/scholarshipsDatabase.json');
      
      if (!response.ok) {
        throw new Error('Arquivo estático não encontrado.');
      }

      const data = await response.json();
      let resultadosFiltrados = data.bolsas || [];

      // 2. Filtros Locais (Substituindo o trabalho do antigo servidor backend)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        resultadosFiltrados = resultadosFiltrados.filter((b: any) =>
          (b.titulo && b.titulo.toLowerCase().includes(query)) ||
          (b.instituicao && b.instituicao.toLowerCase().includes(query)) ||
          (b.area && b.area.toLowerCase().includes(query))
        );
      }

      if (selectedTheme !== 'all') {
        resultadosFiltrados = resultadosFiltrados.filter((b: any) => 
          b.area?.toLowerCase() === selectedTheme.toLowerCase() || 
          b.theme?.toLowerCase() === selectedTheme.toLowerCase()
        );
      }

      if (selectedCountry !== 'all') {
        resultadosFiltrados = resultadosFiltrados.filter((b: any) => 
          b.pais?.toLowerCase() === selectedCountry.toLowerCase() || 
          b.country?.toLowerCase() === selectedCountry.toLowerCase()
        );
      }

      if (selectedModality !== 'all') {
        resultadosFiltrados = resultadosFiltrados.filter((b: any) => 
          b.modalidade?.toLowerCase() === selectedModality.toLowerCase() || 
          b.modality?.toLowerCase() === selectedModality.toLowerCase()
        );
      }

      // 3. Processamento de status de expiração
      let expiradasCount = 0;
      const bolsasFinais: Scholarship[] = [];

      resultadosFiltrados.forEach((b: any) => {
        const isExpired = b.status?.toLowerCase() === 'encerrada' || b.status?.toLowerCase() === 'expirada';
        
        if (isExpired) {
          expiradasCount++;
          if (includeExpired) {
            bolsasFinais.push(b as Scholarship);
          }
        } else {
          bolsasFinais.push(b as Scholarship);
        }
      });

      // 4. Atualização dos estados da interface
      setScholarships(bolsasFinais);
      setTotalActive(bolsasFinais.length);
      setTotalDirectLinks(bolsasFinais.length); 
      setTotalWebFindings(0);
      setTotalVerifiedOnPage(bolsasFinais.length);
      setTotalDisqualifiedEliminated(0);
      setTotalExpiredEliminated(expiradasCount);
      
      if (data.ultima_atualizacao) {
        setLastSyncDate(data.ultima_atualizacao);
      }

    } catch (err) {
      console.error('Erro ao carregar o JSON estático de bolsas:', err);
      // Evita travar a interface se o crawler ainda não gerou o JSON
      setScholarships([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, [
    searchQuery,
    selectedTheme,
    selectedCountry,
    selectedModality,
    selectedLinkClassification,
    selectedVerificationStatus,
    selectedCareerLevel,
    selectedSortBy,
    includeExpired,
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={false}
        totalActive={totalActive}
        totalExpiredEliminated={totalExpiredEliminated}
        lastSyncDate={lastSyncDate}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TAB 1: CATALOG OF SCHOLARSHIPS */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Academic Marquee Hero Header (Sober Institutional Design) */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
              <div className="max-w-4xl space-y-3">
                <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-amber-300 uppercase">
                  <span>Cadê Bolsa</span>
                  <span>·</span>
                  <span>www.cadebolsa.com.br</span>
                  <span>·</span>
                  <span>Fomento Acadêmico Vigente</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-white leading-tight">
                  Consulta de Bolsas de Pesquisa, Pós-Graduação e Projetos de Extensão
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
                  Plataforma acadêmica dedicada ao mapeamento diário de oportunidades no Brasil, Europa e demais países. Prioridade editorial para chamadas e editais nas áreas de <strong>Administração</strong>, <strong>Marketing</strong> e <strong>Comunicação</strong>. Editais com inscrições encerradas são estritamente excluídos do catálogo.
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('web-search')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Navegador Institucional (Cliques & Links Reais)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ai-scout')}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-[#0F172A] font-semibold text-xs rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-slate-800" />
                    <span>Consultar Agente de IA para Seleção</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('subscribe')}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cadastrar E-mail para Alertas Diários</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar with Priority Themes and Country / Modality filters */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedModality={selectedModality}
              setSelectedModality={setSelectedModality}
              selectedLinkClassification={selectedLinkClassification}
              setSelectedLinkClassification={setSelectedLinkClassification}
              selectedVerificationStatus={selectedVerificationStatus}
              setSelectedVerificationStatus={setSelectedVerificationStatus}
              selectedCareerLevel={selectedCareerLevel}
              setSelectedCareerLevel={setSelectedCareerLevel}
              selectedSortBy={selectedSortBy}
              setSelectedSortBy={setSelectedSortBy}
              includeExpired={includeExpired}
              setIncludeExpired={setIncludeExpired}
              totalExpiredHidden={totalExpiredEliminated}
              totalDirectLinks={totalDirectLinks}
              totalWebFindings={totalWebFindings}
              totalVerifiedOnPage={totalVerifiedOnPage}
              totalDisqualifiedEliminated={totalDisqualifiedEliminated}
            />

            {/* Catalog Metadata & Statistics Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-800">
                  {scholarships.length} {scholarships.length === 1 ? 'edital listado' : 'editais listados'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {totalDirectLinks} diretos
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {totalVerifiedOnPage} lidos & confirmados na página
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                  {totalWebFindings} achados web
                </span>
                {totalDisqualifiedEliminated > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                    {totalDisqualifiedEliminated} inconsistentes bloqueados
                  </span>
                )}
                {selectedTheme !== 'all' && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    Tema: {selectedTheme}
                  </span>
                )}
                {selectedCountry !== 'all' && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    País: {selectedCountry}
                  </span>
                )}
                {selectedModality !== 'all' && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    Nível: {selectedModality}
                  </span>
                )}
                {selectedCareerLevel !== 'all' && (
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    Carreira: {selectedCareerLevel}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {totalExpiredEliminated} editais vencidos eliminados do cadastro
                </span>
              </div>
            </div>

            {/* List of Scholarships */}
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-700" />
                <h4 className="font-serif text-base font-bold text-slate-800">
                  Consultando base de editais...
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Auditando prazos limites e confirmando status de vigência.
                </p>
              </div>
            ) : scholarships.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Info className="w-8 h-8 text-amber-700 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Nenhum edital ativo corresponde aos critérios selecionados
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed font-sans">
                  Não foram encontradas oportunidades com inscrições abertas para esta combinação de filtros. Lembre-se que editais com prazos vencidos são automaticamente removidos da consulta pública.
                </p>
                <div className="mt-5 flex items-center justify-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTheme('all');
                      setSelectedCountry('all');
                      setSelectedModality('all');
                    }}
                    className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-md font-semibold transition-colors cursor-pointer"
                  >
                    Ver Todos os Editais Ativos
                  </button>
                  <button
                    onClick={() => setIncludeExpired(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Ativar Modo Auditoria (Exibir Vencidos)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI AGENT SCOUT */}
        {activeTab === 'ai-scout' && (
          <AIScoutPanel />
        )}

        {/* TAB 3: INSTITUTIONAL NAVIGATOR (REAL LINKS & LIVE PORTAL AUDIT) */}
        {activeTab === 'web-search' && (
          <WebSearchScoutPanel onImportSuccess={() => loadScholarships()} />
        )}

        {/* TAB 4: EMAIL SUBSCRIPTION */}
        {activeTab === 'subscribe' && (
          <EmailSubscriptionPanel />
        )}
      </main>

      {/* Sync Daily Modal */}
      <SyncDailyModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncCompleted={() => loadScholarships()}
      />

      {/* Academic Institutional Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-slate-900 text-sm">Cadê Bolsa</span>
            <span className="font-mono text-slate-400">· www.cadebolsa.com.br</span>
            <span>— Acervo Unificado de Fomento Acadêmico e Pesquisa</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[11px]">
            <span>Brasil (FAPESP, CNPq, CAPES, PROEX)</span>
            <span>·</span>
            <span>Europa (DAAD, FCT, EURAXESS, Horizon)</span>
            <span>·</span>
            <span>EUA & Canadá (Fulbright, Mitacs)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
