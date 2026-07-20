import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reliability from './Reliability';
import { ChatProvider } from '../contexts/ChatContext';
import { loadCorpusMetadata } from '../services/bulletinSearch';

vi.mock('../services/bulletinSearch', () => ({ loadCorpusMetadata: vi.fn() }));
const mockedMetadata = vi.mocked(loadCorpusMetadata);

describe('Reliability page', () => {
  beforeEach(() => {
    mockedMetadata.mockResolvedValue({
      version: '1.0.0', generatedAt: '2026-01-01T00:00:00.000Z', bulletinCount: 3,
      pageCount: 1080, searchablePageCount: 1070, chunkCount: 5593,
      bulletins: ['2022-2023', '2023-2024', '2024-2025'].map(year => ({
        year, title: year, pageCount: 360, searchablePageCount: 356, sourceUrl: `https://example.test/${year}.pdf`,
      })),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '1.0.0', generatedAt: '2026-01-01T00:00:00.000Z', totalQuestions: 18,
        groundedQuestions: 15, groundedPassed: 14, groundedAccuracy: 14 / 15,
        unsupportedQuestions: 3, unsupportedPassed: 3, abstentionAccuracy: 1,
        medianLatencyMs: 30, p95LatencyMs: 120, targetMet: true,
      }),
    }));
  });

  it('shows corpus and measured evaluation evidence', async () => {
    render(<ChatProvider><Reliability /></ChatProvider>);
    expect(await screen.findByText('Reliability & Trust')).toBeInTheDocument();
    expect(screen.getByText('93%')).toBeInTheDocument();
    expect(screen.getByText('Targets met')).toBeInTheDocument();
    expect(screen.getByText('5,593 chunks')).toBeInTheDocument();
    expect(screen.getByText('Local processing architecture')).toBeInTheDocument();
  });
});
