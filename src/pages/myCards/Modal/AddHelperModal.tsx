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
import { Helper } from '../../../models/Helper';
import HelperService from '../../../services/HelperService'; // Adjust the path as necessary
import { add, close, pencilOutline } from 'ionicons/icons';
import './AddHelperModal.css'; // Import your CSS file

interface AddHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHelper: (helper: Helper) => void;
}

const AddHelperModal: React.FC<AddHelperModalProps> = ({ isOpen, onClose, onAddHelper }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [foundHelpers, setFoundHelpers] = useState<Helper[]>([]);
  const [newHelperName, setNewHelperName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [contactMail, setContactmail] = useState<string>('');

  const [newHelperAvatar, setNewHelperAvatar] = useState<string>('/images/default-avatar.png'); // Default from public/images
  const [newHelperInfo, setNewHelperInfo] = useState<string>('');
  const [newHelperBanner, setNewHelperBanner] = useState<string>('/images/default-banner.jpg'); // Default from public/images
  const [newHelperCategory, setNewHelperCategory] = useState<string>('');
  const [newHelperRating, setNewHelperRating] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);
  const [showInputForm, setShowInputForm] = useState<boolean>(false); // New state for input form visibility
  const helperService = new HelperService();
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
      setSearchTerm('');
      setFoundHelpers([]);
      setNewHelperName('');
      setContactNumber('');
      setContactmail('');
      setNewHelperAvatar(getRandomDefaultImage());
      setNewHelperBanner(getRandomDefaultBanner());
      setNewHelperCategory('');
      setNewHelperRating(0);
      setShowInputForm(false); // Reset to hide input form
    }
  }, [isOpen]);

  useEffect(() => {
    const loadHelpers = async () => {
      if (searchTerm.trim() === '') {
        setFoundHelpers([]);
        return;
      }

      setSearching(true);
      try {
        const helpers = await helperService.getHelpers();
        const filteredHelpers = helpers.filter(helper =>
          helper.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFoundHelpers(filteredHelpers);
      } catch (error) {
        console.error('Error searching helpers:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceLoadHelpers = setTimeout(loadHelpers, 300); // Debounce for better performance

    return () => clearTimeout(debounceLoadHelpers);
  }, [searchTerm]);

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
        zipcodes: zipcodes 
      };

      try {
        await helperService.createHelper(newHelper);
        onAddHelper(newHelper);
        // Reset fields after adding
        setNewHelperName('');
        setNewHelperAvatar('./images/users/handy_1.png');
        setNewHelperInfo('New helper added.');
        setNewHelperBanner('./images/banners/bg_1.png');
        setNewHelperCategory('');
        setNewHelperRating(0);
        setShowInputForm(false); // Hide the input form after adding
        setZipCodes(['']); // Reset area codes
        onClose();
      } catch (error) {
        console.error('Error adding new helper:', error);
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const avatarRef = storageRef(storage, `avatars/${Date.now()}_${file.name}`);
        await uploadBytes(avatarRef, file);
        const url = await getDownloadURL(avatarRef);
        setNewHelperAvatar(url);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const bannerRef = storageRef(storage, `banners/${Date.now()}_${file.name}`);
        await uploadBytes(bannerRef, file);
        const url = await getDownloadURL(bannerRef);
        setNewHelperBanner(url);
      } catch (error) {
        console.error('Error uploading banner:', error);
      }
    }
  };

  const triggerAvatarUpload = () => {
    avatarFileInputRef.current?.click();
  };

  const triggerBannerUpload = () => {
    bannerFileInputRef.current?.click();
  };

  const categories = [
    { value: '1', label: 'Handiman' },
    { value: '2', label: 'Plumber' },
    { value: '3', label: 'Electician' },
    { value: '4', label: 'Carpenter' },
    { value: '5', label: 'Cabinates' },
    { value: '6', label: 'Landscaping' },
    // Add more categories as needed
  ];

  const handleInputChange = (value: string | null | undefined) => {
    //const value = e.target.value;
    setNewHelperCategory(newHelperCategory);

    // Filter categories based on input
    const filtered = categories.filter(category =>
      category.label.toLowerCase().includes(newHelperCategory.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleCategorySelect = (category: { value: string; label: string }) => {
    setNewHelperCategory(category.label);
    setFilteredCategories([]); // Clear suggestions
  };

  const handleZipCodeChange = (index: number, value: string) => {
    const newAreaCodes = [...zipcodes]; // Create a copy of the current area codes
    newAreaCodes[index] = value; // Update the area code at the specified index
    setZipCodes(newAreaCodes); // Update the state with the new area codes
};

// Function to remove an area code from the list
const removeZipCode = (index: number) => {
    const newAreaCodes = zipcodes.filter((_, i) => i !== index); // Remove the area code at the specified index
    setZipCodes(newAreaCodes); // Update the state with the new area codes
};

// Function to add a new area code input field
const addZipCode = () => {
    setZipCodes([...zipcodes, '']); // Add an empty string for a new area code
};

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
        {!showInputForm ? (
          <>
            <div className="search-container">
              <IonSearchbar
                className="search-bar"
                showClearButton="focus"
                value={searchTerm}
                placeholder="Search for a helper..."
                onIonChange={(e) => setSearchTerm(e.detail.value!)}
              />
              <IonButton color="danger" onClick={() => setShowInputForm(true)}>
                <IonIcon icon={add} />
              </IonButton>
            </div>
            <IonList>
              {searching ? (
                <IonText color="medium">
                  <p>Searching...</p>
                </IonText>
              ) : foundHelpers.length > 0 ? (
                foundHelpers.map((helper) => (
                  <IonItem
                    key={helper.id}
                    button
                    onClick={() => {
                      // For edit: Populate form with existing helper data and show input form
                      setNewHelperName(helper.name);
                      setNewHelperAvatar(helper.avatar);
                      setNewHelperInfo(helper.info);
                      setNewHelperBanner(helper.banner);
                      setZipCodes(['']); // Reset area codes
                      setNewHelperCategory(helper.category);
                      setShowInputForm(true); // Switch to edit mode
                    }}
                  >
                    <IonCard>
                      <IonCardContent>
                        <h3>{helper.name}</h3>
                      </IonCardContent>
                    </IonCard>
                  </IonItem>
                ))
              ) : (
                <IonText color="medium">
                  <p>No helpers found. You can add a new helper below.</p>
                </IonText>
              )}
            </IonList>
          </>
        ) : (
          <div className="input-form slide-in">
            <div className="banner-avatar-container">
              <div className="banner-wrapper">
                <img
                  className="modal-banner"
                  src={newHelperBanner}
                  alt="Banner"
                />
                <IonButton fill="clear" className="edit-banner" onClick={triggerBannerUpload}>
                  <IonIcon icon={pencilOutline} />
                </IonButton>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleBannerUpload}
                />
              </div>
              <div className="avatar-wrapper">
                <IonAvatar className="modal-avatar">
                  <img src={newHelperAvatar} alt="Avatar" />
                </IonAvatar>
                <IonButton fill="clear" className="edit-avatar" onClick={triggerAvatarUpload}>
                  <IonIcon icon={pencilOutline} />
                </IonButton>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            <IonInput
              value={newHelperName}
              label="Name / Company Name"
              labelPlacement="floating"
              onIonChange={(e) => setNewHelperName(e.detail.value!)}
              className="form-input"
            />

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

             <IonLabel>Area Codes</IonLabel>
            {zipcodes.map((code, index) => (
              <IonItem key={index}>
                <IonInput
                  value={code}
                  placeholder="Enter area code"
                  onIonChange={(e) => handleZipCodeChange(index, e.detail.value!)}
                />
                <IonButton onClick={() => removeZipCode(index)} color="danger">
                  Remove
                </IonButton>
              </IonItem>
            ))}
            <IonButton onClick={addZipCode} expand="full">
              Add Area Code
            </IonButton>

            <IonItem>
              <IonSelect label="Select Category" labelPlacement="floating">
                {categories.map((category) => (
                  <IonSelectOption key={category.value} value={category.value}>
                    {category.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            //Add zip input here 
            <IonTextarea
              value={newHelperInfo}
              labelPlacement="floating"
              placeholder="Enter info"
              onIonChange={(e) => setNewHelperInfo(e.detail.value!)}
              className="form-input"
              maxlength={500} // Set maximum length to 500 characters
              rows={5} // Adjust the number of visible rows as needed
            />
            <div className="form-buttons">
              <IonButton onClick={handleAddNewHelper} color="primary">Save Helper</IonButton>
              <IonButton onClick={() => setShowInputForm(false)} color="light">Cancel</IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default AddHelperModal;
