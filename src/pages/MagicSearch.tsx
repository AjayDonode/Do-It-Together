import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput,
  useIonRouter,
  IonToast,
  IonText
} from '@ionic/react';
import { 
  arrowForwardOutline, 
  arrowBackOutline, 
  brushOutline, 
  hammerOutline, 
  cubeOutline, 
  leafOutline, 
  waterOutline, 
  flashOutline, 
  colorFillOutline, 
  constructOutline, 
  laptopOutline, 
  carOutline,
  warning
} from 'ionicons/icons';
import './MagicSearch.css';
import * as HelperService from '../services/HelperService';
import StackedCards from '../components/StackedCards/StackedCards';
import { Helper } from '../models/Helper';

const MagicSearch: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [zipcode, setZipcode] = useState('');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const router = useIonRouter();

  const handleZipcodeSubmit = () => {
    if (!zipcode || zipcode.trim() === '') {
      setToastMessage('Please enter a valid zip code.');
      setShowToast(true);
      return;
    }
    setStep(2);
  };

  const handleCategoryClick = async (category: string) => {
    setHasSearched(false);
    const results = await HelperService.searchHelpers(category, zipcode);
    setHelpers(results);
    setHasSearched(true);
    setStep(3);
  };

  const handleHelperClick = (helper: Helper) => {
    router.push(`/tabs/helper-profile/${helper.id}`);
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          {step > 1 && (
            <IonButton slot="start" fill="clear" onClick={goBack}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          )}
          <IonTitle className="ion-text-center" color="primary" style={{ fontWeight: 'bold' }}>
            {step > 1 ? `Searching in ${zipcode}` : 'Magic Search'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding magic-content">
        <div className={`magic-container step-${step}`}>
          {/* STEP 1: ZIPCODE ENTRY */}
          {step === 1 && (
            <div className="zipcode-step fade-in">
              <h1 className="magic-title">Where do you need help?</h1>
              <p className="magic-subtitle">Enter your zip code to get started.</p>
              
              <div className="magic-input-wrapper">
                <IonInput
                  className="magic-zip-input"
                  placeholder="e.g. 90210"
                  type="text"
                  value={zipcode}
                  onIonInput={(e) => setZipcode(e.target.value as string)}
                  onKeyUp={(e) => e.key === 'Enter' && handleZipcodeSubmit()}
                />
                <IonButton className="magic-next-btn" color="primary" onClick={handleZipcodeSubmit}>
                  <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY SELECTION */}
          {step === 2 && (
            <div className="category-step">
              <h1 className="magic-title">What do you need done?</h1>
              <p className="magic-subtitle">Select a category below.</p>
              
              <div className="magic-categories-grid">
                <div className="magic-category-card delay-1" onClick={() => handleCategoryClick('Cleaning')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={brushOutline} className="magic-category-icon" />
                  </div>
                  <span>Cleaning</span>
                </div>
                <div className="magic-category-card delay-2" onClick={() => handleCategoryClick('Handyman')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={hammerOutline} className="magic-category-icon" />
                  </div>
                  <span>Handyman</span>
                </div>
                <div className="magic-category-card delay-3" onClick={() => handleCategoryClick('Moving')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={cubeOutline} className="magic-category-icon" />
                  </div>
                  <span>Moving</span>
                </div>
                <div className="magic-category-card delay-4" onClick={() => handleCategoryClick('Gardening')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={leafOutline} className="magic-category-icon" />
                  </div>
                  <span>Gardening</span>
                </div>
                <div className="magic-category-card delay-5" onClick={() => handleCategoryClick('Plumbing')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={waterOutline} className="magic-category-icon" />
                  </div>
                  <span>Plumbing</span>
                </div>
                <div className="magic-category-card delay-6" onClick={() => handleCategoryClick('Electrical')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={flashOutline} className="magic-category-icon" />
                  </div>
                  <span>Electrical</span>
                </div>
                <div className="magic-category-card delay-7" onClick={() => handleCategoryClick('Painting')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={colorFillOutline} className="magic-category-icon" />
                  </div>
                  <span>Painting</span>
                </div>
                <div className="magic-category-card delay-8" onClick={() => handleCategoryClick('Assembly')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={constructOutline} className="magic-category-icon" />
                  </div>
                  <span>Assembly</span>
                </div>
                <div className="magic-category-card delay-9" onClick={() => handleCategoryClick('Tech Support')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={laptopOutline} className="magic-category-icon" />
                  </div>
                  <span>Tech Support</span>
                </div>
                <div className="magic-category-card delay-10" onClick={() => handleCategoryClick('Delivery')}>
                  <div className="magic-icon-bg">
                    <IonIcon icon={carOutline} className="magic-category-icon" />
                  </div>
                  <span>Delivery</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && (
            <div className="results-step fade-in">
              {hasSearched && helpers.length === 0 ? (
                <div className="no-results-container">
                  <IonIcon icon={warning} className="no-results-icon" />
                  <IonText color="dark" style={{ fontWeight: 'bold', marginTop: '1rem' }}>
                    <p>No helpers found for this category in {zipcode}.</p>
                  </IonText>
                  <IonButton fill="outline" color="primary" onClick={() => setStep(2)} style={{ marginTop: '1rem' }}>
                    Try another category
                  </IonButton>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <StackedCards header="Found Helpers" helpers={helpers} onHelperClick={handleHelperClick} />
                </div>
              )}
            </div>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default MagicSearch;
