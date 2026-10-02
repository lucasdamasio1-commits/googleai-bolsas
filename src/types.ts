export type Modality =
  | 'Iniciação Científica'
  | 'Mestrado'
  | 'Doutorado'
  | 'Pós-Doutorado'
  | 'Treinamento Técnico / TT'
  | 'Jornalismo Científico / JC'
  | 'Projeto de Pesquisa'
  | 'Projeto de Extensão';

export type MainTheme =
  | 'Administração'
  | 'Marketing'
  | 'Comunicação'
  | 'Ciências Sociais Aplicadas'
  | 'Tecnologia e Inovação'
  | 'Economia e Finanças'
  | 'Sustentabilidade e ESG'
  | 'Ciências da Saúde'
  | 'Ciências Exatas e da Terra'
  | 'Multidisciplinar';

export type Region = 'Brasil' | 'Europa' | 'América do Norte' | 'Global / Outros';

export type LinkClassification = 'edital_direto' | 'achado_web';

export type PageVerificationStatus =
  | 'verified_on_page'
  | 'portal_general'
  | 'not_found_on_page'
  | 'unverified';

export interface PageVerification {
  status: PageVerificationStatus;
  httpStatus?: number;
  pageTitle?: string;
  verifiedTerms?: string[];
  extractedSnippet?: string;
  lastCheckedAt: string; // ISO date
  sourceUrl: string;
  error?: string;
}

export type CareerLevel =
  | 'Graduação'
  | 'Mestrado'
  | 'Doutorado'
  | 'Pós-Doutorado'
  | 'Treinamento Técnico'
  | 'Pesquisador / Docente'
  | 'Todos os Níveis';

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  link: string;
  provider: string; // FAPESP, DAAD, Fulbright, FCT, EURAXESS, CNPq, CAPES, etc.
  country: string; // Brasil, Alemanha, Estados Unidos, Reino Unido, Portugal, etc.
  region: Region;
  modality: Modality;
  theme: MainTheme;
  fundingValue?: string;
  requirements?: string;
  publishedDate: string;
  verifiedToday?: boolean;
  linkClassification: LinkClassification; // 'edital_direto' | 'achado_web'
  careerLevel: CareerLevel;
  linkDisclaimer?: string;
  sourceVerificationNote?: string;
  expectedPageTerms?: string[]; // Terms that must be present in the live page text
  fapespProcessNumber?: string;
  pageVerification?: PageVerification;
  editalPdfUrl?: string;
  destinationActionLinks?: Array<{ text: string; url: string }>;
  linkRefined?: boolean;
}

export interface AIScoutRecommendation {
  scholarshipId: string;
  scholarshipTitle: string;
  matchScore: number; // 0 to 100
  fitReason: string;
  tipsForApplication: string;
  urgency: 'Alta' | 'Média' | 'Normal';
  linkClassification?: LinkClassification;
  pageVerification?: PageVerification;
}

export interface AIScoutResult {
  summary: string;
  recommendations: AIScoutRecommendation[];
  emailDraft: {
    subject: string;
    bodyHtml: string;
  };
}

export interface EmailSubscription {
  id: string;
  email: string;
  name?: string;
  preferredThemes: string[];
  preferredModalities: string[];
  preferredCountries: string[];
  frequency: 'daily' | 'weekly';
  createdAt: string;
  lastSent?: string;
}

export interface WebSearchTargetedQuery {
  domain: string;
  region: string;
  query: string;
}

export interface NavigationStep {
  portal: string;
  clickedButton: string;
  destinationUrl: string;
  httpStatus: number;
  isActive: boolean;
  reason?: string;
}

export interface DiscoveredOpportunity {
  id: string;
  title: string;
  provider: string;
  country: string;
  region: Region;
  modality: Modality;
  theme: MainTheme;
  careerLevel: CareerLevel;
  deadline?: string;
  specificLink: string;
  finalUrl: string;
  portalOrigin: string;
  clickedButtonText: string;
  hasClickableButton: boolean;
  isActive: boolean;
  statusLabel: string;
  institution?: string;
  applicationEmail?: string;
  editalPdfUrl?: string;
  editalProcessUrl?: string;
  stepTrail?: Array<{ stepNumber: number; title: string; url: string; action: string }>;
  fundingValue?: string;
  destinationActionLinks?: Array<{ text: string; url: string }>;
  searchDate: string;
  extractedSnippet: string;
  evidenceQuote: string;
  isSpecificLink: boolean;
  httpStatus?: number;
}

export interface WebScoutResult {
  markdownReport: string;
  discoveredOpportunities: DiscoveredOpportunity[];
  queriesExecuted: string[];
  genericLinksBlocked: number;
  totalCandidatesScanned?: number;
  discardedNoClickableLink?: number;
  discardedExpiredOrInactive?: number;
  portalsNavigated?: string[];
  navigationSteps?: NavigationStep[];
  searchDate: string;
  engineUsed: string;
}
