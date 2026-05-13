import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { Message, ApiError } from '../types/chat';
import { sendChat } from '../api/chat';
import styles from './TalentGpt.module.scss';

export interface ITalentGptProps {
  apiBaseUrl: string;
  webpartHeight: number;
  context: WebPartContext;
}

const SUGGESTED = [
  'Why should we use RMSE over MAE?',
  'What models were used for candidate ranking?',
  'What is the Coresignal API used for?',
  'How does TF-IDF work in the manuscript?',
  'What does Shapash do in the pipeline?',
  'Who wrote the manuscript and what is it about?',
];

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function createWelcome(): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content:
      "👋 Hi! I'm **TalentGPT** — ask me anything about the MSc recruitment research manuscript, models, or supporting literature. " +
      "I can help you explore topics like candidate ranking with Ridge Regression and Gradient Boosting, explainability with Shapash, and data aggregation via the Coresignal API.",
    timestamp: new Date(),
  };
}

const TalentGpt: React.FC<ITalentGptProps> = ({ apiBaseUrl, webpartHeight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([createWelcome()]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = useCallback(
    async (question: string) => {
      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };

      const loadingId = makeId();
      const loadingMsg: Message = {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        loading: true,
      };

      setSuggestionsVisible(false);
      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setLoading(true);

      try {
        const data = await sendChat(question, apiBaseUrl);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  content: data.answer,
                  response_type: data.response_type,
                  sources: data.sources,
                  loading: false,
                }
              : m
          )
        );
      } catch (err) {
        const apiErr = err as ApiError;
        const userMessage =
          apiErr?.userMessage ?? 'Something went wrong. Please try again.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? { ...m, content: userMessage, loading: false, isError: true }
              : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl]
  );

  return (
    <div className={styles.floatRoot}>
      {isOpen && (
        <div className={`${styles.panel} ${isExpanded ? styles.panelExpanded : ''}`} style={!isExpanded ? { height: webpartHeight } : undefined}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>TalentGPT</span>
            <div className={styles.headerActions}>
              <button
                className={styles.closeBtn}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                title={isExpanded ? 'Compact view' : 'Expand view'}
              >
                {isExpanded ? (
                  // collapse icon
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6"/><polyline points="9 18 3 12 9 6"/>
                  </svg>
                ) : (
                  // expand icon
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/><polyline points="15 18 21 12 15 6"/>
                  </svg>
                )}
              </button>
              <button
                className={styles.closeBtn}
                onClick={() => { setIsOpen(false); setIsExpanded(false); }}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {!apiBaseUrl ? (
            <div className={styles.configNotice}>
              <p>⚙️ Set the <strong>API Base URL</strong> in the web part property pane.</p>
            </div>
          ) : isExpanded ? (
            // ── Expanded wide view ──
            <div className={styles.expandedLayout}>
              <div className={styles.layout}>
                <div className={styles.messages}>
                  <div className={styles.messagesInner}>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {suggestionsVisible && (
                      <div className={styles.suggestions}>
                        <p className={styles.suggestionsLabel}>Try asking</p>
                        <div className={styles.suggestionsGrid}>
                          {SUGGESTED.map((q) => (
                            <button key={q} className={styles.suggestionChip} onClick={() => handleSend(q)}>{q}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
                <ChatInput onSend={handleSend} disabled={loading} />
                <p className={styles.disclaimer}>AI responses may occasionally be inaccurate.</p>
              </div>
            </div>
          ) : (
            // ── Compact default view ──
            <div className={styles.layout}>
              <div className={styles.messages}>
                <div className={styles.messagesInner}>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {suggestionsVisible && (
                    <div className={styles.suggestions}>
                      <p className={styles.suggestionsLabel}>Try asking</p>
                      <div className={styles.suggestionsGrid}>
                        {SUGGESTED.map((q) => (
                          <button key={q} className={styles.suggestionChip} onClick={() => handleSend(q)}>{q}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
              <ChatInput onSend={handleSend} disabled={loading} />
              <p className={styles.disclaimer}>AI responses may occasionally be inaccurate.</p>
            </div>
          )}
        </div>
      )}

      <button
        className={styles.fab}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close TalentGPT' : 'Open TalentGPT'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default TalentGpt;
