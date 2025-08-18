import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { arrowBackOutline, createOutline } from 'ionicons/icons';
import UserProfileService from '../../services/UserProfileService';
import EditProfileModal from './EditProfileModal';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleBackToHome = () => {
    history.push('/home');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const profileData = await UserProfileService.getProfile(currentUser.uid);
        if (profileData) {
          setAddress(profileData.address || '');
          setPhoneNumber(profileData.phoneNumber || '');
        }
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (currentUser?.uid) {
      const profileData = { address, phoneNumber };
      await UserProfileService.saveProfile(currentUser.uid, profileData); // Save to Firestore
      setIsEditModalOpen(false);
    } else {
      console.error('User is not authenticated');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBackToHome}>
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
          </IonButton>
          <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
            Profile
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="no-padding-content">
        <IonCard className="no-padding-card">
          <div className="banner-avatar-container">
            <img
              className="modal-banner"
              src={currentUser?.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
              alt="Banner"
            />
            <IonAvatar className="modal-avatar">
              <img src={currentUser?.photoURL || 'https://www.gravatar.com/avatar?d=mp'} alt="Avatar" />
            </IonAvatar>
          </div>
          <IonCardContent className="no-padding-card-content">
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <IonCardTitle style={{ marginTop: 8 }}>{currentUser?.displayName || 'Guest User'}</IonCardTitle>
            </div>
            <div className="modal-info">
              <p>{currentUser?.email}</p>
              <p>Address: {address || 'Not provided'}</p>
              <p>Phone Number: {phoneNumber || 'Not provided'}</p>
            </div>
            <IonButton
              expand="block"
              color="primary"
              onClick={() => setIsEditModalOpen(true)}
              style={{ marginTop: '16px' }}
            >
              <IonIcon icon={createOutline} style={{ marginRight: '8px' }} />
              Edit Profile
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Import and Use EditProfileModal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          address={address}
          phoneNumber={phoneNumber}
          setAddress={setAddress}
          setPhoneNumber={setPhoneNumber}
          handleSave={handleSave}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
