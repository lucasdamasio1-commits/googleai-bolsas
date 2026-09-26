import React, { useState } from 'react';
import {
  Bot,
  Send,
  Mail,
  CheckCircle2,
  Award,
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Eye,
  X,
  Compass,
  FileCheck2,
  AlertTriangle,
  Globe2
} from 'lucide-react';
import { AIScoutResult } from '../types';
import { consultAIScout, sendCuratedEmail } from '../lib/search';

export const AIScoutPanel: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('lucasdamasio1@gmail.com');
  const [targetTheme, setTargetTheme] = useState<string>('Administração');
  const [targetModality, setTargetModality] = useState<string>('Pós-Doutorado');
  const [targetCountry, setTargetCountry] = useState<string>('Brasil e Europa');
  const [keywords, setKeywords] = useState('Governança corporativa, inovação, marketing e sustentabilidade');
  const [academicBackground, setAcademicBackground] = useState('Doutorando / Pesquisador em Gestão e Comunicação');

  const [loading, setLoading] = useState(false);
  const [scoutResult, setScoutResult] = useState<AIScoutResult | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunScout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setEmailSentSuccess(null);

    try {
      const result = await consultAIScout({
        name,
        email,
        targetTheme,
        targetModality,
        targetCountry,
        keywords,
        academicBackground,
      });
      setScoutResult(result);
    } catch (err: any) {
      console.error('Erro na curadoria do agente:', err);
      setErrorMsg('Não foi possível concluir a análise do Agente no momento. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailNow = async () => {
    if (!scoutResult || !email) return;
    setSendingEmail(true);
    setErrorMsg(null);

    try {
      const res = await sendCuratedEmail({
        email,
        subject: `[Cadê Bolsa] ${scoutResult.emailDraft.subject}`,
        bodyHtml: scoutResult.emailDraft.bodyHtml,
        scholarshipsCount: scoutResult.recommendations.length,
      });
      setEmailSentSuccess(res.message);
    } catch (err: any) {
      setErrorMsg('Falha ao despachar e-mail. Verifique o endereço e tente novamente.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Academic Header */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-amber-300 uppercase mb-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Consultoria de Fomento & Curadoria Algorítmica</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Agente de IA Especialista em Bolsas e Financiamentos Acadêmicos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Configure seu perfil de pesquisa. O Agente do <strong>Cadê Bolsa (www.cadebolsa.com.br)</strong> analisa o acervo de editais vigentes, prioriza oportunidades nas áreas de <strong>Administração</strong>, <strong>Marketing</strong> e <strong>Comunicação</strong>, expurga prazos encerrados e gera uma curadoria com parecer de elegibilidade e envio direto para o seu e-mail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Academic Search Profile */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs h-fit">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <Bot className="w-5 h-5 text-slate-700" />
            <h3 className="font-serif font-bold text-slate-900 text-base">Parâmetros do Pesquisador</h3>
          </div>

          <form onSubmit={handleRunScout} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Completo / Titulação</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prof. Dr. Lucas Damásio"
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                E-mail para Recebimento da Curadoria
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucasdamasio1@gmail.com"
                  className="w-full pl-8.5 bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Área Prioritária</label>
                <select
                  value={targetTheme}
                  onChange={(e) => setTargetTheme(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="Administração">★ Administração</option>
                  <option value="Marketing">★ Marketing</option>
                  <option value="Comunicação">★ Comunicação</option>
                  <option value="Ciências Sociais Aplicadas">Ciências Sociais</option>
                  <option value="Tecnologia e Inovação">Tecnologia & IA</option>
                  <option value="Economia e Finanças">Economia e Finanças</option>
                  <option value="Sustentabilidade e ESG">Sustentabilidade & ESG</option>
                  <option value="Multidisciplinar">Multidisciplinar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nível / Modalidade</label>
                <select
                  value={targetModality}
                  onChange={(e) => setTargetModality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="Todas">Todas as Modalidades</option>
                  <option value="Iniciação Científica">Iniciação Científica (IC)</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                  <option value="Pós-Doutorado">Pós-Doutorado</option>
                  <option value="Projeto de Pesquisa">Projeto de Pesquisa</option>
                  <option value="Projeto de Extensão">Projeto de Extensão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jurisdição / Região de Interesse</label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
              >
                <option value="Brasil e Europa">Brasil e Europa (Recomendado)</option>
                <option value="Brasil">Apenas Brasil (FAPESP, CNPq, PROEX)</option>
                <option value="Europa">Europa (Alemanha, Portugal, França, UK)</option>
                <option value="Estados Unidos e Canadá">América do Norte (EUA / Canadá)</option>
                <option value="Global">Qualquer Jurisdição Internacional</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Linha de Pesquisa / Palavras-chave
              </label>
              <textarea
                rows={2}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: Inteligência de Mercado, Estratégia de Negócios, Gestão da Inovação, Políticas Públicas..."
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Formação e Vínculo Institucional
              </label>
              <input
                type="text"
                value={academicBackground}
                onChange={(e) => setAcademicBackground(e.target.value)}
                placeholder="Ex: Doutorando na USP, Docente em Administração..."
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>O Agente está avaliando o acervo...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  <span>Processar Curadoria Acadêmica</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Analysis Results */}
        <div className="lg:col-span-7">
          {!scoutResult && !loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-slate-800 text-lg mb-1">
                Aguardando Definição do Perfil
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed font-sans">
                Indique sua área de atuação e objetivos no formulário ao lado. O agente de IA gerará parecer detalhado das chamadas abertas e organizará o envio automático para seu e-mail.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Cadê Bolsa · www.cadebolsa.com.br
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
              <h4 className="font-serif font-bold text-slate-800 text-lg mb-1">
                Avaliando Elegibilidade e Prazos Vigentes...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Cruzando os dados de editais no Brasil e exterior com suas diretrizes temáticas em Administração, Marketing e Comunicação.
              </p>
            </div>
          )}

          {scoutResult && !loading && (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="font-serif font-bold text-slate-900 text-base">
                    Parecer do Agente Especialista
                  </h4>
                  <span className="font-mono text-xs text-slate-500">
                    {scoutResult.recommendations.length} editais selecionados
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 font-sans">
                  {scoutResult.summary}
                </p>

                {/* Email Dispatch Control Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>
                      Destinatário: <strong className="font-mono">{email}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowEmailPreview(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium rounded-md flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Prévia</span>
                    </button>

                    <button
                      onClick={handleSendEmailNow}
                      disabled={sendingEmail}
                      className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Despachando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar ao E-mail</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {emailSentSuccess && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{emailSentSuccess}</span>
                  </div>
                )}
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                  Editais Recomendados por Ordem de Aderência
                </h5>

                {scoutResult.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs hover:border-slate-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                          <span className="font-mono font-bold text-slate-800">
                            #{index + 1} Aderência: {rec.matchScore}%
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono">
                            Prioridade: {rec.urgency}
                          </span>
                          {rec.linkClassification === 'edital_direto' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                              <FileCheck2 className="w-3 h-3 text-emerald-600" /> Edital Direto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Achado Web
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 text-base leading-snug">
                          {rec.scholarshipTitle}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs mt-3 pt-2.5 border-t border-slate-100">
                      <div>
                        <span className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                          Justificativa de Aderência Acadêmica:
                        </span>
                        <p className="text-slate-600 leading-relaxed pl-4">{rec.fitReason}</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md">
                        <span className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          Recomendação Estratégica para o Edital:
                        </span>
                        <p className="text-slate-700 leading-relaxed pl-4">{rec.tipsForApplication}</p>
                      </div>

                      {/* Real Page Reading Verification Badge & Snippet */}
                      {rec.pageVerification && (
                        <div className="bg-blue-50/60 border border-blue-200/80 p-2.5 rounded-md text-[11px] text-slate-700 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                            <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Conferência de Página Oficial: Conteúdo Lido e Confirmado</span>
                          </div>
                          {rec.pageVerification.extractedSnippet && (
                            <p className="text-slate-600 font-mono text-[10.5px] leading-relaxed pl-1">
                              {rec.pageVerification.extractedSnippet}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && scoutResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Visualização da Mensagem Institucional
                </h3>
              </div>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-slate-100 p-3 rounded-md text-xs space-y-1 font-mono">
                <p><strong>Remetente:</strong> Cadê Bolsa &lt;curadoria@cadebolsa.com.br&gt;</p>
                <p><strong>Destinatário:</strong> {email}</p>
                <p><strong>Assunto:</strong> [Cadê Bolsa] {scoutResult.emailDraft.subject}</p>
              </div>

              <div
                className="prose prose-xs max-w-none text-slate-800 border p-4 rounded-lg border-slate-200 bg-white"
                dangerouslySetInnerHTML={{ __html: scoutResult.emailDraft.bodyHtml }}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowEmailPreview(false);
                  handleSendEmailNow();
                }}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-md text-xs font-bold cursor-pointer"
              >
                Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
