// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonMenu,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonMenuToggle,
  IonMenuButton,
  IonInput,
  useIonRouter,
  IonToast,
  IonText,
} from '@ionic/react';
import { pin, warning, search, brushOutline, hammerOutline, cubeOutline, leafOutline, waterOutline, flashOutline, colorFillOutline, constructOutline, laptopOutline, carOutline } from 'ionicons/icons';
import './Home.css';
import { useHistory } from 'react-router';
import ModalHelperDetails from './modals/ModalHelperDetails';
import { useAuth } from '../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import * as HelperService from '../services/HelperService'; // Import your HelperService
import StackedCards from '../components/StackedCards/StackedCards';
import { Helper } from '../models/Helper';
import ShareModal from '../components/sharemodal/ShareModal';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();
  // const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpers, setHelpers] = useState<Helper[]>([]);

  const [searchString, setSearchString] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [helperToShare, setHelperToShare] = useState<Helper | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [flashError, setFlashError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);



  const router = useIonRouter();
  const handleSearch = async (searchString: string, zipcode: string) => {
    if (!zipcode) {
      setFlashError(true);
      setTimeout(() => setFlashError(false), 4000);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // You would typically use a reverse geocoding service to get the zipcode from lat/lng
            // For this example, we'll just show a message and focus the input
            setToastMessage('Please enter your zipcode.');
            setShowToast(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            setToastMessage('Could not access your location. Please enter your zipcode manually.');
            setShowToast(true);
          }
        );
      } else {
        setToastMessage('Geolocation is not supported. Please enter your zipcode.');
        setShowToast(true);
      }
      return;
    }
    setHasSearched(true);
    console.log('Looking for %s in area %s', searchString, zipcode);
    const results = await HelperService.searchHelpers(searchString, zipcode);
    setHelpers(results);
  };

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const helpList = await HelperService.getHelpers();
        setHelpers(helpList);
      } catch (error) {
        console.error('Error fetching helpers:', error);
      }
    };
    fetchHelpers();
  }, []);

  const navigateToPage = (link: string): void => {
    history.push('/' + link);
  };

  const handleHelperClick = (helper: Helper) => {
    console.log('Clicked helper:', helper);
    // setSelectedHelper(helper);
    // setIsModalOpen(true);
    console.log("Id is "+helper.id);
    router.push(`/helper-profile/${helper.id}`);
        
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigateToPage('login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


const handleShareClick = (helper: Helper) => {
  setHelperToShare(helper);
  setIsShareModalOpen(true);
};

  return (
    <>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle className="ion-text-center" color="primary" style={{ fontWeight: 'bold' }}>
              Do it To
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding">
          <div className="hero-section">
            <h1>What are you planning to finish?</h1>
            <p>Let's search people who can help</p>
          </div>

          <div className={`search-container ${flashError ? 'flash-error' : ''}`}>
            <IonGrid className="search-grid">
              <IonRow className="search-row">
                <IonCol size="12" className="search-col">
                  <div className="search-field search-bar">
                    <div className="search-bar-input">
                      <IonIcon icon={search} className="search-input-icon" />
                      <IonInput
                        placeholder="What are you looking for?"
                        className="search-text-input"
                        value={searchString}
                        onIonInput={(e) => setSearchString(e.detail.value as string || '')}
                      />
                    </div>

                    <div className="search-divider" />

                    <div className="search-bar-location">
                      <IonIcon icon={pin} className="location-icon" />
                      <IonInput
                        placeholder="City or Zip code"
                        className="location-input"
                        value={zipcode}
                        onIonInput={(e) => setZipcode(String(e.target.value))}
                      />
                    </div>

                    <IonButton
                      color="danger"
                      className="search-button"
                      onClick={() => handleSearch(searchString, zipcode)}
                    >
                      Go
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
          
          <div className="categories-container">
            <h2 className="categories-title">Browse Categories</h2>
            <div className="categories-grid">
              <div className="category-card" onClick={() => handleSearch('Cleaning', zipcode)}>
                <IonIcon icon={brushOutline} className="category-icon" />
                <span>Cleaning</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Handyman', zipcode)}>
                <IonIcon icon={hammerOutline} className="category-icon" />
                <span>Handyman</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Moving', zipcode)}>
                <IonIcon icon={cubeOutline} className="category-icon" />
                <span>Moving</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Gardening', zipcode)}>
                <IonIcon icon={leafOutline} className="category-icon" />
                <span>Gardening</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Plumbing', zipcode)}>
                <IonIcon icon={waterOutline} className="category-icon" />
                <span>Plumbing</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Electrical', zipcode)}>
                <IonIcon icon={flashOutline} className="category-icon" />
                <span>Electrical</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Painting', zipcode)}>
                <IonIcon icon={colorFillOutline} className="category-icon" />
                <span>Painting</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Assembly', zipcode)}>
                <IonIcon icon={constructOutline} className="category-icon" />
                <span>Assembly</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Tech Support', zipcode)}>
                <IonIcon icon={laptopOutline} className="category-icon" />
                <span>Tech Support</span>
              </div>
              <div className="category-card" onClick={() => handleSearch('Delivery', zipcode)}>
                <IonIcon icon={carOutline} className="category-icon" />
                <span>Delivery</span>
              </div>
            </div>
          </div>
          
          <div>
            {hasSearched && helpers.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <IonIcon icon={warning} style={{ fontSize: '3rem', color: 'orange' }} />
                <IonText style={{ fontWeight: 'bold', marginTop: '1rem' }}>
                  <p>No helpers found for your query.</p>
                </IonText>
              </div>
            ) : (
              <StackedCards header="Featured Helpers" helpers={helpers} onHelperClick={handleHelperClick} />
            )}
          </div>

          {/* <ModalHelperDetails
            isOpen={isModalOpen}
            onDidDismiss={() => setIsModalOpen(false)}
            helper={selectedHelper} 
            
/> */}
<ShareModal
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  helper={helperToShare}/>
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
