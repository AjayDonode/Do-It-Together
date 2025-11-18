// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
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
import { pin, warning } from 'ionicons/icons';
import './Home.css';
import { useHistory } from 'react-router';
import ModalHelperDetails from './modals/ModalHelperDetails';
import { useAuth } from '../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import HelperService from '../services/HelperService'; // Import your HelperService
import HelperSwiper from '../components/HelperSwiper/HelperSwiper';
import { Helper } from '../models/Helper';
import ShareModal from '../components/sharemodal/ShareModal';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();
  const helperService = new HelperService();
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
    const results = await helperService.searchHelpers(searchString, zipcode);
    setHelpers(results);
  };

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const helpList = await helperService.getHelpers();
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
      <IonMenu contentId="main-content" side="start">
        <IonHeader>
          <IonToolbar className="menu-header">
            {currentUser ? (
              <>
                <IonAvatar slot="start">
                  <img
                    src={currentUser.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                    alt="User Avatar"
                  />
                </IonAvatar>
                <div className="menu-user-info">
                  <IonLabel className="menu-welcome">
                    {currentUser.displayName || currentUser.email}
                  </IonLabel>
                  <IonLabel className="menu-email">
                    {currentUser.email}
                  </IonLabel>
                </div>
              </>
            ) : (
              <IonItem>
                <IonAvatar slot="start">
                  <img src="https://www.gravatar.com/avatar?d=mp" alt="Guest Avatar" />
                </IonAvatar>
                <IonLabel className="menu-welcome">Welcome, Guest!</IonLabel>
              </IonItem>
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {currentUser ? (
              <IonMenuToggle autoHide={false}>
                <IonItem button onClick={() => navigateToPage('mycards')}>
                  <IonLabel>My Cards</IonLabel>
                </IonItem>
                <IonItem button onClick={() => navigateToPage('profile')}>
                  <IonLabel>Profile</IonLabel>
                </IonItem>
                <IonItem button onClick={() => navigateToPage('settings')}>
                  <IonLabel>Settings</IonLabel>
                </IonItem>
                <IonItem button onClick={handleLogout}>
                  <IonLabel>Logout</IonLabel>
                </IonItem>
              </IonMenuToggle>
            ) : (
              <IonMenuToggle autoHide={false}>
                <IonItem button onClick={() => navigateToPage('login')}>
                  <IonLabel>Login</IonLabel>
                </IonItem>
                <IonItem button onClick={() => navigateToPage('register')}>
                  <IonLabel>Sign Up</IonLabel>
                </IonItem>
              </IonMenuToggle>
            )}
          </IonList>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
            <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
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
                  <div className="search-field">
                    <IonSearchbar
                      placeholder="Describe your project"
                      className="custom-searchbar"
                      value={searchString}
                      onIonInput={(e) => setSearchString(e.target.value || '')}
                    />
                    <div className="zipcode-container">
                      <IonIcon icon={pin} className="zipcode-icon" />
                      <IonInput
                        placeholder="Zipcode"
                        className="zipcode-input"
                        value={zipcode}
                        onIonInput={(e) => setZipcode(String(e.target.value))} // Default to empty string
                        required
                      />
                    </div>
                   
                  </div>
                  <div> <IonButton
                      color="danger"
                      className="search-button"
                      onClick={() => handleSearch(searchString, zipcode)}
                    >
                      Search
                    </IonButton></div>
                </IonCol>
              </IonRow>
            </IonGrid>
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
              <HelperSwiper header="Featured Helpers" helpers={helpers} onHelperClick={handleHelperClick} />
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
