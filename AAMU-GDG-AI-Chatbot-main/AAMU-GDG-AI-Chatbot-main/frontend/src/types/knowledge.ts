export type AnswerConfidence = 'high' | 'medium' | 'low' | 'none';
export type AnswerStatus = 'loading' | 'answered' | 'no-answer' | 'error';

export interface BulletinMetadata {
  year: string;
  title: string;
  pageCount: number;
  searchablePageCount: number;
  sourceUrl: string;
}

export interface CorpusMetadata {
  version: string;
  generatedAt: string;
  bulletinCount: number;
  pageCount: number;
  searchablePageCount: number;
  chunkCount: number;
  bulletins: BulletinMetadata[];
}

export interface KnowledgeChunk {
  id: string;
  year: string;
  page: number;
  text: string;
  sourceUrl: string;
}

export interface KnowledgeIndex {
  metadata: CorpusMetadata;
  chunks: KnowledgeChunk[];
}

export interface Citation {
  id: string;
  year: string;
  page: number;
  excerpt: string;
  sourceUrl: string;
}

export interface SearchDiagnostics {
  queryTokens: string[];
  topScore: number;
  termCoverage: number;
  searchedYears: string[];
}

export interface SearchResult {
  answer: string;
  citations: Citation[];
  confidence: AnswerConfidence;
  latencyMs: number;
  bulletinYears: string[];
  status: Exclude<AnswerStatus, 'loading' | 'error'>;
  diagnostics: SearchDiagnostics;
}

export interface EvaluationResults {
  version: string;
  generatedAt: string;
  totalQuestions: number;
  groundedQuestions: number;
  groundedPassed: number;
  groundedAccuracy: number;
  unsupportedQuestions: number;
  unsupportedPassed: number;
  abstentionAccuracy: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  targetMet: boolean;
}
