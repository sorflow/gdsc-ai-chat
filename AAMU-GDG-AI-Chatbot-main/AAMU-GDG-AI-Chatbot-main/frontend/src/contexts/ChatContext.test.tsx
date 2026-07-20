import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatProvider, useChat } from './ChatContext';
import { searchBulletins } from '../services/bulletinSearch';

vi.mock('../services/bulletinSearch', () => ({ searchBulletins: vi.fn() }));
const mockedSearch = vi.mocked(searchBulletins);

const Harness = () => {
  const { messages, sendMessage, clearMessages, isResponding } = useChat();
  const [query, setQuery] = useState('');
  return (
    <div>
      <input aria-label="query" value={query} onChange={event => setQuery(event.target.value)} />
      <button onClick={() => void sendMessage(query)}>send</button>
      <button onClick={clearMessages}>clear</button>
      <span>{isResponding ? 'responding' : 'idle'}</span>
      {messages.map(message => <p key={message.id}>{message.text}</p>)}
    </div>
  );
};

describe('ChatProvider', () => {
  beforeEach(() => mockedSearch.mockReset());

  it('renders a grounded answer returned by local retrieval', async () => {
    mockedSearch.mockResolvedValue({
      answer: 'Maximum course load is 19 credit hours.',
      citations: [{ id: 'source', year: '2024-2025', page: 35, excerpt: '19 credit hours', sourceUrl: 'https://example.test#page=35' }],
      confidence: 'high', latencyMs: 4, bulletinYears: ['2024-2025'], status: 'answered',
      diagnostics: { queryTokens: ['maximum', 'load'], topScore: 10, termCoverage: 1, searchedYears: ['2024-2025'] },
    });
    render(<ChatProvider><Harness /></ChatProvider>);
    fireEvent.change(screen.getByLabelText('query'), { target: { value: 'maximum course load' } });
    fireEvent.click(screen.getByText('send'));
    expect(screen.getByText('responding')).toBeInTheDocument();
    expect(await screen.findByText('Maximum course load is 19 credit hours.')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('handles deterministic help without loading the index', async () => {
    render(<ChatProvider><Harness /></ChatProvider>);
    fireEvent.change(screen.getByLabelText('query'), { target: { value: 'help' } });
    fireEvent.click(screen.getByText('send'));
    expect(await screen.findByText(/search three AAMU undergraduate bulletins/i)).toBeInTheDocument();
    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it('ignores an in-flight response after chat is cleared', async () => {
    let resolveSearch!: (value: Awaited<ReturnType<typeof searchBulletins>>) => void;
    mockedSearch.mockReturnValue(new Promise(resolve => { resolveSearch = resolve; }));
    render(<ChatProvider><Harness /></ChatProvider>);
    fireEvent.change(screen.getByLabelText('query'), { target: { value: 'course policy' } });
    fireEvent.click(screen.getByText('send'));
    fireEvent.click(screen.getByText('clear'));
    resolveSearch({
      answer: 'late answer', citations: [], confidence: 'none', latencyMs: 1, bulletinYears: [], status: 'no-answer',
      diagnostics: { queryTokens: [], topScore: 0, termCoverage: 0, searchedYears: [] },
    });
    await waitFor(() => expect(screen.queryByText('late answer')).not.toBeInTheDocument());
  });
});
