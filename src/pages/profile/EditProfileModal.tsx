// src/components/EditProfileModal.tsx (Updated with improved autocomplete dropdown for state)
import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonRow,
  IonCol,
  IonGrid,
  IonFooter,
  IonText, // For displaying error messages
  IonList,
  IonIcon, // For state suggestions dropdown
} from '@ionic/react';
import { User } from 'firebase/auth'; // Import Firebase User type
import { CustomUserProfile, Address } from '../../models/CustomUserProfile'; // Your custom types (NOTE: Update Address to have zip as string if possible)
import { usStates } from '../../common/AppConstant'; // Moved to common constants file
import './EditProfileModal.css';
import { closeOutline } from 'ionicons/icons';
import { arrowBackOutline, createOutline } from 'ionicons/icons';

// Updated Props Interface: Make currentUser nullable
export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  profileData: CustomUserProfile;
  handleSave: (updatedProfile: CustomUserProfile) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profileData,
  handleSave,
}) => {
  // State for editable fields (initialize from profileData)
  const [address, setAddress] = useState<Address>(profileData.address || { street: '', city: '', state: '', zip: '' }); // CHANGED: zip to string (update model if needed)
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber || '');

  // State for validation errors (added state error)
  const [errors, setErrors] = useState<{ phoneNumber?: string; zip?: string; state?: string }>({});

  // States for autocomplete
  const [stateQuery, setStateQuery] = useState(profileData.address?.state || '');
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false); // NEW: Control dropdown visibility

  // Use useEffect to sync state whenever profileData changes (e.g., on modal load or prop updates)
  useEffect(() => {
    setAddress(profileData.address || { street: '', city: '', state: '', zip: '' });
    setPhoneNumber(profileData.phoneNumber || '');
    setStateQuery(profileData.address?.state || '');
    setFilteredStates([]);
    setShowDropdown(false);
    setErrors({}); // Clear errors on load
  }, [profileData]);

  // Non-editable values
  const username = currentUser?.displayName || 'Guest User';
  const userEmail = currentUser?.email || 'Not provided';

  // Validation functions (added state validation)
  const validatePhoneNumber = (value: string): string | undefined => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; // Enforces format like 888-888-8888
    if (!value) return 'Phone number is required';
    if (!phoneRegex.test(value)) return 'Invalid phone number format (use 888-888-8888)';
    return undefined;
  };

  const validateZip = (value: string): string | undefined => {
    const zipRegex = /^\d{5}$/; // 5 digits only
    if (!value) return 'Zip code is required';
    if (!zipRegex.test(value)) return 'Invalid zip code (must be 5 digits)';
    return undefined;
  };

  const validateState = (value: string): string | undefined => {
    if (!value) return 'State is required';
    if (!usStates.includes(value.toUpperCase())) return 'Invalid state (must be a valid US state abbreviation)';
    return undefined;
  };

  // Handle save with validation (added state validation)
  const onSave = async () => {
    const phoneError = validatePhoneNumber(phoneNumber);
    const zipError = validateZip(address.zip.toString()); // Convert to string for validation
    const stateError = validateState(address.state);

    if (phoneError || zipError || stateError) {
      setErrors({ phoneNumber: phoneError, zip: zipError, state: stateError });
      return; // Don't save if there are errors
    }

    const updatedProfile: CustomUserProfile = {
      address: { ...address, zip: address.zip }, // If model expects number, convert back: Number(address.zip)
      phoneNumber,
    };
    await handleSave(updatedProfile);
    onClose();
  };

  // Handle state input change for autocomplete
  const handleStateChange = (query: string) => {
    setStateQuery(query);
    const upperQuery = query.toUpperCase();
    if (upperQuery) {
      const matches = usStates.filter((state) => state.startsWith(upperQuery)).slice(0, 5); // Limit to top 5 suggestions
      setFilteredStates(matches);
      setShowDropdown(matches.length > 0); // Show dropdown if there are matches
    } else {
      setFilteredStates([]);
      setShowDropdown(false);
    }
    setErrors((prev) => ({ ...prev, state: undefined })); // Clear error on change
  };

  // Handle selecting a state from dropdown
  const selectState = (selectedState: string) => {
    setStateQuery(selectedState);
    setAddress({ ...address, state: selectedState });
    setFilteredStates([]);
    setShowDropdown(false);
  };

  // Handle focus to show full list if no query
  const handleStateFocus = () => {
    if (!stateQuery) {
      setFilteredStates(usStates.slice(0, 10)); // Show top 10 states or all if preferred
      setShowDropdown(true);
    }
  };

  // Handle blur for state (validate and hide dropdown)
  const handleStateBlur = () => {
    setTimeout(() => { // Delay to allow click on suggestion
      const upperQuery = stateQuery.toUpperCase();
      if (usStates.includes(upperQuery)) {
        setAddress({ ...address, state: upperQuery });
        setStateQuery(upperQuery);
        setErrors((prev) => ({ ...prev, state: undefined }));
      } else if (stateQuery) {
        setErrors((prev) => ({ ...prev, state: 'Invalid state (select from dropdown or enter valid abbreviation)' }));
      }
      setShowDropdown(false);
    }, 200); // Short delay for click handling
  };

  // Null guard: If no currentUser, show a message (with button in IonFooter for consistency)
  if (!currentUser) {
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            
            <IonTitle>Edit Profile</IonTitle>
            <IonButton slot="start" fill="clear" onClick={onClose} >
                        <IonIcon icon={closeOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
                      </IonButton>
          </IonToolbar>
          
        </IonHeader>
        <IonContent> 
          <p style={{ textAlign: 'center', margin: '20px' }}>Please log in to edit your profile.</p>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <IonButton expand="block" onClick={onClose}>Close</IonButton>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    );
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-text-left" style={{ color: '#ff385c', fontWeight: 'bold' }} >Edit Profile</IonTitle>
          <IonButton slot="end" fill="clear" onClick={onClose}>
                        <IonIcon icon={closeOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
                      </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="no-padding-content">
        {/* Non-editable Username */}
        <IonItem>
          <IonLabel position="floating">Username</IonLabel>
          <IonInput value={username} disabled className="form-input" />
        </IonItem>

        {/* Non-editable User Email (only one email field) */}
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput value={userEmail} disabled className="form-input" />
        </IonItem>

        {/* Phone Number */}
        <IonItem>
          <IonLabel position="floating">Phone Number</IonLabel>
          <IonInput
            type="tel"
            placeholder="888-888-8888"
            value={phoneNumber}
            onIonChange={(e) => {
              setPhoneNumber(e.detail.value!);
              setErrors((prev) => ({ ...prev, phoneNumber: undefined })); // Clear error on change
            }}
            className="form-input"
          />
        </IonItem>
        {errors.phoneNumber && <IonText color="danger" style={{ paddingLeft: '16px', fontSize: 'small' }}>{errors.phoneNumber}</IonText>}

        {/* Address fields: Separate inputs */}
        <IonItem>
          <IonLabel position="floating">Street</IonLabel>
          <IonInput
            value={address.street}
            onIonChange={(e) => setAddress({ ...address, street: e.detail.value! })}
            placeholder="Enter street address"
            className="form-input"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">City</IonLabel>
          <IonInput
            value={address.city}
            onIonChange={(e) => setAddress({ ...address, city: e.detail.value! })}
            placeholder="Enter city"
            className="form-input"
          />
        </IonItem>

        {/* State (autocomplete input with dropdown) and Zip (same line) */}
        <IonRow>
          <IonCol size="6" style={{ position: 'relative' }}> {/* Relative positioning for dropdown */}
            <IonItem>
              <IonLabel position="floating">State</IonLabel>
              <IonInput
                value={stateQuery}
                onIonChange={(e) => handleStateChange(e.detail.value!)}
                onIonFocus={handleStateFocus}
                onIonBlur={handleStateBlur} // Validate and hide on blur
                placeholder="Enter state (e.g., CA)"
                className="form-input"
                maxlength={2} // Limit to 2 characters for abbreviations
              />
            </IonItem>
            {showDropdown && (
              <IonList style={{ 
                position: 'absolute', 
                zIndex: 10, 
                background: 'white', 
                border: '1px solid #ccc', 
                maxHeight: '200px', 
                overflowY: 'auto', 
                width: '100%' 
              }}>
                {filteredStates.map((state) => (
                  <IonItem key={state} button onClick={() => selectState(state)}>
                    {state}
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCol>
          <IonCol size="6">
            <IonItem>
              <IonLabel position="floating">Zip Code</IonLabel>
              <IonInput
                type="tel" // CHANGED: To tel for numeric keyboard without spinners
                value={address.zip}
                onIonChange={(e) => {
                  setAddress({ ...address, zip: e.detail.value! });
                  setErrors((prev) => ({ ...prev, zip: undefined })); // Clear error on change
                }}
                placeholder="Enter zip code"
                className="form-input"
                maxlength={5} // Limit to 5 characters
              />
            </IonItem>
          </IonCol>
        </IonRow>
        {errors.state && <IonText color="danger" style={{ paddingLeft: '16px', fontSize: 'small' }}>{errors.state}</IonText>}
        {errors.zip && <IonText color="danger" style={{ paddingLeft: '16px', fontSize: 'small' }}>{errors.zip}</IonText>}
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton expand="block" color="success" onClick={onSave}>
                  Save
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="block" color="danger" onClick={onClose}>
                  Cancel
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default EditProfileModal;
