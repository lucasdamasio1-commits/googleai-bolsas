import { useState, useEffect } from 'react';
import { Bot, Bell, RefreshCw, Info, CheckCircle2, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Scholarship } from './types';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ScholarshipCard } from './components/ScholarshipCard';
import { AIScoutPanel } from './components/AIScoutPanel';
import { WebSearchScoutPanel } from './components/WebSearchScoutPanel';
import { EmailSubscriptionPanel } from './components/EmailSubscriptionPanel';
import { SyncDailyModal } from './components/SyncDailyModal';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://xstenjzdfxniiibyyabe.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_es14OmQuIQyceFIEY3CKhQ_tZ4hSJkS';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Consulta ao Supabase
  const loadScholarships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('bolsas').select('*');
      
      if (error) {
        throw error;
      }

      let resultadosFiltrados = data || [];

      // Filtros Locais
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
          b.area?.toLowerCase() === selectedTheme.toLowerCase()
        );
      }

      if (selectedCountry !== 'all') {
        resultadosFiltrados = resultadosFiltrados.filter((b: any) => 
          b.pais?.toLowerCase() === selectedCountry.toLowerCase()
        );
      }

      if (selectedModality !== 'all') {
        resultadosFiltrados = resultadosFiltrados.filter((b: any) => 
          b.modalidade?.toLowerCase() === selectedModality.toLowerCase()
        );
      }

      let expiradasCount = 0;
      const bolsasFinais: Scholarship[] = [];

      resultadosFiltrados.forEach((b: any) => {
        const mappedScholarship = {
          ...b,
          title: b.titulo || b.title || 'Sem título',
          institution: b.instituicao || b.institution || '',
          theme: b.area || b.theme || '',
          modality: b.modalidade || b.modality || '',
          deadline: b.prazo || b.deadline || '',
        };

        const isExpired = b.status?.toLowerCase() === 'encerrada' || b.status?.toLowerCase() === 'expirada';
        
        if (isExpired) {
          expiradasCount++;
          if (includeExpired) bolsasFinais.push(mappedScholarship as Scholarship);
        } else {
          bolsasFinais.push(mappedScholarship as Scholarship);
        }
      });

      setScholarships(bolsasFinais);
      setTotalActive(bolsasFinais.length);
      setTotalDirectLinks(bolsasFinais.length); 
      setTotalWebFindings(0);
      setTotalVerifiedOnPage(bolsasFinais.length);
      setTotalDisqualifiedEliminated(0);
      setTotalExpiredEliminated(expiradasCount);
      setLastSyncDate(new Date().toISOString());

    } catch (err) {
      console.error('Erro ao carregar do Supabase:', err);
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
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={false}
        totalActive={totalActive}
        totalExpiredEliminated={totalExpiredEliminated}
        lastSyncDate={lastSyncDate}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'catalog' && (
          <div className="space-y-6">
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

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-800">
                  {scholarships.length} {scholarships.length === 1 ? 'edital listado' : 'editais listados'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {totalDirectLinks} diretos
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {totalExpiredEliminated} editais vencidos eliminados do cadastro
                </span>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-700" />
                <h4 className="font-serif text-base font-bold text-slate-800">
                  Consultando base do Supabase...
                </h4>
              </div>
            ) : scholarships.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Info className="w-8 h-8 text-amber-700 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Nenhum edital ativo corresponde aos critérios
                </h3>
              </div>
            ) : (
              <div className="space-y-3.5">
                {scholarships.map((scholarship, index) => (
                  <ScholarshipCard key={(scholarship as any).id || index} scholarship={scholarship} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-scout' && <AIScoutPanel />}
        {activeTab === 'web-search' && <WebSearchScoutPanel onImportSuccess={() => loadScholarships()} />}
        {activeTab === 'subscribe' && <EmailSubscriptionPanel />}
      </main>

      <SyncDailyModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncCompleted={() => loadScholarships()}
      />

      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-slate-900 text-sm">Cadê Bolsa</span>
            <span className="font-mono text-slate-400">· www.cadebolsa.com.br</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
