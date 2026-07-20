import React, { createContext, useContext, useRef, useState } from 'react';
import { searchBulletins } from '../services/bulletinSearch';
import type { AnswerConfidence, AnswerStatus, Citation, SearchResult } from '../types/knowledge';

type MessageType = 'bot' | 'user';
type KnowledgeStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  citations?: Citation[];
  confidence?: AnswerConfidence;
  latencyMs?: number;
  bulletinYears?: string[];
  status?: AnswerStatus;
}

export interface SessionMetrics {
  queryCount: number;
  groundedAnswerCount: number;
  noAnswerCount: number;
  errorCount: number;
  totalLatencyMs: number;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  isOpen: boolean;
  isResponding: boolean;
  knowledgeStatus: KnowledgeStatus;
  sessionMetrics: SessionMetrics;
  toggleChat: () => void;
  openChat: () => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  type: 'bot',
  text: 'Hi! I search the 2022–2025 AAMU undergraduate bulletins locally and cite every academic answer. What would you like to know?',
  timestamp: new Date(),
  confidence: 'none',
  status: 'answered',
};

const initialMetrics: SessionMetrics = {
  queryCount: 0,
  groundedAnswerCount: 0,
  noAnswerCount: 0,
  errorCount: 0,
  totalLatencyMs: 0,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const deterministicReply = (text: string): SearchResult | null => {
  const normalized = text.trim().toLowerCase();
  if (/^(hi|hello|hey|good (morning|afternoon|evening))[!. ]*$/.test(normalized)) {
    return {
      answer: 'Hello! Ask me about an AAMU course, academic policy, prerequisite, or a specific 2022–2025 bulletin year.',
      citations: [], confidence: 'none', latencyMs: 0, bulletinYears: [], status: 'answered',
      diagnostics: { queryTokens: [], topScore: 0, termCoverage: 0, searchedYears: [] },
    };
  }
  if (/^(help|what can you do)[?!. ]*$/.test(normalized)) {
    return {
      answer: 'I can search three AAMU undergraduate bulletins, compare years, cite exact pages, and tell you when the sources do not support an answer.',
      citations: [], confidence: 'none', latencyMs: 0, bulletinYears: [], status: 'answered',
      diagnostics: { queryTokens: [], topScore: 0, termCoverage: 0, searchedYears: [] },
    };
  }
  if (/^(thanks|thank you|thank you very much)[!. ]*$/.test(normalized)) {
    return {
      answer: "You're welcome. Ask another bulletin question whenever you're ready.",
      citations: [], confidence: 'none', latencyMs: 0, bulletinYears: [], status: 'answered',
      diagnostics: { queryTokens: [], topScore: 0, termCoverage: 0, searchedYears: [] },
    };
  }
  return null;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus>('idle');
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>(initialMetrics);
  const requestGeneration = useRef(0);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isResponding) return;

    const generation = requestGeneration.current;
    setMessages(previous => [...previous, {
      id: newId(), type: 'user', text: trimmed, timestamp: new Date(), status: 'answered',
    }]);
    setIsResponding(true);

    try {
      const localReply = deterministicReply(trimmed);
      if (!localReply && knowledgeStatus === 'idle') setKnowledgeStatus('loading');
      const result = localReply ?? await searchBulletins(trimmed);
      if (generation !== requestGeneration.current) return;
      if (!localReply) setKnowledgeStatus('ready');

      setMessages(previous => [...previous, {
        id: newId(),
        type: 'bot',
        text: result.answer,
        timestamp: new Date(),
        citations: result.citations,
        confidence: result.confidence,
        latencyMs: result.latencyMs,
        bulletinYears: result.bulletinYears,
        status: result.status,
      }]);
      setSessionMetrics(previous => ({
        ...previous,
        queryCount: previous.queryCount + 1,
        groundedAnswerCount: previous.groundedAnswerCount + (result.citations.length ? 1 : 0),
        noAnswerCount: previous.noAnswerCount + (result.status === 'no-answer' ? 1 : 0),
        totalLatencyMs: previous.totalLatencyMs + result.latencyMs,
      }));
    } catch {
      if (generation !== requestGeneration.current) return;
      setKnowledgeStatus('error');
      setMessages(previous => [...previous, {
        id: newId(),
        type: 'bot',
        text: 'The local bulletin index could not be searched. The rest of the app is still available; please try again.',
        timestamp: new Date(),
        confidence: 'none',
        status: 'error',
      }]);
      setSessionMetrics(previous => ({
        ...previous,
        queryCount: previous.queryCount + 1,
        errorCount: previous.errorCount + 1,
      }));
    } finally {
      if (generation === requestGeneration.current) setIsResponding(false);
    }
  };

  const clearMessages = () => {
    requestGeneration.current += 1;
    setIsResponding(false);
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      clearMessages,
      isOpen,
      isResponding,
      knowledgeStatus,
      sessionMetrics,
      toggleChat: () => setIsOpen(previous => !previous),
      openChat: () => setIsOpen(true),
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
