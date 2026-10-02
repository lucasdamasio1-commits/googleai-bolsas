// =========================================================================
// MOTOR DE REFINAMENTO DE LINKS & DEEP LINK TRAVERSAL (ANTI-INTERMEDIÁRIOS)
// Elimina "um clique a mais" transformando páginas de índice/catálogo
// nas URLs finais diretas do certame, programa ou PDF oficial
// =========================================================================

export interface RefinedLinkResult {
  refinedUrl: string;
  originalUrl: string;
  isRefined: boolean;
  editalPdfUrl?: string;
  destinationActionLinks?: Array<{ text: string; url: string }>;
  explanation?: string;
}

// Mapeamento de hubs/catálogos conhecidos para links diretos de 1 clique
const KNOWN_HUB_MAPPINGS: Array<{
  pattern: RegExp;
  refiner: (url: string, context?: { title?: string; provider?: string }) => RefinedLinkResult | null;
}> = [
  // 1. ALEXANDER VON HUMBOLDT STIFTUNG (Alemanha)
  // De: /en/apply/sponsorship-programmes (hub/catálogo de programas)
  // Para: /en/apply/sponsorship-programmes/humboldt-research-fellowship (edital direto)
  // Ou: /en/apply/sponsorship-programmes/capes-humboldt-research-fellowship (parceria Brasil)
  {
    pattern: /humboldt-foundation\.de\/en\/apply\/sponsorship-programmes(?:\/?$|\?(?!.*fellowship))/i,
    refiner: (url, context) => {
      const titleLower = (context?.title || '').toLowerCase();
      const isCapesOrBrazil = titleLower.includes('capes') || titleLower.includes('brasil') || titleLower.includes('brazil');

      if (isCapesOrBrazil) {
        return {
          originalUrl: url,
          refinedUrl: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/capes-humboldt-research-fellowship',
          isRefined: true,
          editalPdfUrl: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf',
          destinationActionLinks: [
            { text: 'Acessar Página Oficial do Edital (CAPES-Humboldt)', url: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/capes-humboldt-research-fellowship' },
            { text: 'Baixar Diretrizes Oficiais do Programa (PDF)', url: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf' },
            { text: 'Ver Programa Geral Humboldt Research Fellowship', url: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship' },
          ],
          explanation: 'Link refinado de catálogo intermediário para a página oficial direta da chamada CAPES-Humboldt Fellowship.',
        };
      }

      return {
        originalUrl: url,
        refinedUrl: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship',
        isRefined: true,
        editalPdfUrl: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf',
        destinationActionLinks: [
          { text: 'Acessar Página Oficial do Edital (Humboldt Research Fellowship)', url: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship' },
          { text: 'Baixar Diretrizes do Programa de Bolsas (PDF)', url: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf' },
          { text: 'Ver Chamada Bilateral CAPES-Humboldt (Brasil)', url: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/capes-humboldt-research-fellowship' },
        ],
        explanation: 'Link refinado com sucesso: navegação direta de 1 clique para a página da Convocatória Humboldt Research Fellowship (evitando a listagem geral).',
      };
    },
  },

  // 2. CHEVENING SCHOLARSHIPS (Reino Unido)
  // De: /scholarships/ ou /scholarships/who-can-apply/
  // Para: /scholarship/brazil/ (página específica de candidatura para pesquisadores e estudantes do Brasil)
  {
    pattern: /chevening\.org\/scholarships\/(?:who-can-apply\/?|\/?$)/i,
    refiner: (url, context) => {
      const titleLower = (context?.title || '').toLowerCase();
      const isBrazilContext = titleLower.includes('brasil') || titleLower.includes('brazil') || (context?.provider || '').includes('Brasil');

      const targetUrl = isBrazilContext || true
        ? 'https://www.chevening.org/scholarship/brazil/'
        : 'https://www.chevening.org/scholarships/application-guidance/';

      return {
        originalUrl: url,
        refinedUrl: targetUrl,
        isRefined: true,
        destinationActionLinks: [
          { text: 'Acessar Edital Oficial Chevening Brasil', url: 'https://www.chevening.org/scholarship/brazil/' },
          { text: 'Guia de Elegibilidade e Critérios (UK FCDO)', url: 'https://www.chevening.org/scholarships/who-can-apply/' },
          { text: 'Orientações Gerais de Inscrição', url: 'https://www.chevening.org/scholarships/application-guidance/' },
        ],
        explanation: 'Link refinado para a página nacional Chevening Brasil com botão de inscrição direto e calendário da comissão local.',
      };
    },
  },

  // 3. CAMPUS FRANCE / BOURSE EIFFEL (França)
  // De: /bursaries-foreign-students ou página genérica
  // Para: /en/france-excellence-eiffel-scholarship-program
  {
    pattern: /campusfrance\.org\/(?:[a-z]{2}\/)?(?:bursaries-foreign-students|bourses-etudiants-etrangers)\/?$/i,
    refiner: (url) => {
      return {
        originalUrl: url,
        refinedUrl: 'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program',
        isRefined: true,
        editalPdfUrl: 'https://www.campusfrance.org/system/files/medias/documents/2024-10/VADEMECUM_EIFFEL_2025_EN.pdf',
        destinationActionLinks: [
          { text: 'Acessar Página Oficial Eiffel (Campus France)', url: 'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program' },
          { text: 'Baixar Vade-Mécum e Diretrizes Oficiais (PDF)', url: 'https://www.campusfrance.org/system/files/medias/documents/2024-10/VADEMECUM_EIFFEL_2025_EN.pdf' },
        ],
        explanation: 'Link refinado do diretório de bolsas para o edital oficial em inglês da chamada France Excellence Eiffel.',
      };
    },
  },

  // 4. FUNDACIÓN CAROLINA (Espanha)
  // De: home ou convocatória geral
  // Para: portal direto de programas e inscrições da Fundação Carolina
  {
    pattern: /fundacioncarolina\.es\/(?:convocatoria-de-becas-2026-2027\/?|\/?$)/i,
    refiner: (url) => {
      return {
        originalUrl: url,
        refinedUrl: 'https://gestion.fundacioncarolina.es/programas',
        isRefined: true,
        destinationActionLinks: [
          { text: 'Acessar Portal de Candidaturas (Fundación Carolina)', url: 'https://gestion.fundacioncarolina.es/programas' },
          { text: 'Consultar Texto da Convocatória Oficial', url: 'https://www.fundacioncarolina.es/convocatoria-de-becas-2026-2027/' },
        ],
        explanation: 'Link refinado da página institucional para o ambiente direto de inscrição e seleção de pós-graduação.',
      };
    },
  },

  // 5. FULBRIGHT BRASIL
  // De: /bolsas-para-brasileiros/ (índice genérico)
  // Para: programa individual se o título indicar a vaga
  {
    pattern: /fulbright\.org\.br\/bolsas-para-brasileiros\/?$/i,
    refiner: (url, context) => {
      const t = (context?.title || '').toLowerCase();
      let target = 'https://fulbright.org.br/bolsas-para-brasileiros/catedra-dra-ruth-cardoso-georgetown/';
      let pdf: string | undefined = 'https://fulbright.org.br/wp-content/uploads/2024/09/Edital-Ruth-Cardoso-Georgetown-2025-2026.pdf';

      if (t.includes('ruth cardoso') || t.includes('georgetown')) {
        target = 'https://fulbright.org.br/bolsas-para-brasileiros/catedra-dra-ruth-cardoso-georgetown/';
        pdf = 'https://fulbright.org.br/wp-content/uploads/2024/09/Edital-Ruth-Cardoso-Georgetown-2025-2026.pdf';
      } else if (t.includes('junior faculty') || t.includes('jfdp')) {
        target = 'https://fulbright.org.br/bolsas-para-brasileiros/junior-faculty-member/';
      } else if (t.includes('doutorado') || t.includes('sanduiche')) {
        target = 'https://fulbright.org.br/bolsas-para-brasileiros/doutorado-sanduiche-nos-eua/';
      }

      return {
        originalUrl: url,
        refinedUrl: target,
        isRefined: true,
        editalPdfUrl: pdf,
        destinationActionLinks: [
          { text: 'Acessar Edital Oficial do Programa', url: target },
          ...(pdf ? [{ text: 'Baixar Edital em PDF (Oficial)', url: pdf }] : []),
        ],
        explanation: 'Link refinado do catálogo da Fulbright diretamente para o programa específico selecionado.',
      };
    },
  },
];

/**
 * Refina um link de oportunidade de forma síncrona/determinística.
 * Se o link for um catálogo intermediário conhecido, retorna o endereço direto do programa.
 */
export function refineOpportunityUrl(
  url: string,
  context?: { title?: string; provider?: string }
): RefinedLinkResult {
  if (!url || typeof url !== 'string') {
    return { originalUrl: '', refinedUrl: '', isRefined: false };
  }

  const trimmed = url.trim();

  for (const mapping of KNOWN_HUB_MAPPINGS) {
    if (mapping.pattern.test(trimmed)) {
      const res = mapping.refiner(trimmed, context);
      if (res) return res;
    }
  }

  // Se já for um link específico (ex: /humboldt-research-fellowship)
  if (trimmed.includes('humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship')) {
    return {
      originalUrl: trimmed,
      refinedUrl: trimmed,
      isRefined: true,
      editalPdfUrl: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf',
      destinationActionLinks: [
        { text: 'Acessar Página Oficial do Edital (Humboldt)', url: trimmed },
        { text: 'Baixar Diretrizes Oficiais do Programa (PDF)', url: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf' },
        { text: 'Ver Programa CAPES-Humboldt (Brasil)', url: 'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/capes-humboldt-research-fellowship' },
      ],
      explanation: 'Link já aponta diretamente para o ambiente da convocatória sem intermediários.',
    };
  }

  if (trimmed.includes('humboldt-foundation.de/en/apply/sponsorship-programmes/capes-humboldt-research-fellowship')) {
    return {
      originalUrl: trimmed,
      refinedUrl: trimmed,
      isRefined: true,
      editalPdfUrl: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf',
      destinationActionLinks: [
        { text: 'Acessar Página Oficial do Edital (CAPES-Humboldt)', url: trimmed },
        { text: 'Baixar Diretrizes do Programa (PDF)', url: 'https://www.humboldt-foundation.de/fileadmin/Bewerben/Programme/Humboldt-Forschungsstipendium/humboldt-fellowship_programme_information.pdf' },
      ],
      explanation: 'Link direto da chamada bilateral CAPES-Humboldt validado.',
    };
  }

  return {
    originalUrl: trimmed,
    refinedUrl: trimmed,
    isRefined: false,
  };
}

/**
 * Refinamento dinâmico assíncrono:
 * Se o link recebido for uma página intermediária HTML (ex: /sponsorship-programmes),
 * busca o HTML ao vivo, localiza o link do card ou título e realiza "um clique a mais"
 * de forma autônoma, validando o status HTTP 200 do destino final.
 */
export async function resolveDeepOpportunityLinkOnLiveWeb(
  url: string,
  title?: string
): Promise<RefinedLinkResult> {
  // 1. Testa refinamento estático primeiro
  const staticResult = refineOpportunityUrl(url, { title });
  if (staticResult.isRefined && staticResult.refinedUrl !== url) {
    return staticResult;
  }

  // 2. Se for link comum, checa se é um hub em potencial
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();

    // Se o caminho aparenta ser uma listagem
    const isHubCandidate =
      path.endsWith('/programmes') ||
      path.endsWith('/sponsorship-programmes') ||
      path.endsWith('/programas') ||
      path.endsWith('/editais') ||
      path.endsWith('/calls') ||
      path.endsWith('/scholarships');

    if (!isHubCandidate) {
      return staticResult;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CadeBolsaBot/2.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) return staticResult;

    const html = await res.text();
    const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
      href: m[1],
      text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    }));

    // Se o usuário passou um título, busca o link com maior similaridade
    if (title && title.length > 5) {
      const titleWords = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(' ')
        .filter((w) => w.length >= 4);

      let bestMatch: { href: string; score: number } | null = null;

      for (const l of links) {
        if (l.href.startsWith('#') || l.href.startsWith('javascript:')) continue;
        const textLow = l.text.toLowerCase();
        const hrefLow = l.href.toLowerCase();

        let score = 0;
        for (const w of titleWords) {
          if (textLow.includes(w)) score += 2;
          if (hrefLow.includes(w)) score += 1;
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { href: l.href, score };
        }
      }

      if (bestMatch && bestMatch.score >= 3) {
        const resolved = new URL(bestMatch.href, url).toString();
        // Testa se o link resolvido responde com HTTP 200
        const checkRes = await fetch(resolved, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (checkRes.ok || checkRes.status === 405) {
          return {
            originalUrl: url,
            refinedUrl: resolved,
            isRefined: true,
            explanation: `Link intermediário refinado automaticamente através do título para o destino final "${resolved}".`,
          };
        }
      }
    }
  } catch {
    // fallback
  }

  return staticResult;
}
