import React, { useState } from 'react';
import { Mail, Bell, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { subscribeEmailAlerts } from '../lib/search';

export const EmailSubscriptionPanel: React.FC = () => {
  const [email, setEmail] = useState('lucasdamasio1@gmail.com');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    'Administração',
    'Marketing',
    'Comunicação'
  ]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([
    'Mestrado',
    'Doutorado',
    'Pós-Doutorado',
    'Projeto de Pesquisa',
    'Projeto de Extensão'
  ]);
  const [selectedCountries] = useState<string[]>([
    'Brasil',
    'Alemanha',
    'Portugal',
    'Estados Unidos'
  ]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const toggleModality = (mod: string) => {
    setSelectedModalities(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await subscribeEmailAlerts({
        email,
        name,
        preferredThemes: selectedThemes,
        preferredModalities: selectedModalities,
        preferredCountries: selectedCountries,
        frequency,
      });

      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
        <div className="flex items-start space-x-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug">
              Assinatura do Boletim de Oportunidades Acadêmicas
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Serviço oficial do <strong>Cadê Bolsa (www.cadebolsa.com.br)</strong>. Receba avisos imediatos quando novos editais em Administração, Marketing e Comunicação forem indexados.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prof. Dr. Lucas Damásio"
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">E-mail para Recebimento *</label>
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
          </div>

          {/* Frequência dos Alertas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2">Periodicidade do Envio</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                  frequency === 'daily'
                    ? 'border-slate-800 bg-slate-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === 'daily'}
                  onChange={() => setFrequency('daily')}
                  className="sr-only"
                />
                <div>
                  <div className="font-bold">Boletim Diário (06:00 BRT)</div>
                  <div className="text-[11px] text-slate-500">Notificação imediata após a validação diária de novos editais</div>
                </div>
              </label>

              <label
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                  frequency === 'weekly'
                    ? 'border-slate-800 bg-slate-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === 'weekly'}
                  onChange={() => setFrequency('weekly')}
                  className="sr-only"
                />
                <div>
                  <div className="font-bold">Síntese Semanal (Segundas-feiras)</div>
                  <div className="text-[11px] text-slate-500">Compilado com editais próximos ao encerramento</div>
                </div>
              </label>
            </div>
          </div>

          {/* Temas com Destaque Sóbrio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2">
              Áreas de Conhecimento Preferenciais
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Administração',
                'Marketing',
                'Comunicação',
                'Ciências Sociais Aplicadas',
                'Tecnologia e Inovação',
                'Economia e Finanças',
                'Sustentabilidade e ESG',
                'Multidisciplinar'
              ].map(theme => {
                const isSelected = selectedThemes.includes(theme);
                const isPriority = ['Administração', 'Marketing', 'Comunicação'].includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? isPriority
                          ? 'bg-[#0F172A] text-amber-300 border-[#0F172A]'
                          : 'bg-[#0F172A] text-white border-[#0F172A]'
                        : isPriority
                        ? 'bg-amber-50/50 text-amber-950 border-amber-300 hover:bg-amber-100/50'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isPriority ? `★ ${theme}` : theme}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modalidades */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2">
              Modalidades de Financiamento
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Iniciação Científica',
                'Mestrado',
                'Doutorado',
                'Pós-Doutorado',
                'Projeto de Pesquisa',
                'Projeto de Extensão'
              ].map(mod => {
                const isSelected = selectedModalities.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModality(mod)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Cadastrando no banco de notificações...</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Registrar Assinatura no Cadê Bolsa</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 flex items-center gap-2 text-[11px] text-slate-500 font-sans">
            <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
            <span>
              Compromisso acadêmico de integridade: seu endereço de e-mail é utilizado estritamente para envio de editais acadêmicos solicitados.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
