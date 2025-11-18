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
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/react';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { arrowBackOutline, createOutline } from 'ionicons/icons';
import UserProfileService from '../../services/UserProfileService';
import EditProfileModal from './EditProfileModal';
import { UserProfile, Address } from '../../models/UserProfile'; // Assuming renamed as per previous fix

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const initialAddress: Address = { street: '', city: '', state: '', zip: '' }; // UPDATED: zip as string to match previous changes
  const initialProfile: UserProfile = {
    address: initialAddress, phoneNumber: '',
    uid: '',
    createdAt: new Date,
    role: 'regular'
  };
  const [profileData, setProfileData] = useState<UserProfile>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJoinProOpen, setIsJoinProOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [url, setUrl] = useState('');

  const handleBackToHome = () => {
    history.push('/home');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const fetchedProfile = await UserProfileService.getProfile(currentUser.uid) as UserProfile;
        if (fetchedProfile) {
          setProfileData(fetchedProfile);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async (updatedProfile: UserProfile) => {
    if (currentUser?.uid) {
      await UserProfileService.saveProfile(currentUser.uid, updatedProfile);
      setProfileData(updatedProfile);
    } else {
      console.error('User is not authenticated');
    }
  };

  const handleOpenJoinPro = () => {
    // setIsJoinProOpen(true);
    // setTimeout(() => setAnimationClass('slide-in'), 0);
    history.push('/join-pro')
  };

  const handleCloseJoinPro = () => {
    setAnimationClass('slide-out');
    setTimeout(() => {
      setIsJoinProOpen(false);
      setAnimationClass('');
      // Reset form fields if needed
      setCompanyName('');
      setContactNumber('');
      setProEmail('');
      setUrl('');
    }, 300);
  };

  const handleSavePro = () => {
    // TODO: Implement save logic (e.g., API call to save pro details)
    console.log('Saving Pro details:', { companyName, contactNumber, proEmail, url });
    handleCloseJoinPro();
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
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <IonButton
                      color="primary"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <IonIcon icon={createOutline} style={{ marginRight: '8px' }} />
                      Edit Profile
                    </IonButton>
                    <IonButton
                      color="secondary"
                      onClick={handleOpenJoinPro}
                      style={{ marginLeft: '8px' }}
                    >
                      Join Pro
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Right Section: Additional content (2/3 on md+, full width under left on mobile) */}
            <IonCol size="12" size-md="8">
              <IonCard className="right-section-card">
                <IonCardContent>
                  {!isJoinProOpen ? (
                    <>
                      {/* Placeholder content – replace with actual features, e.g., recent activity, settings, etc. */}
                      <IonCardTitle>Additional Profile Information</IonCardTitle>
                      <p>This section can include more details, such as account settings, recent activity, or other user data.</p>
                      {/* Add more components here as needed */}
                    </>
                  ) : (
                    <div className={`join-pro-form ${animationClass}`}>
                      <IonCardTitle>Join Pro</IonCardTitle>
                      <IonItem>
                        <IonLabel position="floating">Company Name</IonLabel>
                        <IonInput
                          value={companyName}
                          onIonChange={(e) => setCompanyName(e.detail.value!)}
                        ></IonInput>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Contact Number</IonLabel>
                        <IonInput
                          type="tel"
                          value={contactNumber}
                          onIonChange={(e) => setContactNumber(e.detail.value!)}
                        ></IonInput>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Email</IonLabel>
                        <IonInput
                          type="email"
                          value={proEmail}
                          onIonChange={(e) => setProEmail(e.detail.value!)}
                        ></IonInput>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">URL</IonLabel>
                        <IonInput
                          type="url"
                          value={url}
                          onIonChange={(e) => setUrl(e.detail.value!)}
                        ></IonInput>
                      </IonItem>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <IonButton color="primary" onClick={handleSavePro}>Save</IonButton>
                        <IonButton onClick={handleCloseJoinPro} fill="clear">Cancel</IonButton>
                      </div>
                    </div>
                  )}
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
