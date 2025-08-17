import React, { useState } from 'react';
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
  IonCard,
  IonImg,
  IonCardContent,
  IonAvatar,
  IonMenuToggle,
  IonMenuButton,
} from '@ionic/react';
import { locationOutline, calendarOutline, personOutline, personCircleOutline } from 'ionicons/icons';
import './Home.css';
import { useHistory } from 'react-router';
import ModalHelperDetails from './modals/ModalHelperDetails';
import { useAuth } from '../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

const Home: React.FC = () => {
  const { currentUser } = useAuth(); // Access user data from AuthContext
  const history = useHistory();

  const [selectedHelper, setSelectedHelper] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const helpers = [...Array(8)].map((_, i) => ({
    id: i,
    name: `Helper Name ${i + 1}`,
    avatar: `https://i.pravatar.cc/100?img=${i + 10}`,
    banner: `https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80`,
    info: "This is some detailed info about the helper. They are experienced and friendly!",
    reviews: [
      { user: "Alice", comment: "Very helpful!", rating: 5 },
      { user: "Bob", comment: "Would recommend.", rating: 4 },
    ],
  }));

  const navigateToPage = (link: string): void => {
    history.push('/' + link);
  };

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth); // Clears the user session
      navigateToPage('login'); // Redirects to the login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      {/* IonMenu Component */}
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
                  <div className="menu-follow-info">
                    <div className="menu-follow-item">
                      <label className="menu-follow-label">Following</label>
                      <span className="menu-follow-count">1553</span>
                    </div>
                    <div className="menu-follow-item">
                      <label className="menu-follow-label">Followers</label>
                      <span className="menu-follow-count">537</span>
                    </div>
                  </div>
                </div>
                
              </>
            ) : (
              <>
                <IonItem>
                  <IonAvatar slot="start">
                    <img src="https://www.gravatar.com/avatar?d=mp" alt="Guest Avatar" />
                  </IonAvatar>
                  <IonLabel className="menu-welcome">Welcome, Guest!</IonLabel>
                </IonItem>
              </>
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {currentUser ? (
              <>
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
              </>
            ) : (
              <>
                <IonItem>
                  <IonAvatar slot="start">
                    <img src="https://www.gravatar.com/avatar?d=mp" alt="Guest Avatar" />
                  </IonAvatar>
                  <IonLabel>Welcome, Guest!</IonLabel>
                </IonItem>
                <IonMenuToggle autoHide={false}>
                  <IonItem button onClick={() => navigateToPage('login')}>
                    <IonLabel>Login</IonLabel>
                  </IonItem>
                  <IonItem button onClick={() => navigateToPage('register')}>
                    <IonLabel>Sign Up</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </>
            )}
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Main Content */}
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            {/* Add Menu Button */}
            <IonMenuButton slot="start" />
            <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
              Do it To
            </IonTitle>
            {/* Display button if user is not logged in */}
            {!currentUser && (
              <div slot="end" className="header-buttons">
                <IonButton
                  className="offer-help-button"
                  shape="round"
                  fill="outline"
                  color="dark"
                  onClick={() => navigateToPage('register')}
                >
                  Sign in
                </IonButton>
              </div>
            )}

          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding">
          <div className="hero-section">
            <h1>What are you planning to finish ?</h1>
            <p>Lets search people who can help</p>
          </div>

          <div className="search-container">
            <IonGrid className="search-grid">
              <IonRow className="search-row">
                <IonCol size="12" className="search-col">
                  <div className="search-field">
                    <IonIcon icon={personOutline} className="search-icon" />
                    <IonSearchbar
                      placeholder="Write us about your project, expected timings with your zipcode"
                      className="custom-searchbar extended-searchbar"
                    />
                    <IonButton color="danger" className="search-button">
                      Search
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>


          <div className="card-section">
            <h2>Popular Helpers</h2>
            <div className="helper-grid">
              {helpers.map((helper) => (
                <IonCard
                  className="helper-card"
                  key={helper.id}
                  button
                  onClick={() => {
                    setSelectedHelper(helper);
                    setIsModalOpen(true);
                  }}
                >
                  <IonImg src={helper.avatar} alt="Helper" className="card-img" />
                  <IonCardContent className="card-body">
                    <h3>{helper.name}</h3>
                    <p>{helper.info.slice(0, 40)}...</p>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </div>

          <ModalHelperDetails
            isOpen={isModalOpen}
            onDidDismiss={() => setIsModalOpen(false)}
            helper={selectedHelper}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home;
