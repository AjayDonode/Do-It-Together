// src/pages/diy/DIYAdvisorPage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButton, IonIcon, useIonRouter,
} from '@ionic/react';
import { arrowBackOutline, sendOutline, hammerOutline, locationOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { geminiChat, geminiStructured, geminiGenerateImage, GeminiMessage } from '../../services/GeminiService';
import { DIYPlan, WoodDiagram } from '../../models/DIYReport';
import * as DIYService from '../../services/DIYService';
import UserProfileService from '../../services/UserProfileService';
import './DIYAdvisorPage.css';

// ─────────────────────────────────────────────────────────────────────────────
// Build intake system prompt with user's ZIP pre-filled
// ─────────────────────────────────────────────────────────────────────────────
function buildIntakeSystem(userZip: string | null): string {
  const zipLine = userZip
    ? `The user's registered ZIP code is ${userZip}. Do NOT ask for their ZIP — you already have it. Confirm you're looking in the ${userZip} area when relevant.`
    : `Ask for their ZIP code (for local tool pricing).`;

  return `You are a friendly, expert DIY advisor for "Do It Together" — a home services app.
Your job is to gather all the info needed to create a personalized DIY solution plan.

${zipLine}

Ask naturally (one or two questions at a time) to collect:
1. Exactly what they want to fix, build, or improve
2. Their DIY skill level: beginner | intermediate | expert
3. Budget range: under $50 | $50-$200 | $200-$500 | $500+
4. Timeline: today | this weekend | flexible
${userZip ? '' : '5. Their ZIP code'}

Once you have ALL required info, output this EXACT trigger on its own line:
[DIY_READY problem="..." skill="..." budget="..." timeline="..." zip="${userZip ?? '...'}"]

Then write a short, friendly message like "Perfect! Building your plan now 🔧"

Rules:
- Keep responses to 2-3 sentences max. Use emojis occasionally.
- If they describe something dangerous (electrical panel, gas lines, load-bearing walls), warn them and suggest a professional.
- Do NOT output [DIY_READY] until you have the problem, skill level, budget, and timeline.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan generation system prompt
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_SYSTEM = `You are an expert DIY planner. Output ONLY valid JSON — no markdown fences, no prose before or after.

Return this exact structure:
{
  "title": "short project title",
  "difficulty": "beginner|intermediate|expert",
  "totalTime": "e.g. 3-4 hours",
  "totalCost": "e.g. $80-$120",
  "steps": [
    { "step": 1, "title": "...", "description": "2 sentence max", "timeMinutes": 30, "tip": "brief tip" }
  ],
  "tools": [
    { "name": "...", "required": true, "searchQuery": "exact Home Depot search term", "estimatedPrice": "$12-$18" }
  ],
  "materials": [
    { "name": "...", "quantity": "2", "unit": "pieces", "searchQuery": "...", "estimatedPrice": "$5-$10" }
  ],
  "safetyNotes": ["brief safety note"],
  "whenToHireInstead": "1 sentence — when this is too risky to DIY",
  "imagePrompt": "detailed visual description of the finished result for photorealistic image generation"
}

Rules:
- Max 6 steps. Keep descriptions to 2 sentences each.
- Max 6 tools and 8 materials.
- Safety notes: max 3 items.
- All prices in USD format like "$12-$18".`;

// ─────────────────────────────────────────────────────────────────────────────
// Wood diagram generation system prompt
// ─────────────────────────────────────────────────────────────────────────────
const WOOD_DIAGRAM_SYSTEM = `You are an expert woodworking engineer. Output ONLY valid JSON — no markdown, no prose.

Return this exact structure:
{
  "overallNotes": "one sentence about lumber selection or grain direction",
  "pieces": [
    {
      "label": "short name e.g. Seat Top",
      "woodType": "e.g. Pine 2x4, 3/4\" Plywood, MDF",
      "thicknessIn": 1.5,
      "widthIn": 12,
      "lengthIn": 24,
      "quantity": 1,
      "notes": "optional tip e.g. Sand edges smooth"
    }
  ],
  "assemblySteps": [
    {
      "step": 1,
      "description": "one clear sentence describing what to join",
      "pieces": ["Seat Top", "Front Apron"],
      "hardwareNeeded": "e.g. 2\" wood screws × 8, wood glue"
    }
  ]
}

Rules:
- Max 12 pieces, max 8 assembly steps.
- All dimensions in inches as numbers (no units in the number fields).
- piece labels in assemblySteps MUST exactly match labels in pieces array.
- woodType should specify standard store lumber, e.g. \"Pine 2×4\", \"3/4\" Sanded Plywood\", \"1×6 Pine Board\".`;

// ─────────────────────────────────────────────────────────────────────────────
// Detect whether a project uses wood materials
// ─────────────────────────────────────────────────────────────────────────────
function isWoodProject(plan: DIYPlan, problem: string): boolean {
  const WOOD_KEYWORDS = [
    'wood', 'plywood', 'mdf', 'lumber', 'pine', 'oak', 'birch', 'cedar',
    'hardwood', 'softwood', 'board', 'plank', 'stool', 'shelf', 'shelving',
    'cabinet', 'entertainment', 'bookcase', 'bench', 'table', 'desk',
    'drawer', 'frame', 'box', 'crate', 'deck', 'pergola', 'fence',
  ];
  const haystack = [
    plan.title,
    problem,
    ...plan.materials.map(m => m.name + ' ' + m.searchQuery),
  ].join(' ').toLowerCase();

  return WOOD_KEYWORDS.some(kw => haystack.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat message type (UI only)
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string;
  role: 'bot' | 'user';
  text: string;
  isError?: boolean;
}

function uid(): string {
  return `${Date.now()}-${Math.random()}`;
}

// Generating steps shown in the animated overlay
const GEN_STEPS = [
  { icon: '🔍', label: 'Analysing your project…' },
  { icon: '📋', label: 'Building step-by-step plan…' },
  { icon: '🛠️', label: 'Selecting tools & materials…' },
  { icon: '💰', label: 'Estimating costs…' },
  { icon: '🪚', label: 'Generating cut list & assembly diagram…' },
  { icon: '🎨', label: 'Generating design mockup…' },
  { icon: '✅', label: 'Finalising your plan…' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quick prompt suggestions
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  '🪣 Fix a leaky faucet',
  '🪟 Install a ceiling fan',
  '🎨 Paint a room',
  '🚪 Hang a door',
  '🪛 Fix a running toilet',
  '🔲 Install tile backsplash',
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated generating overlay component
// ─────────────────────────────────────────────────────────────────────────────
const GeneratingOverlay: React.FC<{ step: string }> = ({ step }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % GEN_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="diy-gen-overlay">
      <div className="diy-gen-card">
        {/* Animated rings */}
        <div className="diy-gen-rings">
          <div className="diy-gen-ring ring-1" />
          <div className="diy-gen-ring ring-2" />
          <div className="diy-gen-ring ring-3" />
          <div className="diy-gen-icon-center">🔧</div>
        </div>

        <p className="diy-gen-title">AI is building your plan</p>
        <p className="diy-gen-subtitle">This takes about 15–30 seconds</p>

        {/* Step progress list */}
        <div className="diy-gen-steps-list">
          {GEN_STEPS.map((s, i) => (
            <div
              key={i}
              className={`diy-gen-step-row ${i < activeIdx ? 'done' : ''} ${i === activeIdx ? 'active' : ''}`}
            >
              <span className="diy-gen-step-icon">{i < activeIdx ? '✅' : s.icon}</span>
              <span className="diy-gen-step-label">{s.label}</span>
              {i === activeIdx && <span className="diy-gen-pulse-dot" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const DIYAdvisorPage: React.FC = () => {
  const router = useIonRouter();
  const { currentUser } = useAuth();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userZip, setUserZip] = useState<string | null>(null);
  const [zipCity, setZipCity] = useState<string>('');
  const [intakeSystem, setIntakeSystem] = useState<string>(buildIntakeSystem(null));

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  // ── Load user's ZIP from profile on mount ──
  useEffect(() => {
    if (!currentUser) return;
    UserProfileService.getProfile(currentUser.uid).then(profile => {
      const zip = profile?.address?.zip ?? null;
      const city = profile?.address?.city ?? '';
      setUserZip(zip);
      setZipCity(city);
      setIntakeSystem(buildIntakeSystem(zip));

      const greeting = zip
        ? `Hey! 🔧 I'm your DIY Advisor. I see you're in **${city || zip}** — I'll tailor your plan and tool prices for your area. What would you like to fix or build today?`
        : "Hey! 🔧 I'm your DIY Advisor. Tell me what you'd like to fix or build, and I'll create a personalized step-by-step plan with tools, materials, and even a design image!";

      setMessages([{ id: 'init', role: 'bot', text: greeting }]);
    });
  }, [currentUser]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => contentRef.current?.scrollToBottom(350), 80);
  }, [messages, isThinking, isGenerating]);

  const addMessage = (msg: Omit<ChatMsg, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: uid() }]);
  };

  const appendHistory = useCallback((role: 'user' | 'model', text: string) => {
    setGeminiHistory(prev => [...prev, { role, parts: [{ text }] }]);
  }, []);

  // ── Parse [DIY_READY ...] trigger ──
  const parseDIYReady = (text: string) => {
    const match = text.match(/\[DIY_READY\s+(.+?)\]/s);
    if (!match) return null;
    const inner = match[1];
    const get = (key: string) => {
      const m = inner.match(new RegExp(`${key}="([^"]+)"`));
      return m ? m[1] : '';
    };
    return {
      problem: get('problem'),
      skill: get('skill'),
      budget: get('budget'),
      timeline: get('timeline'),
      zip: get('zip') || userZip || '00000',
    };
  };

  const stripTrigger = (text: string) =>
    text.replace(/\[DIY_READY[^\]]*\]/gs, '').trim();

  // ── Generate plan + image + save ──
  const generateDIYReport = async (intake: { problem: string; skill: string; budget: string; timeline: string; zip: string }) => {
    if (!currentUser) return;
    setIsGenerating(true);

    try {
      setGenStep('plan');
      const planPrompt = `Create a complete DIY plan for:
Problem: ${intake.problem}
Skill level: ${intake.skill}
Budget: ${intake.budget}
Timeline: ${intake.timeline}
ZIP code: ${intake.zip}

Include realistic Home Depot pricing. Make steps actionable.`;

      const plan = await geminiStructured<DIYPlan>(planPrompt, PLAN_SYSTEM);

      // ── If this is a wood project, generate cut list & assembly diagram ──
      if (isWoodProject(plan, intake.problem)) {
        setGenStep('wood');
        try {
          const woodPrompt = `Generate a precise cut list and assembly diagram for this woodworking project:
Project: ${plan.title}
Problem: ${intake.problem}
Skill level: ${intake.skill}

Materials already selected:
${plan.materials.map(m => `- ${m.name} (${m.quantity} ${m.unit})`).join('\n')}

Steps already planned:
${plan.steps.map(s => `${s.step}. ${s.title}: ${s.description}`).join('\n')}

Provide exact cut dimensions for every wood piece needed. Use standard store lumber sizes.`;
          const woodDiagram = await geminiStructured<WoodDiagram>(woodPrompt, WOOD_DIAGRAM_SYSTEM);
          plan.woodDiagram = woodDiagram;
          console.debug('[DIY] Wood diagram generated:', woodDiagram.pieces.length, 'pieces');
        } catch (woodErr) {
          console.warn('[DIY] Wood diagram skipped:', woodErr);
        }
      }

      setGenStep('saving');
      const reportId = await DIYService.createReport({
        userId: currentUser.uid,
        problem: intake.problem,
        skillLevel: intake.skill,
        budget: intake.budget,
        timeline: intake.timeline,
        zipCode: intake.zip,
        plan,
        status: 'generating',
      });

      setGenStep('image');
      try {
        const imagePrompt = `${plan.imagePrompt}. Professional photo, bright natural lighting, clean finished result, photorealistic.`;
        const dataUri = await geminiGenerateImage(imagePrompt);
        const imageUrl = await DIYService.uploadDesignImage(reportId, dataUri);
        await DIYService.updateReportImage(reportId, imageUrl);
      } catch (imgErr: any) {
        const reason = imgErr?.message ?? 'Unknown image error';
        console.error('[DIY] Image generation failed:', reason);
        // Save empty URL but store the error reason for display
        await DIYService.updateReportImage(reportId, '', reason);
      }

      setGenStep('done');
      router.push(`/tabs/diy-report/${reportId}`);

    } catch (err: any) {
      console.error('[DIY] Plan generation error:', err);
      addMessage({
        role: 'bot',
        text: `⚠️ Sorry, I had trouble generating the plan: ${err?.message ?? 'Unknown error'}. Please try again!`,
        isError: true,
      });
    } finally {
      setIsGenerating(false);
      setGenStep('');
    }
  };

  // ── Main send handler ──
  const handleSend = async (overrideText?: string) => {
    const userText = (overrideText ?? inputText).trim();
    if (!userText || isThinking || isGenerating) return;

    setInputText('');
    addMessage({ role: 'user', text: userText });
    setIsThinking(true);

    const newHistory: GeminiMessage[] = [
      ...geminiHistory,
      { role: 'user', parts: [{ text: userText }] },
    ];

    try {
      const rawReply = await geminiChat(newHistory, intakeSystem);
      appendHistory('user', userText);

      const intake = parseDIYReady(rawReply);
      const displayText = stripTrigger(rawReply);

      if (intake) {
        addMessage({ role: 'bot', text: displayText || 'Perfect! Building your plan now 🔧' });
        appendHistory('model', rawReply);
        setIsThinking(false);
        await generateDIYReport(intake);
      } else {
        addMessage({ role: 'bot', text: displayText });
        appendHistory('model', rawReply);
        setIsThinking(false);
      }
    } catch (err: any) {
      addMessage({ role: 'bot', text: `⚠️ ${err?.message ?? 'Something went wrong. Please try again!'}`, isError: true });
      setIsThinking(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // Render bold markdown **text**
  const renderText = (text: string) =>
    text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );

  // ─────────────── JSX ───────────────
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="diy-toolbar">
          <IonButton slot="start" fill="clear" onClick={() => router.push('/tabs/home')}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle className="diy-header-title">
            <IonIcon icon={hammerOutline} className="diy-header-icon" />
            DIY Advisor
          </IonTitle>
        </IonToolbar>

        {/* ZIP pill shown under header when available */}
        {userZip && (
          <div className="diy-zip-banner">
            <IonIcon icon={locationOutline} />
            <span>Using your area: <strong>{zipCity || userZip}</strong> ({userZip})</span>
          </div>
        )}
      </IonHeader>

      <IonContent ref={contentRef} className="diy-chat-content">
        <div className="diy-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`diy-bubble-wrap ${msg.role}`}>
              {msg.role === 'bot' && (
                <div className="diy-bot-avatar">
                  <IonIcon icon={hammerOutline} />
                </div>
              )}
              <div className={`diy-bubble ${msg.role}${msg.isError ? ' bubble-error' : ''}`}>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{renderText(msg.text)}</p>
              </div>
            </div>
          ))}

          {/* Quick prompts — shown only on first message */}
          {messages.length === 1 && !isThinking && (
            <div className="diy-quick-prompts">
              <p className="diy-quick-label">Try one of these:</p>
              <div className="diy-chips-row">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} className="diy-chip" onClick={() => handleSend(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="diy-bubble-wrap bot">
              <div className="diy-bot-avatar">
                <IonIcon icon={hammerOutline} />
              </div>
              <div className="diy-bubble bot typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
        </div>
      </IonContent>

      {/* Animated generating overlay — full screen */}
      {isGenerating && <GeneratingOverlay step={genStep} />}

      {/* Input bar */}
      <div className="diy-input-bar">
        <input
          ref={inputRef}
          className="diy-text-input"
          placeholder="Describe what you want to fix or build…"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isThinking || isGenerating}
        />
        <button
          className="diy-send-btn"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isThinking || isGenerating}
        >
          <IonIcon icon={sendOutline} />
        </button>
      </div>
    </IonPage>
  );
};

export default DIYAdvisorPage;
