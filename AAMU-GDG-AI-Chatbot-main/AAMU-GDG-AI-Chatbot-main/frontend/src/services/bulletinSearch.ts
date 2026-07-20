import { createKnowledgeRetriever } from './retrieval';
import type { CorpusMetadata, KnowledgeIndex, SearchResult } from '../types/knowledge';

type Retriever = ReturnType<typeof createKnowledgeRetriever>;

let indexPromise: Promise<KnowledgeIndex> | null = null;
let retrieverPromise: Promise<Retriever> | null = null;

const indexUrl = `${import.meta.env.BASE_URL}data/bulletin-index.json`;

export const loadKnowledgeIndex = async (): Promise<KnowledgeIndex> => {
  if (!indexPromise) {
    indexPromise = fetch(indexUrl).then(async response => {
      if (!response.ok) throw new Error(`Knowledge index failed to load (${response.status}).`);
      return response.json() as Promise<KnowledgeIndex>;
    }).catch(error => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
};

const loadRetriever = async () => {
  if (!retrieverPromise) {
    retrieverPromise = loadKnowledgeIndex().then(createKnowledgeRetriever).catch(error => {
      retrieverPromise = null;
      throw error;
    });
  }
  return retrieverPromise;
};

export const searchBulletins = async (query: string): Promise<SearchResult> => {
  const retriever = await loadRetriever();
  return retriever(query);
};

export const loadCorpusMetadata = async (): Promise<CorpusMetadata> => (
  (await loadKnowledgeIndex()).metadata
);
