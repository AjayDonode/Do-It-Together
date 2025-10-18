// src/pages/Profile.tsx (Updated for responsive two-section layout)
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
  IonGrid, // NEW: For grid layout
  IonRow,  // NEW
  IonCol,   // NEW
} from '@ionic/react';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { arrowBackOutline, createOutline } from 'ionicons/icons';
import UserProfileService from '../../services/UserProfileService';
import EditProfileModal from './EditProfileModal';
import { CustomUserProfile, Address } from '../../models/CustomUserProfile'; // Assuming renamed as per previous fix

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const initialAddress: Address = { street: '', city: '', state: '', zip: '' }; // UPDATED: zip as string to match previous changes
  const initialProfile: CustomUserProfile = { address: initialAddress, phoneNumber: '' };
  const [profileData, setProfileData] = useState<CustomUserProfile>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleBackToHome = () => {
    history.push('/home');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const fetchedProfile = await UserProfileService.getProfile(currentUser.uid) as CustomUserProfile;
        if (fetchedProfile) {
          setProfileData(fetchedProfile);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async (updatedProfile: CustomUserProfile) => {
    if (currentUser?.uid) {
      await UserProfileService.saveProfile(currentUser.uid, updatedProfile);
      setProfileData(updatedProfile);
    } else {
      console.error('User is not authenticated');
    }
  };

  // Format address into a string (this fixes the rendering issue)
  const formattedAddress: string = profileData.address?.street
    ? `${profileData.address.street}, ${profileData.address.city}, ${profileData.address.state} ${profileData.address.zip}`
    : 'Not provided';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBackToHome}>
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
          </IonButton>
          <IonTitle className="ion-text-left" style={{ color: '#ff385c', fontWeight: 'bold' }} >
            Profile
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="no-padding-content">
        <IonGrid>
          <IonRow>
            {/* Left Section: Profile Card (1/3 on md+, full width on mobile) */}
            <IonCol size="12" size-md="4" >
              <IonCard className="profile-card no-padding-card">
                <div className="banner-avatar-container">
                  <img
                    className="modal-banner"
                    src={profileData?.bannerUrl || 'https://www.gravatar.com/avatar?d=mp'}
                    alt="Banner"
                  />
                  <IonAvatar className="modal-avatar">
                    <img src={currentUser?.photoURL || 'https://www.gravatar.com/avatar?d=mp'} alt="Avatar" />
                  </IonAvatar>
                </div>
                <IonCardContent className="no-padding-card-content">
                  <div>
                    <IonCardTitle style={{ marginTop: 8 }}>{currentUser?.displayName || 'Guest User'}</IonCardTitle>
                  </div>
                  <div className="modal-info">
                    <p>Email: {currentUser?.email || 'Not provided'}</p> {/* Added fallback for safety */}
                    <p>Phone Number: {profileData.phoneNumber || 'Not provided'}</p> {/* Added fallback */}
                    <p>Address: {formattedAddress}</p> {/* Now a string – fixes the error */}
                  </div>
                  <IonButton
                    color="primary"
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ marginTop: '16px' }}
                  >
                    <IonIcon icon={createOutline} style={{ marginRight: '8px' }} />
                    Edit Profile
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Right Section: Additional content (2/3 on md+, full width under left on mobile) */}
            <IonCol size="12" size-md="8">
              <IonCard className="right-section-card">
                <IonCardContent>
                  {/* Placeholder content – replace with actual features, e.g., recent activity, settings, etc. */}
                  <IonCardTitle>Additional Profile Information</IonCardTitle>
                  <p>This section can include more details, such as account settings, recent activity, or other user data.</p>
                  {/* Add more components here as needed */}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={currentUser}
          profileData={profileData}
          handleSave={handleSave}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
