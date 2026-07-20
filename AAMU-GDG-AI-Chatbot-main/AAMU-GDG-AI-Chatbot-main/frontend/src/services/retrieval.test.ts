import { describe, expect, it } from 'vitest';
import { createKnowledgeRetriever, tokenize } from './retrieval';
import type { KnowledgeIndex } from '../types/knowledge';

const source = (year: string, page: number) => `https://example.test/${year}.pdf#page=${page}`;
const index: KnowledgeIndex = {
  metadata: {
    version: 'test', generatedAt: '2026-01-01T00:00:00.000Z', bulletinCount: 3,
    pageCount: 3, searchablePageCount: 3, chunkCount: 3,
    bulletins: ['2022-2023', '2023-2024', '2024-2025'].map(year => ({
      year, title: year, pageCount: 1, searchablePageCount: 1, sourceUrl: source(year, 1),
    })),
  },
  chunks: [
    { id: 'old', year: '2022-2023', page: 10, text: 'AAMU Bulletin 2022-2023 class attendance policy allowed two unexcused absences per course.', sourceUrl: source('2022-2023', 10) },
    { id: 'middle', year: '2023-2024', page: 20, text: 'Transfer credit is evaluated by the registrar after admission.', sourceUrl: source('2023-2024', 20) },
    { id: 'latest', year: '2024-2025', page: 30, text: 'Maximum course load is 19 credit hours per regular semester.', sourceUrl: source('2024-2025', 30) },
  ],
};

describe('local bulletin retrieval', () => {
  it('normalizes tokens and removes conversational stop words', () => {
    expect(tokenize('What is the MAXIMUM course load?')).toEqual(['maximum', 'course', 'load']);
  });

  it('defaults to the latest bulletin and returns traceable citations', () => {
    const result = createKnowledgeRetriever(index)('What is the maximum course load?');
    expect(result.status).toBe('answered');
    expect(result.confidence).toBe('high');
    expect(result.citations[0]).toMatchObject({ year: '2024-2025', page: 30 });
    expect(result.citations[0].sourceUrl).toContain('#page=30');
  });

  it('honors an explicitly requested academic year', () => {
    const result = createKnowledgeRetriever(index)('What was the attendance policy in 2022-2023?');
    expect(result.citations[0]?.year).toBe('2022-2023');
    expect(result.diagnostics.searchedYears).toEqual(['2022-2023']);
  });

  it('searches all years for comparisons', () => {
    const result = createKnowledgeRetriever(index)('Compare course policy changes over time');
    expect(result.diagnostics.searchedYears).toEqual(['2022-2023', '2023-2024', '2024-2025']);
  });

  it('abstains when fewer than half of meaningful terms are supported', () => {
    const result = createKnowledgeRetriever(index)('quantum submarine maintenance schedule');
    expect(result.status).toBe('no-answer');
    expect(result.confidence).toBe('none');
    expect(result.citations).toEqual([]);
    expect(result.answer).toContain('2022-2023, 2023-2024, and 2024-2025');
    expect(result.answer).toContain('What is the maximum course load in 2024-2025?');
  });
});
