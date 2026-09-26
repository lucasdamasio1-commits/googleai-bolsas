import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertTriangle,
  Clock,
  Landmark,
  Search,
  Copy,
  Check,
  FileText,
  X,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Globe2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Scholarship, PageVerification } from '../types';
import { formatDeadlinePtBr, isScholarshipExpired, getDaysRemaining } from '../lib/dateUtils';
import { verifyScholarshipContentLive } from '../lib/search';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  defaultExpanded?: boolean;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<PageVerification | undefined>(
    scholarship.pageVerification
  );

  const isExpired = isScholarshipExpired(scholarship.deadline);
  const daysLeft = getDaysRemaining(scholarship.deadline);
  const isPriorityTheme = ['Administração', 'Marketing', 'Comunicação'].includes(scholarship.theme);
  const isDirectEdital = scholarship.linkClassification === 'edital_direto';

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(`${scholarship.provider} - ${scholarship.title}`);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2500);
  };

  const handleLiveReverify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerifying(true);
    try {
      const res = await verifyScholarshipContentLive(scholarship.id);
      if (res && res.verification) {
        setVerification(res.verification);
      }
    } catch (err) {
      console.error('Erro na reverificação ao vivo:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `"${scholarship.provider}" "${scholarship.title}" edital pdf`
  )}`;

  return (
    <>
      <article
        className={`rounded-xl border transition-all duration-150 overflow-hidden ${
          isExpired
            ? 'bg-slate-50 border-rose-200/80 opacity-60'
            : isPriorityTheme
            ? 'bg-white border-slate-300/80 hover:border-slate-800 shadow-2xs'
            : 'bg-white border-slate-200 hover:border-slate-400 shadow-2xs'
        }`}
      >
        {/* Top Header / Accordion Click Area */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 sm:p-6 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2.5">
              {/* Classification Badges Strip */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* 1. Link Classification Badge */}
                {isDirectEdital ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300/90 shadow-2xs">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Edital Direto / Página Específica</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Achado da Internet (Página Institucional)</span>
                  </span>
                )}

                {/* 2. Live Page Verification Status Pill */}
                {verification?.status === 'verified_on_page' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    <span>Conteúdo Lido & Confirmado na Página</span>
                  </span>
                )}

                {verification?.status === 'not_found_on_page' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Conteúdo Não Confirmado</span>
                  </span>
                )}

                {/* 3. Academic Stage / Career Level */}
                {scholarship.careerLevel && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                    <span>{scholarship.careerLevel}</span>
                  </span>
                )}

                {/* 4. Priority Theme Badge */}
                {isPriorityTheme && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/70 text-amber-950 border border-amber-300/80">
                    ★ {scholarship.theme}
                  </span>
                )}
              </div>

              {/* Academic Metadata Strip */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-sans">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-slate-600" />
                  {scholarship.provider}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{scholarship.country}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-medium text-slate-700">{scholarship.modality}</span>
                {scholarship.fapespProcessNumber && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">Proc. FAPESP {scholarship.fapespProcessNumber}</span>
                  </>
                )}
              </div>

              {/* Academic Title */}
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
                {scholarship.title}
              </h3>

              {/* Key Information Strip: Deadline & Value */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs">
                {/* Deadline Indicator */}
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600">Prazo de Inscrição:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDeadlinePtBr(scholarship.deadline)}
                  </span>
                  {!isExpired && (
                    <span
                      className={`ml-1 text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        daysLeft <= 14
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {daysLeft <= 14 ? `Restam ${daysLeft} dias!` : `${daysLeft} dias restantes`}
                    </span>
                  )}
                </div>

                {/* Funding Value */}
                {scholarship.fundingValue && (
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500">Benefício/Subsídio:</span>
                    <span className="font-mono text-slate-800 font-bold tabular-nums">
                      {scholarship.fundingValue}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Accordion Indicator */}
            <div className="p-1 rounded-md text-slate-400 hover:text-slate-700 mt-1">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Expanded Institutional Details */}
        {isExpanded && (
          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-100 bg-[#FBFBFC]">
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                  Objeto e Finalidade da Concessão
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line font-sans">
                  {scholarship.description}
                </p>
              </div>

              {/* REAL-TIME LIVE PAGE READING & VERIFICATION CARD */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 font-sans">
                    <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Conferência & Leitura do Código da Página (Prevenção Anti-Alucinação)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLiveReverify}
                    disabled={isVerifying}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 text-slate-600 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Lendo código-fonte remoto...' : 'Reconferir Conteúdo da Página Agora'}</span>
                  </button>
                </div>

                {/* Verification result details */}
                {verification?.status === 'verified_on_page' && (
                  <div className="space-y-2 pt-0.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded text-[11px] border border-emerald-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Status: HTTP {verification.httpStatus || 200} OK · Oportunidade Confirmada no Código da Página
                      </span>
                      {verification.lastCheckedAt && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Auditado às {new Date(verification.lastCheckedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {verification.pageTitle && (
                      <div className="text-[11px] text-slate-600 font-sans">
                        <strong className="text-slate-700">Título no Portal Oficial:</strong> {verification.pageTitle}
                      </div>
                    )}

                    {verification.verifiedTerms && verification.verifiedTerms.length > 0 && (
                      <div className="text-[11px] text-slate-600 font-sans">
                        <strong className="text-slate-700">Identificadores confirmados na página:</strong>{' '}
                        <span className="font-mono text-emerald-700 bg-emerald-50/70 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          {verification.verifiedTerms.join(' · ')}
                        </span>
                      </div>
                    )}

                    {verification.extractedSnippet && (
                      <div className="bg-slate-50 border border-slate-200/90 rounded p-2.5 text-[11px] text-slate-700 font-mono leading-relaxed select-text">
                        <span className="text-slate-500 font-bold block mb-1">Trecho lido diretamente no HTML da instituição:</span>
                        {verification.extractedSnippet}
                      </div>
                    )}
                  </div>
                )}

                {verification?.status === 'portal_general' && (
                  <div className="space-y-1.5 pt-0.5 text-xs text-amber-900 bg-amber-50/60 border border-amber-200/80 rounded p-2.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Portal Institucional Geral Ativo (Achado da Web)</span>
                    </div>
                    {verification.pageTitle && (
                      <p className="text-[11px] text-slate-600">
                        <strong>Título da página:</strong> {verification.pageTitle}
                      </p>
                    )}
                    <p className="text-[11px] text-amber-800 leading-normal">
                      A página remota está ativa (HTTP {verification.httpStatus || 200}), porém é um portal geral do órgão e não o edital individualizado.
                    </p>
                    {verification.extractedSnippet && (
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        Snippet: {verification.extractedSnippet}
                      </p>
                    )}
                  </div>
                )}

                {verification?.status === 'not_found_on_page' && (
                  <div className="space-y-1.5 pt-0.5 text-xs text-rose-900 bg-rose-50 border border-rose-300 rounded p-3">
                    <div className="font-bold flex items-center gap-1.5 text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Alerta Anti-Alucinação: Conteúdo Não Confirmado na Página Oficial</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed font-sans">
                      {verification.error || 'O robô de leitura de código-fonte acessou o link atribuído e não encontrou no texto menção a este certame. Esta oportunidade foi sinalizada como inconsistente.'}
                    </p>
                    {verification.sourceUrl && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        URL auditada: {verification.sourceUrl}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Eligibility Requirements */}
              {scholarship.requirements && (
                <div className="bg-white border border-slate-200/90 rounded-lg p-3.5">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <FileCheck2 className="w-4 h-4 text-slate-600" />
                    Critérios de Elegibilidade e Perfil do Pesquisador
                  </h5>
                  <p className="text-xs text-slate-600 leading-normal">{scholarship.requirements}</p>
                </div>
              )}

              {/* Expired Warning if shown in Audit Mode */}
              {isExpired && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2 text-rose-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Edital com inscrições encerradas. Oportunidade visível exclusivamente para fins de auditoria histórica de dados.
                  </span>
                </div>
              )}

              {/* Footer with direct action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-mono">
                  Identificador: {scholarship.id} · Cadê Bolsa (www.cadebolsa.com.br)
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {/* Secondary: Dossier & Search Guidance Modal */}
                  <button
                    type="button"
                    onClick={() => setShowDossierModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer min-h-[40px]"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                    <span>Guia de Inscrição & Busca</span>
                  </button>

                  {/* Primary: Direct to Verified Portal or Internet Finding Page */}
                  <a
                    href={scholarship.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs min-h-[40px] ${
                      isDirectEdital
                        ? 'bg-[#0F172A] hover:bg-slate-800'
                        : 'bg-amber-900 hover:bg-amber-950'
                    }`}
                  >
                    <span>
                      {isDirectEdital
                        ? 'Acessar Página Oficial do Edital'
                        : 'Acessar Página Informativa (Achado Web)'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-200" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Dossier & Instructions Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-300 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossiê Institucional de Inscrição</span>
                </div>
                <h3 className="font-serif text-lg font-bold leading-tight">
                  {scholarship.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Órgão Emissor: {scholarship.provider} · País: {scholarship.country} · Nível: {scholarship.careerLevel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700 font-sans">
              {/* Classification Status Notice */}
              <div
                className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
                  isDirectEdital
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {isDirectEdital ? (
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {isDirectEdital
                      ? 'Status do Link: Edital Direto / Página Específica'
                      : 'Status do Link: Achado da Internet / Divulgação Institucional'}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    {isDirectEdital
                      ? (scholarship.sourceVerificationNote || 'Este link aponta diretamente para o ambiente da convocatória oficial.')
                      : (scholarship.linkDisclaimer || 'Aviso: O link direciona para o portal ou notícia da instituição, e não para o PDF integral do edital. Siga as orientações abaixo para localizá-lo.')}
                  </p>
                </div>
              </div>

              {/* Box 1: Como Localizar no Portal Oficial */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-slate-700" />
                  Como localizar este edital no portal da instituição:
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Para acessar o texto integral das diretrizes e o formulário de submissão, consulte a seção de <strong>Chamadas Abertas / Oportunidades</strong> no portal oficial de <strong>{scholarship.provider}</strong>.
                </p>

                <div className="bg-white border border-slate-300 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="font-mono text-slate-800 text-[11px] select-all break-all">
                    {scholarship.title}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTitle}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded transition-colors shrink-0"
                  >
                    {copiedTitle ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Copiar Título</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: Cronograma e Benefícios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="text-[11px] text-slate-500 font-bold uppercase mb-1">
                    Prazo Limite de Envio
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {formatDeadlinePtBr(scholarship.deadline)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {daysLeft > 0 ? `${daysLeft} dias restantes para submissão` : 'Inscrições encerradas'}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="text-[11px] text-slate-500 font-bold uppercase mb-1">
                    Benefício / Financiamento
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {scholarship.fundingValue || 'Conforme barema do edital'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Modalidade: {scholarship.modality}
                  </div>
                </div>
              </div>

              {/* Box 3: Requisitos Acadêmicos */}
              {scholarship.requirements && (
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="text-[11px] text-slate-500 font-bold uppercase mb-1">
                    Requisitos e Critérios de Avaliação
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {scholarship.requirements}
                  </p>
                </div>
              )}

              {/* Notice */}
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <strong>Protocolo de Integridade Cadê Bolsa:</strong> Cada item indexado em <a href="https://www.cadebolsa.com.br" className="underline text-slate-700">www.cadebolsa.com.br</a> passa por conferência direta de leitura de página remota para evitar alucinações e certames fictícios. Em caso de retificação no diário oficial, prevalece o edital primário emitido pela instituição.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Buscar PDF do Edital no Google</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={scholarship.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <span>Acessar Portal Oficial ({scholarship.provider})</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
