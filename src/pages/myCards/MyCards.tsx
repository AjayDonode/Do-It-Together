import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonLabel,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import './MyCards.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { arrowBackOutline } from 'ionicons/icons';

const MyCards: React.FC = () => {
  const { currentUser } = useAuth(); // Access user data from AuthContext

  const history = useHistory(); // React Router's useHistory hook for navigation
  const handleBackToHome = () => {
    history.push('/home'); // Navigate back to the home page
  };

  return (
    <IonPage>
      <IonHeader>
         <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBackToHome}>
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
          </IonButton>
          <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
            My Cards
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="profile-container">
          <IonCard className="profile-card">
          {/* Random Header Image */}
          {/* <img
            src="https://via.placeholder.com/600x50" // Replace with a random header image URL
            alt="Profile Header"
            style={{ width: '100%', height: '50px', objectFit: 'cover' }}
          /> */}
          {/* <IonCardHeader>
            <IonCardTitle style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '24px' }}>
              User Profile
            </IonCardTitle>
          </IonCardHeader> */}

          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="auto">
                  {/* Avatar */}
                  <IonAvatar className="profile-avatar">
                    <img
                      src={currentUser?.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                      alt="User Avatar"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </IonAvatar>
                </IonCol>
                <IonCol>
                  {/* Name and Email */}
                  <IonLabel>
                    <h2 style={{ margin: '0', fontWeight: 'bold' }}>
                      {currentUser?.displayName || 'Guest User'}
                    </h2>
                    <p style={{ margin: '0', color: 'gray' }}>
                      {currentUser?.email || 'No Email Provided'}
                    </p>
                  </IonLabel>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Additional Details */}
            <IonList className="profile-details" style={{ marginTop: '20px' }}>
              <IonItem>
                <IonLabel>
                  <strong>User ID:</strong> {currentUser?.uid || 'Not Available'}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Email Verified:</strong> {currentUser?.emailVerified ? 'Yes' : 'No'}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Account Creation Date:</strong>{' '}
                  {new Date(currentUser?.metadata?.creationTime || '').toLocaleDateString() ||
                    'Not Available'}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Last Sign-In:</strong>{' '}
                  {new Date(currentUser?.metadata?.lastSignInTime || '').toLocaleDateString() ||
                    'Not Available'}
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MyCards;
