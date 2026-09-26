import { WebScoutResult } from '../types';
import {
  isShallowOrGenericUrl,
  runInstitutionalCrawler,
  generateInstitutionalMarkdownReport,
} from './institutionalCrawler';

export { isShallowOrGenericUrl, generateInstitutionalMarkdownReport };

export interface QueryGenerationParams {
  region: 'Brasil' | 'Europa' | 'EUA' | 'Mundo' | 'Todas';
  careerLevel: 'Iniciação Científica' | 'Mestrado' | 'Doutorado' | 'Pós-Doutorado' | 'Treinamento Técnico' | 'Projetos de Pesquisa' | 'Extensão' | 'Todas';
  theme: 'Administração' | 'Marketing' | 'Comunicação' | 'Todas';
  customKeywords?: string;
}

export function buildDirectedQueries(params: QueryGenerationParams): {
  targetedQueries: Array<{ domain: string; region: string; query: string }>;
  openQueries: string[];
} {
  const domainDirectory: Record<string, Array<{ domain: string; name: string; prefix: string }>> = {
    Brasil: [
      { domain: 'fapesp.br/oportunidades', name: 'FAPESP Oportunidades', prefix: 'https://fapesp.br/oportunidades/' },
      { domain: 'gov.br/cnpq', name: 'CNPq Chamadas', prefix: 'https://www.gov.br/cnpq' },
      { domain: 'gov.br/capes', name: 'CAPES Editais', prefix: 'https://www.gov.br/capes' },
      { domain: 'fulbright.org.br', name: 'Comissão Fulbright Brasil', prefix: 'https://fulbright.org.br/bolsas-para-brasileiros/' },
    ],
    Europa: [
      { domain: 'daad.de', name: 'DAAD Alemanha', prefix: 'https://www.daad.de' },
      { domain: 'fct.pt', name: 'FCT Portugal (Concursos Abertos)', prefix: 'https://www.fct.pt/concursos?tab=open' },
      { domain: 'chevening.org', name: 'Chevening Scholarships UK', prefix: 'https://www.chevening.org/scholarships/' },
      { domain: 'fundacioncarolina.es', name: 'Fundación Carolina Espanha', prefix: 'https://www.fundacioncarolina.es' },
      { domain: 'humboldt-foundation.de', name: 'Alexander von Humboldt Stiftung', prefix: 'https://www.humboldt-foundation.de' },
    ],
    EUA: [
      { domain: 'fulbright.org.br', name: 'Comissão Fulbright Brasil', prefix: 'https://fulbright.org.br/bolsas-para-brasileiros/' },
      { domain: 'fulbrightprogram.org', name: 'Fulbright Program USA', prefix: 'https://fulbrightprogram.org' },
    ],
    Mundo: [
      { domain: 'euraxess.ec.europa.eu', name: 'EURAXESS Global', prefix: 'https://euraxess.ec.europa.eu' },
    ],
  };

  const selectedRegions = params.region === 'Todas' ? ['Brasil', 'Europa', 'EUA', 'Mundo'] : [params.region];
  const targetedQueries: Array<{ domain: string; region: string; query: string }> = [];
  const openQueries: string[] = [];

  for (const reg of selectedRegions) {
    const list = domainDirectory[reg] || [];
    for (const d of list) {
      targetedQueries.push({
        domain: d.name,
        region: reg,
        query: `${d.name} (${d.prefix}) -> Navegação com auditoria de link clicável`,
      });
    }
  }

  openQueries.push('Auditoria direta em portais governamentais com clique obrigatório em botão/link.');

  return { targetedQueries, openQueries };
}

// Execução do navegador institucional sem alucinação e com clique obrigatório
export async function runWebScoutAgent(
  params: QueryGenerationParams,
  _apiKey?: string
): Promise<WebScoutResult> {
  return runInstitutionalCrawler({
    region: params.region,
    careerLevel: params.careerLevel,
    theme: params.theme,
    customKeywords: params.customKeywords,
    onlyActive: true,
  });
}
