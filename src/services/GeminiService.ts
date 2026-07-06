/**
 * GeminiService.ts
 * Thin wrapper around the Gemini REST APIs.
 * - geminiChat: conversational (existing)
 * - geminiStructured: JSON mode for plan generation
 * - geminiGenerateImage: Gemini 2.0 Flash image generation
 */

const CHAT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

/** Build URL fresh on every call so hot-reload env changes are picked up */
function geminiUrl(model: string): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set. Check your .env.local file.');
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
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
  const url = geminiUrl(CHAT_MODEL);

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

/**
 * Generate a structured JSON response using Gemini JSON mode.
 * Uses low temperature for deterministic, parseable output.
 * @param prompt  The user prompt describing what to generate.
 * @param system  System instruction / persona.
 */
export async function geminiStructured<T>(
  prompt: string,
  system?: string
): Promise<T> {
  const url = geminiUrl(CHAT_MODEL);

  const body: any = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  if (system) {
    body.system_instruction = { parts: [{ text: system }] };
  }

  console.debug('[Gemini Structured] → generating JSON');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Gemini Structured] API error', res.status, errText);
    let friendly = `API error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      friendly = errJson?.error?.message ?? friendly;
    } catch { /* raw text is fine */ }
    throw new Error(friendly);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Gemini returned empty structured response');

  console.debug('[Gemini Structured] ← received JSON');
  return JSON.parse(text) as T;
}

/**
 * Generate an image using Gemini 2.0 Flash image generation.
 * Returns a base64-encoded PNG string (data URI ready).
 * @param prompt  Text description of image to generate.
 */
export async function geminiGenerateImage(prompt: string): Promise<string> {
  const url = geminiUrl(IMAGE_MODEL);

  const body = {
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  console.debug('[Gemini Image] → generating image with model:', IMAGE_MODEL);
  console.debug('[Gemini Image] prompt:', prompt.slice(0, 120));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Gemini Image] API error', res.status, errText);
    let friendly = `Image generation error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      friendly = errJson?.error?.message ?? friendly;
    } catch { /* raw text is fine */ }
    throw new Error(friendly);
  }

  const data = await res.json();
  console.debug('[Gemini Image] raw response keys:', Object.keys(data));

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  console.debug('[Gemini Image] parts received:', parts.length, parts.map((p: any) => Object.keys(p)));

  // Find the inline image part
  const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
  if (!imagePart?.inlineData?.data) {
    // Log full response to help debug model/quota issues
    console.error('[Gemini Image] No image part found. Full response:', JSON.stringify(data, null, 2));
    const textPart = parts.find((p: any) => p.text);
    const hint = textPart?.text ? ` Model said: "${textPart.text.slice(0, 200)}"` : '';
    throw new Error(`No image returned from Gemini.${hint}`);
  }

  const mimeType = imagePart.inlineData.mimeType;
  const base64 = imagePart.inlineData.data;
  console.debug('[Gemini Image] ← received image, mime:', mimeType, 'size:', base64.length, 'chars');

  return `data:${mimeType};base64,${base64}`;
}
