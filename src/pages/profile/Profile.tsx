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
  IonSpinner,
} from '@ionic/react';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { arrowBackOutline, createOutline, logOutOutline, camera } from 'ionicons/icons';
import { getAuth, signOut } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
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

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleBackToHome = () => {
    history.push('/home');
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload failed:', error);
          if (type === 'avatar') setUploadingAvatar(false);
          else setUploadingBanner(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const updatedProfile = { ...profileData };
          if (type === 'avatar') {
            updatedProfile.avatarUrl = downloadURL;
            setUploadingAvatar(false);
          } else {
            updatedProfile.bannerUrl = downloadURL;
            setUploadingBanner(false);
          }
          await handleSave(updatedProfile);
        }
      );
    } catch (err) {
      console.error(err);
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBanner(false);
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

  // Determine the display name (Firestore first, then Auth, then fallback)
  const displayName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}`
    : profileData.firstName || currentUser?.displayName || 'Guest User';

  // Determine the best avatar to show
  const getAvatar = () => {
    if (profileData.avatarUrl) return profileData.avatarUrl;
    if (currentUser?.photoURL) return currentUser.photoURL;
    // Generate an initial-based avatar using ui-avatars.com
    const nameForAvatar = profileData.firstName || currentUser?.displayName || 'Guest';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random&color=fff&size=150`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBackToHome}>
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
          </IonButton>
          <IonTitle className="ion-text-left" color="primary" style={{ fontWeight: 'bold' }} >
            Profile
          </IonTitle>
          <IonButton slot="end" fill="clear" color="danger" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="no-padding-content">
        <IonGrid>
          <IonRow>
            {/* Left Section: Profile Card (1/3 on md+, full width on mobile) */}
            <IonCol size="12" size-md="4" >
              <IonCard className="profile-card no-padding-card">
                <div className="banner-avatar-container">
                  <input type="file" id="banner-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'banner')} />
                  <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'avatar')} />

                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      className="modal-banner"
                      src={profileData?.bannerUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80'}
                      alt="Banner"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      onClick={() => document.getElementById('banner-upload')?.click()}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                      {uploadingBanner ? <IonSpinner name="crescent" style={{ width: '20px', height: '20px', color: 'white' }} /> : <IonIcon icon={camera} style={{ color: 'white', fontSize: '20px' }} />}
                    </div>
                  </div>

                  <IonAvatar className="modal-avatar">
                    <img src={getAvatar()} alt="Avatar" referrerPolicy="no-referrer" />
                    <div 
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--ion-color-primary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', zIndex: 10 }}
                    >
                      {uploadingAvatar ? <IonSpinner name="crescent" style={{ width: '16px', height: '16px', color: 'white' }} /> : <IonIcon icon={camera} style={{ color: 'white', fontSize: '14px' }} />}
                    </div>
                  </IonAvatar>
                </div>
                <IonCardContent className="no-padding-card-content" style={{ textAlign: 'center' }}>
                  <div style={{ marginTop: '40px' }}>
                    <IonCardTitle style={{ marginTop: 8 }}>{displayName}</IonCardTitle>
                  </div>
                  <div className="modal-info">
                    <p>Email: {currentUser?.email || 'Not provided'}</p> {/* Added fallback for safety */}
                    <p>Phone Number: {profileData.phoneNumber || 'Not provided'}</p> {/* Added fallback */}
                    <p>Address: {formattedAddress}</p> {/* Now a string – fixes the error */}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
                    <IonButton
                      color="primary"
                      size="small"
                      fill="outline"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <IonIcon icon={createOutline} style={{ marginRight: '4px' }} />
                      Edit Profile
                    </IonButton>
                    <IonButton
                      color="secondary"
                      size="small"
                      fill="outline"
                      onClick={handleOpenJoinPro}
                    >
                      Register as Business
                    </IonButton>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <IonButton fill="clear" color="danger" size="small" onClick={handleLogout}>
                      <IonIcon icon={logOutOutline} slot="start" />
                      Log Out
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
                      <IonCardTitle>Register as Business</IonCardTitle>
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
