/**
 * GeminiService.ts
 * Thin wrapper around the Gemini 1.5 Flash REST API.
 * Works in the browser — no Node.js SDK needed.
 */

const MODEL = 'gemini-2.5-flash';

/** Build URL fresh on every call so hot-reload env changes are picked up */
function geminiUrl(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set. Check your .env.local file.');
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

/**
 * Send a conversation to Gemini and get the next assistant message.
 * @param history  Full conversation history so far.
 * @param system   Optional system instruction (persona + rules).
 */
export async function geminiChat(
  history: GeminiMessage[],
  system?: string
): Promise<string> {
  const url = geminiUrl();

  const body: any = {
    contents: history,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 600,
    },
  };

  if (system) {
    body.system_instruction = { parts: [{ text: system }] };
  }

  console.debug('[Gemini] → sending', history.length, 'messages');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Gemini] API error', res.status, errText);
    // Rethrow with the actual message so the UI can show it
    let friendly = `API error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      friendly = errJson?.error?.message ?? friendly;
    } catch { /* raw text is fine */ }
    throw new Error(friendly);
  }

  const data = await res.json();
  console.debug('[Gemini] ← received candidate');

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.warn('[Gemini] empty response', JSON.stringify(data));
    return "I'm having trouble responding right now. Please try again.";
  }
  return text;
}
