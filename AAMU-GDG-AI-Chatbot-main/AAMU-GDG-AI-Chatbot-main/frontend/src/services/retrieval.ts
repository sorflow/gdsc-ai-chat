import type {
  Citation,
  KnowledgeChunk,
  KnowledgeIndex,
  SearchResult,
} from '../types/knowledge';

const LATEST_BULLETIN = '2024-2025';
const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does',
  'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'that',
  'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which', 'who', 'why',
  'with', 'would', 'you', 'your', 'according', 'bulletin', 'please',
]);

interface PreparedChunk {
  chunk: KnowledgeChunk;
  tokens: string[];
  searchableText: string;
  frequencies: Map<string, number>;
}

interface RankedChunk extends PreparedChunk {
  score: number;
  coverage: number;
  exactPhrase: boolean;
}

const stemToken = (token: string) => {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && /(sses|xes|zes|ches|shes)$/.test(token)) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
};

export const tokenize = (value: string): string[] => (
  value
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .match(/[a-z0-9]+/g) ?? []
).filter(token => token.length > 1 && !STOP_WORDS.has(token)).map(stemToken);

const unique = <T,>(items: T[]): T[] => [...new Set(items)];

const formatList = (items: string[]) => {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
};

const createNoAnswerMessage = (availableYears: string[]) => (
  `I couldn't verify that from the ${formatList(availableYears)} AAMU undergraduate bulletins. `
  + 'Try a focused question such as “What is the maximum course load in 2024-2025?” '
  + 'or “What is the attendance policy in 2023-2024?”'
);

const termCoverage = (queryTokens: string[], chunkTokens: string[]) => {
  const chunkTerms = new Set(chunkTokens);
  const matched = unique(queryTokens).filter(token => chunkTerms.has(token));
  return queryTokens.length ? matched.length / unique(queryTokens).length : 0;
};

const detectYears = (query: string, availableYears: string[]) => {
  const normalized = query.toLowerCase().replace(/[–—]/g, '-');
  const explicit = availableYears.filter(year => normalized.includes(year));
  if (explicit.length) return explicit;

  const standaloneYears = normalized.match(/\b20\d{2}\b/g) ?? [];
  for (const requested of standaloneYears) {
    const startYearMatch = availableYears.find(year => year.startsWith(`${requested}-`));
    if (startYearMatch) explicit.push(startYearMatch);
  }

  return unique(explicit);
};

const requestsComparison = (query: string) => (
  /\b(compare|comparison|changed|changes|difference|different|between|all years|over time)\b/i.test(query)
);

const sentenceCandidates = (text: string) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.replace(/\s+/g, ' ').trim())
    .filter(sentence => sentence.length >= 40);

  return sentences.length ? sentences : [text.slice(0, 360).trim()];
};

const bestSentence = (text: string, queryTokens: string[]) => {
  const ranked = sentenceCandidates(text).map(sentence => {
    const tokens = tokenize(sentence);
    const coverage = termCoverage(queryTokens, tokens);
    const density = tokens.length ? queryTokens.filter(token => tokens.includes(token)).length / tokens.length : 0;
    return { sentence, score: coverage * 10 + density };
  });

  ranked.sort((a, b) => b.score - a.score || a.sentence.length - b.sentence.length);
  return ranked[0]?.sentence ?? text.slice(0, 360).trim();
};

const createCitation = (ranked: RankedChunk, queryTokens: string[]): Citation => ({
  id: ranked.chunk.id,
  year: ranked.chunk.year,
  page: ranked.chunk.page,
  excerpt: bestSentence(ranked.chunk.text, queryTokens).slice(0, 420),
  sourceUrl: ranked.chunk.sourceUrl,
});

export const createKnowledgeRetriever = (index: KnowledgeIndex) => {
  const prepared: PreparedChunk[] = index.chunks.map(chunk => {
    const tokens = tokenize(chunk.text);
    const frequencies = new Map<string, number>();
    tokens.forEach(token => frequencies.set(token, (frequencies.get(token) ?? 0) + 1));
    return { chunk, tokens, searchableText: tokens.join(' '), frequencies };
  });
  const averageLength = prepared.reduce((sum, item) => sum + item.tokens.length, 0) / Math.max(prepared.length, 1);
  const documentFrequency = new Map<string, number>();
  prepared.forEach(item => {
    new Set(item.tokens).forEach(token => documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1));
  });
  const availableYears = index.metadata.bulletins.map(bulletin => bulletin.year);
  const noAnswerMessage = createNoAnswerMessage(availableYears);

  const rank = (queryTokens: string[], phrase: string, years: string[]) => {
    const candidates = prepared.filter(item => years.includes(item.chunk.year));
    return candidates.map(item => {
      let score = 0;
      queryTokens.forEach(token => {
        const frequency = item.frequencies.get(token) ?? 0;
        if (!frequency) return;
        const documentsWithTerm = documentFrequency.get(token) ?? 0;
        const inverseFrequency = Math.log(1 + (prepared.length - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5));
        const denominator = frequency + 1.2 * (1 - 0.75 + 0.75 * (item.tokens.length / Math.max(averageLength, 1)));
        score += inverseFrequency * ((frequency * 2.2) / denominator);
      });

      const exactPhrase = phrase.length > 2 && item.searchableText.includes(phrase);
      const coverage = termCoverage(queryTokens, item.tokens);
      score += coverage * 4 + (exactPhrase ? 6 : 0);
      return { ...item, score, coverage, exactPhrase };
    }).sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));
  };

  return (query: string): SearchResult => {
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    const queryTokens = unique(tokenize(query).filter(token => !/^20\d{2}$/.test(token)));
    const phrase = queryTokens.join(' ');
    const explicitYears = detectYears(query, availableYears);
    const comparison = requestsComparison(query) || explicitYears.length > 1;
    let searchedYears = comparison
      ? availableYears
      : explicitYears.length
        ? explicitYears
        : [LATEST_BULLETIN];
    let ranked = rank(queryTokens, phrase, searchedYears);

    if (!comparison && !explicitYears.length && (ranked[0]?.coverage ?? 0) < 0.5) {
      searchedYears = availableYears;
      ranked = rank(queryTokens, phrase, searchedYears);
    }

    const top = ranked[0];
    const coverage = top?.coverage ?? 0;
    const elapsed = Math.max(0, (globalThis.performance?.now?.() ?? Date.now()) - startedAt);
    const base = {
      latencyMs: Number(elapsed.toFixed(2)),
      diagnostics: {
        queryTokens,
        topScore: Number((top?.score ?? 0).toFixed(3)),
        termCoverage: Number(coverage.toFixed(3)),
        searchedYears,
      },
    };

    if (!queryTokens.length || !top || coverage < 0.5) {
      return {
        ...base,
        answer: noAnswerMessage,
        citations: [],
        confidence: 'none',
        bulletinYears: [],
        status: 'no-answer',
      };
    }

    const useful = ranked.filter(item => item.coverage >= 0.5 && item.score > 0).slice(0, 3);
    const citations = useful.map(item => createCitation(item, queryTokens));
    const answerSentences = unique(citations.map(citation => citation.excerpt)).slice(0, 2);
    const confidence = top.exactPhrase || coverage >= 0.75 ? 'high' : 'medium';

    return {
      ...base,
      answer: answerSentences.join(' '),
      citations,
      confidence,
      bulletinYears: unique(citations.map(citation => citation.year)),
      status: 'answered',
    };
  };
};
