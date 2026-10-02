import { Scholarship, AIScoutResult, EmailSubscription } from '../types';

export interface ScholarshipFetchParams {
  query?: string;
  country?: string;
  region?: string;
  theme?: string;
  modality?: string;
  careerLevel?: string;
  linkClassification?: string;
  verificationStatus?: string;
  sortBy?: string;
  includeExpired?: boolean;
}

export interface ScholarshipResponse {
  scholarships: Scholarship[];
  totalActive: number;
  totalDirectLinks?: number;
  totalWebFindings?: number;
  totalVerifiedOnPage?: number;
  totalDisqualifiedEliminated?: number;
  totalExpiredEliminated: number;
  lastDailySyncDate: string;
  referenceDate: string;
}

export async function fetchScholarships(params: ScholarshipFetchParams = {}): Promise<ScholarshipResponse> {
  const queryParts: string[] = [];

  if (params.query) queryParts.push(`query=${encodeURIComponent(params.query)}`);
  if (params.country && params.country !== 'all') queryParts.push(`country=${encodeURIComponent(params.country)}`);
  if (params.region && params.region !== 'all') queryParts.push(`region=${encodeURIComponent(params.region)}`);
  if (params.theme && params.theme !== 'all') queryParts.push(`theme=${encodeURIComponent(params.theme)}`);
  if (params.modality && params.modality !== 'all') queryParts.push(`modality=${encodeURIComponent(params.modality)}`);
  if (params.careerLevel && params.careerLevel !== 'all') queryParts.push(`careerLevel=${encodeURIComponent(params.careerLevel)}`);
  if (params.linkClassification && params.linkClassification !== 'all') queryParts.push(`linkClassification=${encodeURIComponent(params.linkClassification)}`);
  if (params.verificationStatus && params.verificationStatus !== 'all') queryParts.push(`verificationStatus=${encodeURIComponent(params.verificationStatus)}`);
  if (params.sortBy) queryParts.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
  if (params.includeExpired) queryParts.push('includeExpired=true');

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const res = await fetch(`/api/scholarships${queryString}`);

  if (!res.ok) {
    throw new Error('Falha ao consultar banco de bolsas.');
  }

  return res.json();
}

export async function syncDailyCrawler(): Promise<any> {
  const res = await fetch('/api/sync-daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Falha ao sincronizar crawler diário.');
  }

  return res.json();
}

export async function consultAIScout(payload: {
  name: string;
  email: string;
  targetTheme: string;
  targetModality: string;
  targetCountry: string;
  keywords: string;
  academicBackground: string;
}): Promise<AIScoutResult> {
  const res = await fetch('/api/ai-scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erro ao processar consulta com o Agente de IA.');
  }

  return res.json();
}

export async function subscribeEmailAlerts(payload: {
  email: string;
  name?: string;
  preferredThemes: string[];
  preferredModalities: string[];
  preferredCountries: string[];
  frequency: 'daily' | 'weekly';
}): Promise<{ success: boolean; message: string; subscription: EmailSubscription }> {
  const res = await fetch('/api/subscribe-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao cadastrar e-mail.');
  }

  return res.json();
}

export async function sendCuratedEmail(payload: {
  email: string;
  subject: string;
  bodyHtml: string;
  scholarshipsCount: number;
}): Promise<{ success: boolean; message: string; dispatchRecord: any }> {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erro ao despachar e-mail.');
  }

  return res.json();
}

export async function verifyScholarshipContentLive(id: string): Promise<{ id: string; verification: any }> {
  const res = await fetch('/api/scholarships/verify-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error('Erro ao verificar conteúdo da página remota.');
  }

  return res.json();
}

export async function searchWebScout(payload: {
  region?: string;
  careerLevel?: string;
  theme?: string;
  customKeywords?: string;
  portalId?: string;
  customUrl?: string;
  onlyActive?: boolean;
}): Promise<any> {
  const res = await fetch('/api/institutional-crawler/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao executar navegador institucional.');
  }

  return res.json();
}

export async function importDiscoveredOpportunities(opportunities: any[]): Promise<{
  success: boolean;
  message: string;
  totalCatalog: number;
}> {
  const res = await fetch('/api/web-scout/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunities }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao importar oportunidades para o catálogo.');
  }

  return res.json();
}

