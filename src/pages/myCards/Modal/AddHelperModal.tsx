import React, { useState, useEffect, useRef } from 'react';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
  IonList,
  IonModal,
  IonText,
  IonItem,
  IonIcon,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonLabel,
  IonAvatar,
  IonListHeader,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../context/AuthContext';
import { Helper } from '../../../models/Helper';
import * as HelperService from '../../../services/HelperService'; // Adjust the path as necessary
import { 
  add, close, brushOutline, hammerOutline, cubeOutline, leafOutline, 
  waterOutline, flashOutline, colorFillOutline, constructOutline, 
  laptopOutline, carOutline, informationCircleOutline 
} from 'ionicons/icons';
import './AddHelperModal.css'; // Import your CSS file

interface AddHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHelper: (helper: Helper) => void;
  initialMode?: 'search' | 'create';
}

const AddHelperModal: React.FC<AddHelperModalProps> = ({ isOpen, onClose, onAddHelper, initialMode = 'search' }) => {
  const { currentUser } = useAuth();
  const [newHelperName, setNewHelperName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [contactMail, setContactmail] = useState<string>('');
  const [foundHelpers, setFoundHelpers] = useState<Helper[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  const [newHelperAvatar, setNewHelperAvatar] = useState<string>('/images/default-avatar.png'); // Default from public/images
  const [newHelperInfo, setNewHelperInfo] = useState<string>('');
  const [newHelperBanner, setNewHelperBanner] = useState<string>('/images/default-banner.jpg'); // Default from public/images
  const [newHelperCategory, setNewHelperCategory] = useState<string>('');
  const [newHelperRating, setNewHelperRating] = useState<number>(0);
  
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [filteredCategories, setFilteredCategories] = useState<{ value: string; label: string }[]>([]); // Specify type for filteredCategories
  const [zipcodes, setZipCodes] = useState<string[]>(['']); // State for area codes
  const storage = getStorage(); // Initialize Firebase Storage

  const defaultImages = [
    './images/users/handy_1.png',
    './images/users/handy_2.png',
    './images/users/handy_3.png',
    './images/users/handy_4.png',
  ];

  const defaultBanners = [
    './images/banners/bg_1.png',
    './images/banners/bg_2.png',
    './images/banners/bg_3.png',
    './images/banners/bg_4.png',
  ];

  const getRandomDefaultBanner = () => {
    const randomIndex = Math.floor(Math.random() * defaultBanners.length);
    return defaultBanners[randomIndex];
  };

  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };

  useEffect(() => {
    if (isOpen) {
      setNewHelperName('');
      setFoundHelpers([]);
      setShowAutocomplete(false);
      setContactNumber('');
      setContactmail('');
      setNewHelperAvatar(getRandomDefaultImage());
      setNewHelperBanner(getRandomDefaultBanner());
      setNewHelperCategory('');
      setNewHelperRating(0);
      // Type cast currentUser since we expect custom profile properties
      const user = currentUser as any;
      setZipCodes(user?.address?.zip ? [user.address.zip] : []);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (newHelperCategory) {
      // Basic category to avatar mapping (fallback to a default if category image doesn't exist)
      setNewHelperAvatar(`./images/users/${newHelperCategory.toLowerCase().replace(/\s+/g, '')}_1.png`);
    }
  }, [newHelperCategory]);

  useEffect(() => {
    const loadHelpers = async () => {
      if (newHelperName.trim().length < 3) {
        setFoundHelpers([]);
        setShowAutocomplete(false);
        return;
      }

      setSearching(true);
      try {
        const helpers = await HelperService.getHelpers();
        const filteredHelpers = helpers.filter(helper =>
          helper.name.toLowerCase().includes(newHelperName.toLowerCase())
        );
        setFoundHelpers(filteredHelpers);
        setShowAutocomplete(true);
      } catch (error) {
        console.error('Error searching helpers:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceLoadHelpers = setTimeout(loadHelpers, 300); // Debounce for better performance

    return () => clearTimeout(debounceLoadHelpers);
  }, [newHelperName]);

  const handleAddNewHelper = async () => {
    if (newHelperName.trim() !== '') {
      const newHelper: Helper = {
        id: "" + Date.now(),
        name: newHelperName,
        avatar: newHelperAvatar,
        info: newHelperInfo,
        banner: newHelperBanner,
        category: newHelperCategory,
        rating: newHelperRating,
        title: '',
        description: '',
        ratingCount: 0,
        reviews: [],
        zipcodes: zipcodes,
        email: contactMail,
        contact: contactNumber,
        tags: []
      };

      try {
        const generatedId = await HelperService.createHelper(newHelper);
        newHelper.id = generatedId; // Ensure we pass the real Firebase document ID
        onAddHelper(newHelper);
        // Reset fields after adding
        setNewHelperName('');
        setNewHelperAvatar('./images/users/handy_1.png');
        setNewHelperInfo('New helper added.');
        setNewHelperBanner('./images/banners/bg_1.png');
        setNewHelperCategory('');
        setNewHelperRating(0);
        setZipCodes(['']); // Reset area codes
        onClose();
      } catch (error) {
        console.error('Error adding new helper:', error);
      }
    }
  };

  const categories = [
    { value: 'cleaning', label: 'Cleaning', icon: brushOutline },
    { value: 'handyman', label: 'Handyman', icon: hammerOutline },
    { value: 'moving', label: 'Moving', icon: cubeOutline },
    { value: 'gardening', label: 'Gardening', icon: leafOutline },
    { value: 'plumbing', label: 'Plumbing', icon: waterOutline },
    { value: 'electrical', label: 'Electrical', icon: flashOutline },
    { value: 'painting', label: 'Painting', icon: colorFillOutline },
    { value: 'assembly', label: 'Assembly', icon: constructOutline },
    { value: 'techsupport', label: 'Tech Support', icon: laptopOutline },
    { value: 'delivery', label: 'Delivery', icon: carOutline },
  ];

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="primary-title">Add/Edit Helper</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="modal-content">
        <div className="input-form slide-in">
          <div className="banner-avatar-container">
            <div className="banner-wrapper">
              <img
                className="modal-banner"
                src={newHelperBanner}
                alt="Banner"
              />
            </div>
            <div className="avatar-wrapper">
              <img className="modal-avatar" src={newHelperAvatar} alt="Avatar" />
            </div>
          </div>

          <div className="autocomplete-container">
            <IonInput
              value={newHelperName}
              label="Name / Company Name"
              labelPlacement="floating"
              onIonChange={(e) => setNewHelperName(e.detail.value!)}
              className="form-input"
              placeholder="Start typing to search..."
            />
            {showAutocomplete && (searching || foundHelpers.length > 0) && (
              <div className="autocomplete-dropdown">
                {searching ? (
                  <div className="autocomplete-empty">Searching...</div>
                ) : (
                  foundHelpers.map((helper) => (
                    <div
                      key={helper.id}
                      className="autocomplete-item"
                      onClick={() => {
                        onAddHelper(helper);
                        onClose();
                      }}
                    >
                      <img src={helper.avatar} alt={helper.name} className="autocomplete-avatar" />
                      <div className="autocomplete-details">
                        <h4 className="autocomplete-name">{helper.name}</h4>
                        <p className="autocomplete-category">{helper.category}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {showAutocomplete && !searching && foundHelpers.length === 0 && (
              <div className="autocomplete-warning-tooltip">
                <IonIcon icon={informationCircleOutline} />
                <span>No matching contacts found. Keep typing to create a new one!</span>
              </div>
            )}
          </div>

          <IonInput type="tel" placeholder="888-888-8888"
            value={contactNumber}
            label="Contact Number"
            labelPlacement="floating"
            onIonChange={(e) => setContactNumber(e.detail.value!)}
            className="form-input"
          />

          <IonInput type="email" placeholder="email@domain.com"
            value={contactMail}
            label="Email"
            labelPlacement="floating"
            onIonChange={(e) => setContactmail(e.detail.value!)}
            className="form-input"
          />

          <IonInput
            value={zipcodes.join(', ')}
            label="Service Areas (Zip Codes)"
            labelPlacement="floating"
            placeholder="e.g. 90210, 90211"
            onIonChange={(e) => {
              const val = e.detail.value || '';
              setZipCodes(val.split(',').map(z => z.trim()).filter(z => z));
            }}
            className="form-input"
          />

          <div 
            className="form-input custom-select-button" 
            onClick={() => setShowCategoryModal(true)}
          >
            <IonLabel color="medium" position="stacked">Category</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '16px', color: newHelperCategory ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {newHelperCategory || 'Select a Category'}
              </span>
              <IonIcon icon={newHelperCategory ? categories.find(c => c.label === newHelperCategory)?.icon : add} />
            </div>
          </div>

          <IonModal
            isOpen={showCategoryModal}
            onDidDismiss={() => setShowCategoryModal(false)}
            initialBreakpoint={0.65}
            breakpoints={[0, 0.65, 0.9]}
            className="category-sheet-modal"
          >
            <div style={{ padding: '24px 16px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>Select Category</h2>
              <div className="modal-categories-grid">
                {categories.map((category) => (
                  <div 
                    key={category.value}
                    className={`modal-category-card ${newHelperCategory === category.label ? 'selected' : ''}`}
                    onClick={() => {
                      setNewHelperCategory(category.label);
                      setShowCategoryModal(false);
                    }}
                  >
                    <div className="modal-icon-bg">
                      <IonIcon icon={category.icon} className="modal-category-icon" />
                    </div>
                    <span>{category.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </IonModal>
          
          <IonTextarea
            value={newHelperInfo}
            labelPlacement="floating"
            label="Description"
            placeholder="Enter info"
            onIonChange={(e) => setNewHelperInfo(e.detail.value!)}
            className="form-input"
            maxlength={500}
            rows={4}
          />
          <div className="form-buttons">
            <IonButton onClick={handleAddNewHelper} color="primary">Save Contact</IonButton>
            <IonButton onClick={onClose} fill="outline" color="medium">Cancel</IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddHelperModal;
