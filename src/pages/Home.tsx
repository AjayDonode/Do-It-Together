// src/pages/Home.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  useIonRouter,
  IonToast,
} from '@ionic/react';
import { chatbubblesOutline, warning, sparklesOutline } from 'ionicons/icons';
import './Home.css';
import { useHistory } from 'react-router';
import { useAuth } from '../context/AuthContext';
import * as HelperService from '../services/HelperService';
import { Helper } from '../models/Helper';
import ShareModal from '../components/sharemodal/ShareModal';
import HelperScrollRow from '../components/HelperScrollRow/HelperScrollRow';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();
  const router = useIonRouter();

  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [helperToShare, setHelperToShare] = useState<Helper | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const helpList = await HelperService.getHelpers();
        setHelpers(helpList);
      } catch (error) {
        console.error('Error fetching helpers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, []);

  // Top Rated — sorted by rating desc
  const topRated = useMemo(
    () => [...helpers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 15),
    [helpers]
  );

  // Newly Added — last 5 inserted (Firestore order = insertion order by default)
  const newlyAdded = useMemo(() => helpers.slice(0, 5), [helpers]);

  const handleHelperClick = (helper: Helper) => {
    router.push(`/tabs/helper-profile/${helper.id}`);
  };

  const openAIFinder = () => {
    router.push('/tabs/ai-finder');
  };

  const openDIYAdvisor = () => {
    router.push('/tabs/diy-advisor');
  };

  const firstName = currentUser?.displayName?.split(' ')[0] || 'there';

  return (
    <>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle className="ion-text-center" color="primary" style={{ fontWeight: 'bold' }}>
              Do it Together
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          {/* ── Hero ── */}
          <div className="hero-section">
            <h1>Hey {firstName} 👋</h1>
            <p>Find trusted helpers in your neighborhood.</p>
          </div>

          {/* ── AI Banners Row ── */}
          <div className="ai-banners-row">
            {/* Find a Pro */}
            <div className="ai-banner-card pro-card" onClick={openAIFinder}>
              <div className="ai-banner-icon-wrap pro-icon">
                <IonIcon icon={sparklesOutline} />
              </div>
              <div className="ai-banner-body">
                <span className="ai-banner-label">Find a Pro</span>
                <p>Find the perfect local helper.</p>
              </div>
            </div>

            {/* DIY Advisor */}
            <div className="ai-banner-card diy-card" onClick={openDIYAdvisor}>
              <div className="ai-banner-icon-wrap diy-icon">
                <span>🔧</span>
              </div>
              <div className="ai-banner-body">
                <span className="ai-banner-label">DIY Advisor</span>
                <p>Get AI plans &amp; tool lists.</p>
              </div>
            </div>
          </div>

          {/* ── Top Rated ── */}
          <HelperScrollRow
            title="⭐ Top Rated"
            badge="All Stars"
            helpers={topRated}
            onHelperClick={handleHelperClick}
          />

          {/* ── Newly Added ── */}
          <HelperScrollRow
            title="🆕 Newly Added"
            badge="Fresh"
            helpers={newlyAdded}
            onHelperClick={handleHelperClick}
          />

          {/* Spacer for bottom tab bar */}
          <div style={{ height: '80px' }} />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            helper={helperToShare}
          />

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={1000}
            className="custom-toast"
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home;
