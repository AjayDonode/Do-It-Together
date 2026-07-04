import React, { useState, useEffect } from 'react';
import { IonModal } from '@ionic/react';
import { User } from 'firebase/auth';
import { UserProfile, Address } from '../../models/UserProfile';
import { usStates } from '../../common/AppConstant';
import './EditProfileModal.css';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  profileData: UserProfile;
  handleSave: (updatedProfile: UserProfile) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profileData,
  handleSave,
}) => {
  const [address, setAddress] = useState<Address>(
    profileData.address || { street: '', city: '', state: '', zip: '' }
  );
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber || '');
  const [errors, setErrors] = useState<{ phoneNumber?: string; zip?: string; state?: string }>({});

  const [stateQuery, setStateQuery] = useState(profileData.address?.state || '');
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setAddress(profileData.address || { street: '', city: '', state: '', zip: '' });
    setPhoneNumber(profileData.phoneNumber || '');
    setStateQuery(profileData.address?.state || '');
    setFilteredStates([]);
    setShowDropdown(false);
    setErrors({});
  }, [profileData]);

  const username = currentUser?.displayName || 'Guest User';
  const userEmail = currentUser?.email || 'Not provided';

  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!value) return 'Phone number is required';
    if (!phoneRegex.test(value)) return 'Use format 888-888-8888';
    return undefined;
  };

  const validateZip = (value: string) => {
    const zipRegex = /^\d{5}$/;
    if (!value) return 'Zip code is required';
    if (!zipRegex.test(value)) return 'Must be 5 digits';
    return undefined;
  };

  const validateState = (value: string) => {
    if (!value) return 'State is required';
    if (!usStates.includes(value.toUpperCase())) return 'Enter a valid US state (e.g. CA)';
    return undefined;
  };

  const onSave = async () => {
    const phoneError = validatePhoneNumber(phoneNumber);
    const zipError = validateZip(address.zip.toString());
    const stateError = validateState(address.state);

    if (phoneError || zipError || stateError) {
      setErrors({ phoneNumber: phoneError, zip: zipError, state: stateError });
      return;
    }

    const updatedProfile: UserProfile = {
      ...profileData,
      address: { ...address, zip: address.zip },
      phoneNumber,
    };
    await handleSave(updatedProfile);
    onClose();
  };

  const handleStateChange = (query: string) => {
    setStateQuery(query);
    const upperQuery = query.toUpperCase();
    if (upperQuery) {
      const matches = usStates.filter((s) => s.startsWith(upperQuery)).slice(0, 6);
      setFilteredStates(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setFilteredStates([]);
      setShowDropdown(false);
    }
    setErrors((prev) => ({ ...prev, state: undefined }));
  };

  const selectState = (selectedState: string) => {
    setStateQuery(selectedState);
    setAddress({ ...address, state: selectedState });
    setFilteredStates([]);
    setShowDropdown(false);
  };

  const handleStateFocus = () => {
    if (!stateQuery) {
      setFilteredStates(usStates.slice(0, 8));
      setShowDropdown(true);
    }
  };

  const handleStateBlur = () => {
    setTimeout(() => {
      const upperQuery = stateQuery.toUpperCase();
      if (usStates.includes(upperQuery)) {
        setAddress({ ...address, state: upperQuery });
        setStateQuery(upperQuery);
        setErrors((prev) => ({ ...prev, state: undefined }));
      } else if (stateQuery) {
        setErrors((prev) => ({ ...prev, state: 'Enter a valid US state (e.g. CA)' }));
      }
      setShowDropdown(false);
    }, 200);
  };

  if (!currentUser) {
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="edit-profile-modal">
        <div className="ep-sheet">
          <div className="ep-header">
            <p className="ep-header-title">Edit Profile</p>
            <button className="ep-close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="ep-body">
            <p style={{ textAlign: 'center', color: '#666', margin: '24px 0' }}>
              Please log in to edit your profile.
            </p>
          </div>
          <div className="ep-footer">
            <button className="ep-cancel-btn" style={{ flex: 1 }} onClick={onClose}>Close</button>
          </div>
        </div>
      </IonModal>
    );
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="edit-profile-modal">
      <div className="ep-sheet">
        {/* ── Header ── */}
        <div className="ep-header">
          <p className="ep-header-title">Edit Profile</p>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="ep-body">

          {/* Account Section */}
          <p className="ep-section-label">Account Info</p>

          <div className="ep-field">
            <label htmlFor="ep-username">
              Username <span className="ep-disabled-badge">read-only</span>
            </label>
            <input id="ep-username" value={username} disabled />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-email">
              Email <span className="ep-disabled-badge">read-only</span>
            </label>
            <input id="ep-email" type="email" value={userEmail} disabled />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-phone">Phone Number</label>
            <input
              id="ep-phone"
              type="tel"
              placeholder="888-888-8888"
              value={phoneNumber}
              className={errors.phoneNumber ? 'has-error' : ''}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
            />
            {errors.phoneNumber && <span className="ep-error">{errors.phoneNumber}</span>}
          </div>

          {/* Address Section */}
          <div className="ep-divider" />
          <p className="ep-section-label">Address</p>

          <div className="ep-field">
            <label htmlFor="ep-street">Street</label>
            <input
              id="ep-street"
              placeholder="1234 Main St"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-city">City</label>
            <input
              id="ep-city"
              placeholder="San Francisco"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>

          <div className="ep-row">
            {/* State with autocomplete */}
            <div className="ep-field">
              <label htmlFor="ep-state">State</label>
              <div className="ep-state-wrapper">
                <input
                  id="ep-state"
                  placeholder="CA"
                  value={stateQuery}
                  maxLength={2}
                  className={errors.state ? 'has-error' : ''}
                  onChange={(e) => handleStateChange(e.target.value)}
                  onFocus={handleStateFocus}
                  onBlur={handleStateBlur}
                />
                {showDropdown && (
                  <div className="ep-dropdown">
                    {filteredStates.map((state) => (
                      <div
                        key={state}
                        className="ep-dropdown-item"
                        onMouseDown={() => selectState(state)}
                      >
                        {state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.state && <span className="ep-error">{errors.state}</span>}
            </div>

            {/* Zip */}
            <div className="ep-field">
              <label htmlFor="ep-zip">Zip Code</label>
              <input
                id="ep-zip"
                type="tel"
                placeholder="95391"
                value={address.zip}
                maxLength={5}
                className={errors.zip ? 'has-error' : ''}
                onChange={(e) => {
                  setAddress({ ...address, zip: e.target.value });
                  setErrors((prev) => ({ ...prev, zip: undefined }));
                }}
              />
              {errors.zip && <span className="ep-error">{errors.zip}</span>}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="ep-footer">
          <button className="ep-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="ep-save-btn" onClick={onSave}>Save</button>
        </div>
      </div>
    </IonModal>
  );
};

export default EditProfileModal;
