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
  constructOutline, sparklesOutline, warningOutline,
} from 'ionicons/icons';
import { DIYReport, DIYStep, DIYTool, DIYMaterial } from '../../models/DIYReport';
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

        if (!r) {
          setError('Report not found.');
          setLoading(false);
          return;
        }

        setReport(r);

        if (r.status === 'generating') {
          // Poll every 3s until complete
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
        if (isMounted) {
          setError(err?.message ?? 'Failed to load report.');
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [reportId]);

  const openStoreLink = (searchQuery: string, store: 'homedepot' | 'lowes' | 'amazon') => {
    const urls: Record<string, string> = {
      homedepot: `https://www.homedepot.com/s/${encodeURIComponent(searchQuery)}`,
      lowes: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(searchQuery)}`,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`,
    };
    window.open(urls[store], '_blank', 'noopener');
  };

  // ─── Loading / error states ───
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
                <div className="rpt-step-item done">✅ Selecting tools & materials</div>
                <div className="rpt-step-item active">🎨 Generating design image…</div>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
        </IonToolbar>
      </IonHeader>

      <IonContent className="rpt-content">
        {/* ── Hero: design image ── */}
        {report.designImageUrl ? (
          <div className="rpt-hero-image-wrap">
            <img src={report.designImageUrl} alt="AI design mockup" className="rpt-hero-image" />
            <div className="rpt-hero-badge">
              <IonIcon icon={sparklesOutline} />
              AI Design Mockup
            </div>
          </div>
        ) : (
          <div className="rpt-hero-placeholder">
            <IonIcon icon={constructOutline} />
            <span>Design mockup unavailable</span>
          </div>
        )}

        <div className="rpt-body">
          {/* ── Title & stats ── */}
          <h1 className="rpt-title">{plan.title}</h1>
          <p className="rpt-problem-desc">{report.problem}</p>

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
                      <button
                        className="rpt-store-btn hd"
                        onClick={() => openStoreLink(tool.searchQuery, 'homedepot')}
                      >
                        <IonIcon icon={cartOutline} /> Home Depot
                      </button>
                      <button
                        className="rpt-store-btn amazon"
                        onClick={() => openStoreLink(tool.searchQuery, 'amazon')}
                      >
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
                <h2 className="rpt-section-title">Materials & Supplies</h2>
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
                      <button
                        className="rpt-store-btn hd"
                        onClick={() => openStoreLink(mat.searchQuery, 'homedepot')}
                      >
                        <IonIcon icon={cartOutline} /> Home Depot
                      </button>
                      <button
                        className="rpt-store-btn lowes"
                        onClick={() => openStoreLink(mat.searchQuery, 'lowes')}
                      >
                        <IonIcon icon={cartOutline} /> Lowe's
                      </button>
                    </div>
                  </div>
                ))}
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
                onClick={() => router.push('/tabs/ai-finder')}
              >
                🔍 Find a Local Pro Instead
              </IonButton>
            </div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: 32 }} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DIYReportView;
