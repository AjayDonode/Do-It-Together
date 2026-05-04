import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  useIonRouter,
} from '@ionic/react';
import { sendOutline, arrowBackOutline, sparklesOutline, locationOutline, timeOutline } from 'ionicons/icons';
import './AIFinder.css';
import { geminiChat, GeminiMessage } from '../services/GeminiService';
import * as HelperService from '../services/HelperService';
import { Helper } from '../models/Helper';

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  helpers?: Helper[];
  isError?: boolean;
}

/* ────────────────────────────────────────────────────────────
   Build system prompt dynamically from live category list
──────────────────────────────────────────────────────────── */
function buildSystemPrompt(categories: string[]): string {
  const list = categories.length > 0
    ? categories.join(', ')
    : 'various home and local services';
  return `You are a friendly AI assistant for "Do It Together", a local services app that connects people with vetted helpers.

Available service categories (from the database): ${list}

Your job:
1. Have a warm, natural conversation to understand what service the user needs and their ZIP code.
2. Ask clarifying questions if the request is vague.
3. Once you have BOTH a ZIP code (5-digit US zip) AND a service category that matches one of the available categories above, output a search trigger on its own line in EXACTLY this format:
   [SEARCH zip=XXXXX category=CATEGORY]
   Where CATEGORY must be one of the exact values listed above.
4. After the [SEARCH ...] line, write a brief human-friendly message like "Let me look that up for you! 🔍"
5. If the user asks for a service NOT in the available categories, let them know it's not currently available and suggest the closest match from the list.
6. Keep responses concise — 2–4 sentences max. Use emojis occasionally for warmth.
7. If the user wants to search again or try something different, help them restart.`;
}

/** Normalize a Gemini-produced category string to the closest known category */
function normalizeCategory(raw: string, categories: string[]): string {
  const lower = raw.toLowerCase().trim();
  // Exact match first (case-insensitive)
  const exact = categories.find(c => c.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match — category name contains the raw term or vice versa
  const partial = categories.find(
    c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())
  );
  return partial ?? raw;
}

/* ────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────── */
const AIFinder: React.FC = () => {
  const router = useIonRouter();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live categories fetched from Firestore
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch distinct categories on mount
  useEffect(() => {
    HelperService.getDistinctCategories().then((cats) => {
      setCategories(cats);
      setCategoriesLoading(false);
    });
  }, []);

  // Derived: system prompt built from live categories
  const systemPrompt = buildSystemPrompt(categories);

  // UI messages (what the user sees)
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'init',
    role: 'bot',
    text: "Hi! 👋 I'm your AI helper finder. Tell me what you need help with and your ZIP code, and I'll find the best local pros for you!",
  }]);

  // Gemini conversation history (role: user | model)
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => contentRef.current?.scrollToBottom(350), 80);
  }, [messages, isThinking]);

  /* ── Helpers ── */
  const addMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
  };

  /** Push a turn to Gemini history */
  const appendHistory = useCallback((role: 'user' | 'model', text: string) => {
    setGeminiHistory(prev => [...prev, { role, parts: [{ text }] }]);
  }, []);

  /* ── Parse Gemini response for [SEARCH zip=... category=...] ── */
  const parseSearchIntent = (text: string): { zip: string; category: string } | null => {
    const match = text.match(/\[SEARCH\s+zip=(\d{4,5})\s+category=([^\]]+)\]/i);
    if (!match) return null;
    return { zip: match[1].trim(), category: match[2].trim() };
  };

  /** Strip the [SEARCH ...] line from display text */
  const stripSearchMarker = (text: string) =>
    text.replace(/\[SEARCH\s+zip=\S+\s+category=[^\]]+\]/gi, '').trim();

  /* ── Main send handler ── */
  const handleSend = async () => {
    const userText = inputText.trim();
    if (!userText || isThinking) return;

    setInputText('');
    addMessage({ role: 'user', text: userText });
    setIsThinking(true);

    // Build Gemini history with the new user turn
    const newHistory: GeminiMessage[] = [
      ...geminiHistory,
      { role: 'user', parts: [{ text: userText }] },
    ];

    try {
      // 1. Get Gemini's reply
      const rawReply = await geminiChat(newHistory, systemPrompt);
      appendHistory('user', userText);

      // 2. Check for search intent
      const intent = parseSearchIntent(rawReply);
      const displayText = stripSearchMarker(rawReply);

      if (intent) {
        // Normalize Gemini's category label → exact Firestore value
        const resolvedCategory = normalizeCategory(intent.category, categories);
        console.log(`[Search] Gemini said: "${intent.category}" → resolved: "${resolvedCategory}", zip: ${intent.zip}`);

        // Show the "searching…" message immediately
        addMessage({ role: 'bot', text: displayText || `Searching for **${resolvedCategory}** helpers near ${intent.zip}… 🔍` });
        appendHistory('model', rawReply);

        // 3. Query Firestore with normalized category
        const results = await HelperService.searchHelpers(resolvedCategory, intent.zip);

        // 4. Feed results back to Gemini for a natural summary
        let followUpText: string;
        let helpersToShow: Helper[] = [];

        if (results.length === 0) {
          const noResultsContext = `[SYSTEM: Firestore search returned 0 results for category="${resolvedCategory}" zip="${intent.zip}". Tell the user no results were found and offer to try a different category or zip code.]`;
          const followUp = await geminiChat(
            [...newHistory, { role: 'model', parts: [{ text: rawReply }] }, { role: 'user', parts: [{ text: noResultsContext }] }],
            systemPrompt
          );
          followUpText = followUp;
          appendHistory('user', noResultsContext);
          appendHistory('model', followUp);
        } else {
          helpersToShow = results.slice(0, 8);
          const resultsSummary = helpersToShow
            .map((h, i) => `${i + 1}. ${h.name} — ${h.category}, rating: ${h.rating?.toFixed(1) ?? 'N/A'}, zip: ${h.zipcodes?.[0] ?? intent.zip}`)
            .join('\n');

          const resultsContext = `[SYSTEM: Found ${results.length} ${resolvedCategory} helpers near zip ${intent.zip}. Top results:\n${resultsSummary}\nWrite a friendly 2-3 sentence summary. Mention the count, the category, and encourage tapping a card to see full details.]`;
          const followUp = await geminiChat(
            [...newHistory, { role: 'model', parts: [{ text: rawReply }] }, { role: 'user', parts: [{ text: resultsContext }] }],
            systemPrompt
          );
          followUpText = followUp;
          appendHistory('user', resultsContext);
          appendHistory('model', followUp);
        }

        addMessage({ role: 'bot', text: followUpText, helpers: helpersToShow });

      } else {
        // Normal conversational reply (no search needed yet)
        addMessage({ role: 'bot', text: displayText });
        appendHistory('model', rawReply);
      }

    } catch (err: any) {
      console.error('[MagicSearch] error:', err?.message ?? err);
      addMessage({
        role: 'bot',
        text: `⚠️ ${err?.message ?? 'Something went wrong. Please try again!'}`,
        isError: true,
      });
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend();
  };

  const handleHelperClick = (helper: Helper) => {
    router.push(`/tabs/helper-profile/${helper.id}`);
  };

  /* ── Render text with **bold** markdown ── */
  const renderText = (text: string) => {
    return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  /* ────────────────── JSX ────────────────── */
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="magic-toolbar">
          <IonButton slot="start" fill="clear" onClick={() => router.push('/tabs/home')}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle className="magic-header-title">
            <IonIcon icon={sparklesOutline} className="magic-header-icon" />
            AI Helper Finder
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} className="magic-chat-content">
        {categoriesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
            <IonIcon icon={sparklesOutline} style={{ fontSize: '2rem', color: 'var(--color-primary)' }} />
            <p style={{ color: '#888', fontSize: '14px' }}>Loading available services…</p>
          </div>
        ) : (
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.role}`}>
              {msg.role === 'bot' && (
                <div className="bot-avatar">
                  <IonIcon icon={sparklesOutline} />
                </div>
              )}

              <div className={`chat-bubble ${msg.role}${msg.isError ? ' bubble-error' : ''}`}>
                <p className="bubble-text" style={{ whiteSpace: 'pre-line' }}>
                  {renderText(msg.text)}
                </p>

                {/* Helper result cards */}
                {msg.helpers && msg.helpers.length > 0 && (
                  <div className="chat-results-scroll">
                    {msg.helpers.map((h) => (
                      <div
                        key={h.id}
                        className="chat-result-card"
                        onClick={() => handleHelperClick(h)}
                        >
                          <div className="crc-banner-wrap">
                            <img
                              className="crc-banner"
                              src={h.banner || h.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80'}
                              alt={h.name}
                            />
                          </div>
                          <img
                            className="crc-avatar"
                            src={h.avatar || 'https://www.gravatar.com/avatar?d=mp'}
                            alt={h.name}
                          />
                          <p className="crc-name">{h.name}</p>
                          <p className="crc-cat">{h.category}</p>
                          {h.address && (
                            <p className="crc-address">
                              <IonIcon icon={locationOutline} />
                              {h.address}
                            </p>
                          )}
                          {h.hours && (
                            <p className="crc-hours">
                              <IonIcon icon={timeOutline} />
                              {h.hours}
                            </p>
                          )}
                          <p className="crc-rating">⭐ {h.rating?.toFixed(1) ?? '–'} ({h.ratingCount ?? 0})</p>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking / typing indicator */}
          {isThinking && (
            <div className="chat-bubble-wrap bot">
              <div className="bot-avatar">
                <IonIcon icon={sparklesOutline} />
              </div>
              <div className="chat-bubble bot typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
        </div>
        )}
      </IonContent>

      {/* ── Input bar ── */}
      <div className="magic-input-bar">
        <input
          ref={inputRef}
          className="magic-text-input"
          placeholder="Ask me anything about local help…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isThinking}
        />
        <button
          className="magic-send-btn"
          onClick={handleSend}
          disabled={!inputText.trim() || isThinking}
        >
          <IonIcon icon={sendOutline} />
        </button>
      </div>
    </IonPage>
  );
};

export default AIFinder;
