// src/pages/diy/DIYReportView.tsx
import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonButton, IonIcon, IonSpinner, useIonRouter,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import {
  arrowBackOutline, hammerOutline, timeOutline, cashOutline,
  alertCircleOutline, checkmarkCircleOutline, cartOutline,
  constructOutline, sparklesOutline, warningOutline, downloadOutline,
} from 'ionicons/icons';
import { DIYReport, DIYStep, DIYTool, DIYMaterial, WoodPiece, AssemblyStep } from '../../models/DIYReport';
import * as DIYService from '../../services/DIYService';
import './DIYReportView.css';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  expert: '#ef4444',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '🟢 Beginner',
  intermediate: '🟡 Intermediate',
  expert: '🔴 Expert',
};

// ─── Cut Piece SVG Card ───────────────────────────────────────────────────────
const CutPieceCard: React.FC<{ piece: WoodPiece }> = ({ piece }) => {
  const maxW = 110;
  const maxH = 60;
  const aspect = piece.lengthIn / piece.widthIn;
  let rectW = maxW;
  let rectH = rectW / aspect;
  if (rectH > maxH) { rectH = maxH; rectW = rectH * aspect; }
  const svgW = rectW + 30;
  const svgH = rectH + 26;
  const rx = 4;
  const px = 14;
  const py = 4;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`grain-${piece.label}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 Q4 4 8 0" stroke="#d97706" strokeWidth="0.4" fill="none" opacity="0.35" />
          <path d="M0 4 Q4 8 8 4" stroke="#d97706" strokeWidth="0.4" fill="none" opacity="0.35" />
        </pattern>
      </defs>
      <rect x={px} y={py} width={rectW} height={rectH} rx={rx} ry={rx}
        fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x={px} y={py} width={rectW} height={rectH} rx={rx} ry={rx}
        fill={`url(#grain-${piece.label})`} opacity={0.5} />
      <line x1={px} y1={py + rectH + 6} x2={px + rectW} y2={py + rectH + 6}
        stroke="#9ca3af" strokeWidth="0.8" />
      <text x={px + rectW / 2} y={py + rectH + 14}
        textAnchor="middle" fontSize="7" fill="#374151" fontWeight="700">
        {piece.lengthIn}&quot;
      </text>
      <line x1={px - 6} y1={py} x2={px - 6} y2={py + rectH}
        stroke="#9ca3af" strokeWidth="0.8" />
      <text x={px - 9} y={py + rectH / 2}
        textAnchor="middle" fontSize="7" fill="#374151" fontWeight="700"
        transform={`rotate(-90, ${px - 9}, ${py + rectH / 2})`}>
        {piece.widthIn}&quot;
      </text>
    </svg>
  );
};

// ─── Assembly Diagram ─────────────────────────────────────────────────────────
const AssemblyDiagramSection: React.FC<{ steps: AssemblyStep[] }> = ({ steps }) => (
  <div className="rpt-assembly-flow">
    {steps.map((s, i) => (
      <React.Fragment key={s.step}>
        <div className="rpt-asm-step">
          <div className="rpt-asm-header">
            <div className="rpt-asm-num">{s.step}</div>
            <p className="rpt-asm-desc">{s.description}</p>
          </div>
          <div className="rpt-asm-pieces">
            {s.pieces.map(p => (
              <span key={p} className="rpt-asm-piece-tag">{p}</span>
            ))}
          </div>
          {s.hardwareNeeded && (
            <div className="rpt-asm-hardware">{s.hardwareNeeded}</div>
          )}
        </div>
        {i < steps.length - 1 && (
          <div className="rpt-asm-connector">↓</div>
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const DIYReportView: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useIonRouter();

  const [report, setReport] = useState<DIYReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: ReturnType<typeof setInterval>;

    const load = async () => {
      try {
        const r = await DIYService.getReport(reportId);
        if (!isMounted) return;

        if (!r) { setError('Report not found.'); setLoading(false); return; }

        setReport(r);

        if (r.status === 'generating') {
          pollInterval = setInterval(async () => {
            const updated = await DIYService.getReport(reportId);
            if (!isMounted) return;
            if (updated && updated.status !== 'generating') {
              setReport(updated);
              setLoading(false);
              clearInterval(pollInterval);
            }
          }, 3000);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) { setError(err?.message ?? 'Failed to load report.'); setLoading(false); }
      }
    };

    load();
    return () => { isMounted = false; if (pollInterval) clearInterval(pollInterval); };
  }, [reportId]);

  const openStoreLink = (searchQuery: string, store: 'homedepot' | 'lowes' | 'amazon') => {
    const urls: Record<string, string> = {
      homedepot: `https://www.homedepot.com/s/${encodeURIComponent(searchQuery)}`,
      lowes: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(searchQuery)}`,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`,
    };
    window.open(urls[store], '_blank', 'noopener');
  };

  // ─── PDF Download ──────────────────────────────────────────────────────────
  const downloadPDF = () => {
    if (!report) return;
    const { plan } = report;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const cutRows = (plan.woodDiagram?.pieces ?? []).map(p =>
      `<tr>
        <td>${p.label}</td>
        <td>${p.woodType}</td>
        <td class="c">${p.thicknessIn}"</td>
        <td class="c">${p.widthIn}"</td>
        <td class="c">${p.lengthIn}"</td>
        <td class="c">${p.quantity}</td>
        <td>${p.notes ?? ''}</td>
      </tr>`
    ).join('');

    const asmRows = (plan.woodDiagram?.assemblySteps ?? []).map(s =>
      `<tr>
        <td class="c"><b>${s.step}</b></td>
        <td>${s.description}</td>
        <td>${s.pieces.join(', ')}</td>
        <td>${s.hardwareNeeded ?? ''}</td>
      </tr>`
    ).join('');

    const matRows = plan.materials.map(m =>
      `<tr><td>${m.name}</td><td class="c">${m.quantity} ${m.unit}</td><td class="c">${m.estimatedPrice}</td></tr>`
    ).join('');

    const toolRows = plan.tools.map(t =>
      `<tr><td>${t.required ? '&#10003;' : '&#9675;'} ${t.name}</td><td class="c">${t.estimatedPrice}</td></tr>`
    ).join('');

    const safetyHtml = plan.safetyNotes?.length
      ? `<h2>Safety Notes</h2><ul>${plan.safetyNotes.map(n => `<li>${n}</li>`).join('')}</ul>`
      : '';

    const imgHtml = report.designImageUrl
      ? `<div class="img-wrap"><img src="${report.designImageUrl}" /><p class="img-caption">AI Design Mockup</p></div>`
      : '';

    const notesHtml = plan.woodDiagram?.overallNotes
      ? `<div class="note-box">&#128161; ${plan.woodDiagram.overallNotes}</div>`
      : '';

    const cutSection = cutRows
      ? `<h2>&#128690; Wood Cut List</h2>${notesHtml}
         <table><thead><tr><th>Piece</th><th>Wood Type</th><th>Thick.</th><th>Width</th><th>Length</th><th>Qty</th><th>Notes</th></tr></thead>
         <tbody>${cutRows}</tbody></table>`
      : '';

    const asmSection = asmRows
      ? `<h2>&#128295; Assembly Order</h2>
         <table><thead><tr><th>#</th><th>Step</th><th>Pieces Involved</th><th>Hardware Needed</th></tr></thead>
         <tbody>${asmRows}</tbody></table>`
      : '';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${plan.title} — DIY Cut List</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;padding:36px;max-width:960px;margin:0 auto;font-size:13px}
  h1{font-size:22px;font-weight:800;margin-bottom:4px}
  .sub{color:#6b7280;font-size:12px;margin-bottom:4px}
  .meta{color:#9ca3af;font-size:11px;margin-bottom:20px}
  .badges{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
  .badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px}
  .bt{background:#fef3c7;color:#92400e}
  .bc{background:#d1fae5;color:#065f46}
  .bd{background:#ede9fe;color:#5b21b6}
  .img-wrap{text-align:center;margin:20px 0}
  .img-wrap img{max-width:100%;max-height:280px;border-radius:10px;border:1px solid #e5e7eb}
  .img-caption{font-size:11px;color:#9ca3af;margin-top:6px}
  .note-box{background:#fef3c7;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:6px;font-size:12px;color:#78350f;margin-bottom:12px}
  h2{font-size:14px;font-weight:700;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #f3f4f6;color:#374151}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px}
  th{background:#f9fafb;text-align:left;padding:7px 9px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;border-bottom:1px solid #e5e7eb}
  td{padding:7px 9px;border-bottom:1px solid #f3f4f6;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  .c{text-align:center}
  ul{padding-left:18px}
  li{margin-bottom:4px;line-height:1.5}
  .footer{margin-top:40px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #f3f4f6;padding-top:14px}
  @media print{body{padding:16px}h2{page-break-after:avoid}table{page-break-inside:avoid}}
</style>
</head>
<body>
<h1>${plan.title}</h1>
<p class="sub">${report.problem}</p>
<p class="meta">Generated ${date} &bull; Do It Together</p>
<div class="badges">
  <span class="badge bt">&#9201; ${plan.totalTime}</span>
  <span class="badge bc">Est. ${plan.totalCost}</span>
  <span class="badge bd">${plan.difficulty}</span>
</div>
${imgHtml}
${cutSection}
${asmSection}
<h2>&#128722; Materials &amp; Supplies</h2>
<table><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead>
<tbody>${matRows}</tbody></table>
<h2>&#128295; Tools Needed</h2>
<table><thead><tr><th>Tool</th><th>Est. Price</th></tr></thead>
<tbody>${toolRows}</tbody></table>
${safetyHtml}
<div class="footer">Printed from Do It Together &bull; doitto.app</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading || (report && report.status === 'generating')) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar className="rpt-toolbar">
            <IonButton slot="start" fill="clear" onClick={() => router.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="rpt-content">
          <div className="rpt-loading-wrap">
            <div className="rpt-loading-card">
              <IonSpinner name="crescent" className="rpt-spinner" />
              <p className="rpt-loading-title">Building your DIY plan…</p>
              <p className="rpt-loading-sub">Generating steps, tools, and design mockup</p>
              <div className="rpt-loading-steps">
                <div className="rpt-step-item done">✅ Creating step-by-step plan</div>
                <div className="rpt-step-item done">✅ Selecting tools &amp; materials</div>
                <div className="rpt-step-item active">🎨 Generating design image…</div>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error || !report) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar className="rpt-toolbar">
            <IonButton slot="start" fill="clear" onClick={() => router.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="rpt-content">
          <div className="rpt-error-wrap">
            <IonIcon icon={alertCircleOutline} className="rpt-error-icon" />
            <p>{error ?? 'Report not found'}</p>
            <IonButton onClick={() => router.push('/tabs/diy-advisor')} color="warning">
              Try Again
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { plan } = report;
  const diffColor = DIFFICULTY_COLORS[plan.difficulty] ?? '#6b7280';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="rpt-toolbar">
          <IonButton slot="start" fill="clear" onClick={() => router.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <div className="rpt-toolbar-title">
            <IonIcon icon={hammerOutline} style={{ color: '#f59e0b', fontSize: 18 }} />
            <span>DIY Plan</span>
          </div>
          <IonButton slot="end" fill="clear" className="rpt-pdf-btn" onClick={downloadPDF} title="Download PDF">
            <IonIcon icon={downloadOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="rpt-content">
        <div className="rpt-body">

          {/* ── Title ── */}
          <h1 className="rpt-title">{plan.title}</h1>
          <p className="rpt-problem-desc">{report.problem}</p>

          {/* ── AI Design Mockup — contained card, no clipping ── */}
          {report.designImageUrl ? (
            <div className="rpt-design-card">
              <div className="rpt-design-badge">
                <IonIcon icon={sparklesOutline} />
                AI Design Mockup
              </div>
              <img src={report.designImageUrl} alt="AI design mockup" className="rpt-design-img" />
            </div>
          ) : (
            <div className="rpt-design-placeholder">
              <IonIcon icon={constructOutline} />
              <span>Design mockup unavailable</span>
              {report.imageError && (
                <span className="rpt-design-error">{report.imageError.slice(0, 180)}</span>
              )}
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="rpt-stats-row">
            <div className="rpt-stat">
              <IonIcon icon={timeOutline} />
              <div>
                <span className="rpt-stat-label">Total Time</span>
                <span className="rpt-stat-val">{plan.totalTime}</span>
              </div>
            </div>
            <div className="rpt-stat">
              <IonIcon icon={cashOutline} />
              <div>
                <span className="rpt-stat-label">Est. Cost</span>
                <span className="rpt-stat-val">{plan.totalCost}</span>
              </div>
            </div>
            <div className="rpt-stat">
              <IonIcon icon={hammerOutline} />
              <div>
                <span className="rpt-stat-label">Difficulty</span>
                <span className="rpt-stat-val" style={{ color: diffColor }}>
                  {DIFFICULTY_LABELS[plan.difficulty] ?? plan.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* ── Safety notes ── */}
          {plan.safetyNotes?.length > 0 && (
            <div className="rpt-section rpt-safety">
              <div className="rpt-section-header">
                <IonIcon icon={alertCircleOutline} className="rpt-section-icon safety" />
                <h2 className="rpt-section-title">Safety First</h2>
              </div>
              <ul className="rpt-safety-list">
                {plan.safetyNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Steps ── */}
          <div className="rpt-section">
            <div className="rpt-section-header">
              <IonIcon icon={checkmarkCircleOutline} className="rpt-section-icon steps" />
              <h2 className="rpt-section-title">Step-by-Step Plan</h2>
            </div>
            <div className="rpt-steps-list">
              {plan.steps.map((step: DIYStep) => (
                <div
                  key={step.step}
                  className={`rpt-step-card ${expandedStep === step.step - 1 ? 'expanded' : ''}`}
                  onClick={() => setExpandedStep(expandedStep === step.step - 1 ? null : step.step - 1)}
                >
                  <div className="rpt-step-header">
                    <div className="rpt-step-num">{step.step}</div>
                    <div className="rpt-step-meta">
                      <span className="rpt-step-title">{step.title}</span>
                      <span className="rpt-step-time">⏱ {step.timeMinutes} min</span>
                    </div>
                    <div className="rpt-step-chevron">
                      {expandedStep === step.step - 1 ? '▲' : '▼'}
                    </div>
                  </div>
                  {expandedStep === step.step - 1 && (
                    <div className="rpt-step-body">
                      <p className="rpt-step-desc">{step.description}</p>
                      {step.tip && (
                        <div className="rpt-step-tip">
                          <span>💡 Pro Tip:</span> {step.tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Tools ── */}
          {plan.tools?.length > 0 && (
            <div className="rpt-section">
              <div className="rpt-section-header">
                <IonIcon icon={constructOutline} className="rpt-section-icon tools" />
                <h2 className="rpt-section-title">Tools Needed</h2>
              </div>
              <div className="rpt-items-list">
                {plan.tools.map((tool: DIYTool, i: number) => (
                  <div key={i} className="rpt-item-card">
                    <div className="rpt-item-info">
                      <span className="rpt-item-name">
                        {tool.required ? '🔧' : '⚙️'} {tool.name}
                      </span>
                      <span className="rpt-item-price">{tool.estimatedPrice}</span>
                    </div>
                    <div className="rpt-item-links">
                      <button className="rpt-store-btn hd" onClick={() => openStoreLink(tool.searchQuery, 'homedepot')}>
                        <IonIcon icon={cartOutline} /> Home Depot
                      </button>
                      <button className="rpt-store-btn amazon" onClick={() => openStoreLink(tool.searchQuery, 'amazon')}>
                        <IonIcon icon={cartOutline} /> Amazon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Materials ── */}
          {plan.materials?.length > 0 && (
            <div className="rpt-section">
              <div className="rpt-section-header">
                <IonIcon icon={cartOutline} className="rpt-section-icon materials" />
                <h2 className="rpt-section-title">Materials &amp; Supplies</h2>
              </div>
              <div className="rpt-items-list">
                {plan.materials.map((mat: DIYMaterial, i: number) => (
                  <div key={i} className="rpt-item-card">
                    <div className="rpt-item-info">
                      <span className="rpt-item-name">
                        🪣 {mat.name}
                        <span className="rpt-item-qty"> — {mat.quantity} {mat.unit}</span>
                      </span>
                      <span className="rpt-item-price">{mat.estimatedPrice}</span>
                    </div>
                    <div className="rpt-item-links">
                      <button className="rpt-store-btn hd" onClick={() => openStoreLink(mat.searchQuery, 'homedepot')}>
                        <IonIcon icon={cartOutline} /> Home Depot
                      </button>
                      <button className="rpt-store-btn lowes" onClick={() => openStoreLink(mat.searchQuery, 'lowes')}>
                        <IonIcon icon={cartOutline} /> Lowe's
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Wood Cut List ── */}
          {plan.woodDiagram && plan.woodDiagram.pieces?.length > 0 && (
            <div className="rpt-section rpt-wood-section">
              <div className="rpt-section-header">
                <span style={{ fontSize: 22 }}>🪚</span>
                <h2 className="rpt-section-title">Wood Cut List</h2>
              </div>
              {plan.woodDiagram.overallNotes && (
                <p className="rpt-wood-notes">💡 {plan.woodDiagram.overallNotes}</p>
              )}
              <div className="rpt-cut-grid">
                {plan.woodDiagram.pieces.map((piece, i) => (
                  <div key={i} className="rpt-cut-piece">
                    <span className="rpt-cut-qty-badge">×{piece.quantity}</span>
                    <span className="rpt-cut-label">{piece.label}</span>
                    <span className="rpt-cut-wood-type">{piece.woodType}</span>
                    <div className="rpt-cut-svg-wrap">
                      <CutPieceCard piece={piece} />
                    </div>
                    <div className="rpt-cut-dims">
                      {piece.thicknessIn}&quot; × {piece.widthIn}&quot; × {piece.lengthIn}&quot;
                    </div>
                    {piece.notes && (
                      <div className="rpt-cut-notes">{piece.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Assembly Diagram ── */}
          {plan.woodDiagram && plan.woodDiagram.assemblySteps?.length > 0 && (
            <div className="rpt-section rpt-assembly-section">
              <div className="rpt-section-header">
                <span style={{ fontSize: 22 }}>🔩</span>
                <h2 className="rpt-section-title">Assembly Diagram</h2>
              </div>
              <AssemblyDiagramSection steps={plan.woodDiagram.assemblySteps} />
            </div>
          )}

          {/* ── Download PDF CTA ── */}
          {plan.woodDiagram && (
            <div className="rpt-pdf-cta" onClick={downloadPDF}>
              <IonIcon icon={downloadOutline} />
              <div>
                <span className="rpt-pdf-cta-title">Download Cut List PDF</span>
                <span className="rpt-pdf-cta-sub">Print-ready with all cuts, materials &amp; assembly steps</span>
              </div>
            </div>
          )}

          {/* ── When to hire instead ── */}
          {plan.whenToHireInstead && (
            <div className="rpt-section rpt-hire-cta">
              <div className="rpt-section-header">
                <IonIcon icon={warningOutline} className="rpt-section-icon warn" />
                <h2 className="rpt-section-title">When to Hire a Pro Instead</h2>
              </div>
              <p className="rpt-hire-text">{plan.whenToHireInstead}</p>
              <IonButton
                expand="block"
                className="rpt-hire-btn"
                onClick={() => {
                  const params = new URLSearchParams({ problem: report.problem, zip: report.zipCode });
                  router.push(`/tabs/ai-finder?${params.toString()}`);
                }}
              >
                🔍 Find a Local Pro Instead
              </IonButton>
            </div>
          )}

          <div style={{ height: 40 }} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DIYReportView;
