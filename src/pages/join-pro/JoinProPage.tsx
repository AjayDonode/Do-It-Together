import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonProgressBar,
  IonList,
  IonText,
  IonToast,
  useIonRouter,
  IonIcon,
  IonRange,
} from '@ionic/react';
import { searchOutline, checkmarkOutline } from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import UserProfileService from '../../services/UserProfileService';
import { UserProfile } from '../../models/UserProfile';

import { ProDetails, Service } from '../../models/Helper'; // Adjust path to your models
import './JoinPro.css';
import ProServicesService from '../../services/ProServicesService';

const JoinProPage: React.FC = () => {
  const { currentUser } = useAuth(); // Get current user from context
  const router = useIonRouter(); // For navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [formData, setFormData] = useState<Partial<ProDetails>>({});
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubservices, setSelectedSubservices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ category: string; subservices: string[] }[]>([]);

  const proServicesService = new ProServicesService();
  const [searchText, setSearchText] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Service[]>([]);
  const [showAddButton, setShowAddButton] = useState(false);

  const languageOptions = ['English', 'Spanish', 'French', 'Other'];

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const fetchedProfile = await UserProfileService.getProfile(currentUser.uid) as UserProfile;
        if (fetchedProfile) {
          setExistingProfile(fetchedProfile);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    handleChange('services', selectedServices);
  }, [selectedServices]);

  const addService = () => {
    if (selectedCategory && selectedSubservices.length > 0) {
      setSelectedServices((prev) => [
        ...prev,
        { category: selectedCategory, subservices: selectedSubservices },
      ]);
      setSelectedCategory(''); // Reset selections
      setSelectedSubservices([]);
    } else {
      setToastMessage('Please select a category and at least one sub-service.');
      setToastColor('danger');
    }
  };

  // Handler to remove a service from the list
  const removeService = (index: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input changes
  const handleChange = (key: keyof ProDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Validate current step (basic example; expand with more rules)
  const validateStep = (step: number): boolean => {
    if (step === 1) return !!formData.companyName && !!formData.bio;
    if (step === 2) return !!formData.services && formData.services.length > 0;
    if (step === 3) return !!formData.serviceAreas && formData.serviceAreas.length > 0;
    if (step === 4) return true; // Optional trust fields
    return true;
  };

  // Navigation handlers
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      setToastMessage('Please fill required fields.');
      setToastColor('danger');
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Submit form
  const handleSubmit = async () => {
    if (!existingProfile || !currentUser) return;
    setIsSubmitting(true);

    try {
      // Update profile with proDetails and set role to 'pro'
      const updatedProfile: UserProfile = {
        ...existingProfile,
        proDetails: formData as ProDetails, // Cast since all fields are collected
        // Assuming you have a way to update User role (e.g., via Firebase function or separate update)
      };
      console.log('Updated Profile:', updatedProfile);
      await UserProfileService.updateUserProfile(updatedProfile);
      // Optionally update User role in auth or a users collection
      // e.g., await updateUserRole(currentUser.uid, 'pro');

      setToastMessage('Successfully joined as Pro!');
      setToastColor('success');
      router.push('/profile'); // Redirect back to profile
    } catch (error) {
      setToastMessage('Error submitting. Please try again.');
      setToastColor('danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <IonItem>
              <IonLabel position="floating">Company Name *</IonLabel>
              <IonInput value={formData.companyName} onIonChange={(e) => handleChange('companyName', e.detail.value!)} required />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Bio/Description</IonLabel>
              <IonTextarea value={formData.bio} onIonChange={(e) => handleChange('bio', e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Website URL</IonLabel>
              <IonInput value={formData.websiteUrl} onIonChange={(e) => handleChange('websiteUrl', e.detail.value!)} />
            </IonItem>
          </>
        );
      case 2:
        const handleCategoryFocus = async () => {
          if (categoriesLoaded || isLoadingCategories) return; // Already loaded or loading
          setIsLoadingCategories(true);
          try {
            const fetchedCategories = await proServicesService.getCategories();
            setCategories(fetchedCategories);
            setCategoriesLoaded(true);
          } catch (error) {
            setToastMessage('Error loading services. Please try again.');
            setToastColor('danger');
          } finally {
            setIsLoadingCategories(false);
          }
        };

        const handleSearchChange = (e: CustomEvent) => {
          const query = e.detail.value?.toLowerCase() || '';
          setSearchText(query);

          // Filter categories based on search
          const matches = categories.filter((cat) => cat.name.toLowerCase().includes(query));
          setFilteredCategories(matches);

          // Show "Add" button if no exact match and query is not empty
          const hasExactMatch = categories.some((cat) => cat.name.toLowerCase() === query);
          setShowAddButton(!!query && !hasExactMatch);
        };

        const handleSelectCategory = (categoryName: string) => {
          setSelectedCategory(categoryName);
          setSearchText(''); // Clear search input after selection
          setFilteredCategories([]); // Hide suggestions
          setShowAddButton(false);
        };

        const handleAddNewCategory = async () => {
          if (!searchText) return;
          const newCategoryName = searchText.trim();

          try {
            // Save to DB via service and get the new ID
            const newId = await proServicesService.addCategory(newCategoryName);

            // Add to local state (with empty subcategories and ID)
            const newCategory: Service = { id: newId, name: newCategoryName, subcategories: [] };
            setCategories((prev) => [...prev, newCategory]);

            // Select the new category
            handleSelectCategory(newCategoryName);

            setToastMessage(`New category "${newCategoryName}" added successfully!`);
            setToastColor('success');
          } catch (error) {
            setToastMessage('Error adding new category. Please try again.');
            setToastColor('danger');
          }
        };

        const currentSubs = categories.find((cat) => cat.name === selectedCategory)?.subcategories || [];

        return (
          <>
            <IonItem>
              <IonLabel>Service Category *</IonLabel>
              <IonIcon icon={searchOutline} slot="start" />
              <IonInput
                value={searchText}
                onIonInput={handleSearchChange} // Note: onIonInput for live changes (Ionic's event)
                onIonFocus={handleCategoryFocus} // Lazy load on focus
                placeholder={isLoadingCategories ? 'Loading...' : 'Search or add a category'}
                disabled={isLoadingCategories}
              />
              {showAddButton && (
                <IonButton slot="end" onClick={handleAddNewCategory} disabled={isLoadingCategories}>
                  <IonIcon icon={checkmarkOutline} />
                </IonButton>
              )}
            </IonItem>
            {/* Display currently selected category */}
            {selectedCategory && (
              <IonItem lines="none">
                <IonLabel>Selected: {selectedCategory}</IonLabel>
                <IonButton slot="end" fill="clear" onClick={() => setSelectedCategory('')}>
                  Clear
                </IonButton>
              </IonItem>
            )}
            {/* Suggestions dropdown list */}
            {filteredCategories.length > 0 && searchText && (
              <IonList
                style={{
                  position: 'absolute',
                  zIndex: 10,
                  background: 'white',
                  border: '1px solid #ccc',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  width: '100%', // Adjust to match input width
                }}
              >
                {filteredCategories.map((cat) => (
                  <IonItem key={cat.name} button onClick={() => handleSelectCategory(cat.name)}>
                    <IonLabel>{cat.name}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
            {selectedCategory && (
              <IonItem>
                <IonLabel>Sub-Services *</IonLabel>
                <IonSelect
                  multiple
                  value={selectedSubservices}
                  onIonChange={(e) => setSelectedSubservices(e.detail.value)}
                  placeholder="Select sub-services"
                >
                  {currentSubs.map((sub) => (
                    <IonSelectOption key={sub} value={sub}>
                      {sub}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}
            <IonButton expand="block" onClick={addService} disabled={!selectedCategory || selectedSubservices.length === 0 || isLoadingCategories}>
              Add Service
            </IonButton>
            <IonList>
              {selectedServices.map((service, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    {service.category}: {service.subservices.join(', ')}
                  </IonLabel>
                  <IonButton slot="end" fill="clear" onClick={() => removeService(index)}>
                    Remove
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
            <IonItem>
              <IonLabel position="floating">Hourly Rate Min</IonLabel>
              <IonInput type="number" value={formData.hourlyRate?.min} onIonChange={(e) => handleChange('hourlyRate', { ...formData.hourlyRate, min: parseInt(e.detail.value!, 10) })} />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Hourly Rate Max</IonLabel>
              <IonInput type="number" value={formData.hourlyRate?.max} onIonChange={(e) => handleChange('hourlyRate', { ...formData.hourlyRate, max: parseInt(e.detail.value!, 10) })} />
            </IonItem>

            <IonItem>
              <IonRange aria-label="Dual Knobs Range" dualKnobs={true} value={{lower: formData.hourlyRate?.min , upper: formData.hourlyRate?.max}}></IonRange>
            </IonItem>
          </>
        );
      case 3:
        return (
          <>
            <IonItem>
              <IonLabel position="floating">Availability (e.g., Mon-Fri 8AM-5PM)</IonLabel>
              <IonInput value={formData.availability} onIonChange={(e) => handleChange('availability', e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel>Service Areas (Cities/Zips) *</IonLabel>
              <IonSelect multiple value={formData.serviceAreas} onIonChange={(e) => handleChange('serviceAreas', e.detail.value)}>
                {/* You can make this dynamic; for now, example options */}
                <IonSelectOption value="Seattle">Seattle</IonSelectOption>
                <IonSelectOption value="98101">98101</IonSelectOption>
                <IonSelectOption value="Portland">Portland</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Languages Spoken</IonLabel>
              <IonSelect multiple value={formData.languages} onIonChange={(e) => handleChange('languages', e.detail.value)}>
                {languageOptions.map((opt) => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          </>
        );
      case 4:
        return (
          <>
            <IonItem>
              <IonLabel>Liability Insurance</IonLabel>
              <IonSelect value={formData.insurance} onIonChange={(e) => handleChange('insurance', e.detail.value === 'true')}>
                <IonSelectOption value="true">Yes</IonSelectOption>
                <IonSelectOption value="false">No</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Certifications (comma-separated)</IonLabel>
              <IonInput value={formData.certifications?.join(', ')} onIonChange={(e) => handleChange('certifications', e.detail.value!.split(', ').filter(Boolean))} />
            </IonItem>
            <IonItem>
              <IonLabel>Background Checked</IonLabel>
              <IonSelect value={formData.backgroundChecked} onIonChange={(e) => handleChange('backgroundChecked', e.detail.value === 'true')}>
                <IonSelectOption value="true">Yes</IonSelectOption>
                <IonSelectOption value="false">No</IonSelectOption>
              </IonSelect>
            </IonItem>
          </>
        );
      case 5:
        return (
          <IonList>
            <IonItem>
              <IonLabel>Review Your Info</IonLabel>
            </IonItem>
            <IonItem>
              <IonText>Company: {formData.companyName}</IonText>
            </IonItem>
            <IonItem>
              <IonText>
                Services:{' '}
                {formData.services?.map((s) => `${s.category}: ${s.subservices.join(', ')}`).join(' | ') || 'None'}
              </IonText>
            </IonItem>
            {/* Add more summary fields as needed */}
            <IonButton expand="block" onClick={handleSubmit} disabled={isSubmitting}>Submit and Join as Pro</IonButton>
          </IonList>
        );
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Join as Pro</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="joinpro-content">
        <div className="joinpro-card">
          <div className="joinpro-header">
            {/* <IonText color="primary">
              <h1 className="ion-text-center">Join as Pro</h1>
            </IonText> */}
            <p className="ion-text-center">Complete the steps to upgrade your account</p>
          </div>

          <IonProgressBar value={currentStep / totalSteps} />
          <h2>Step {currentStep} of {totalSteps}</h2>
          <div className="form-group">
            {renderStep()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {currentStep > 1 && <IonButton onClick={prevStep}>Back</IonButton>}
            {currentStep < totalSteps && <IonButton onClick={nextStep}>Next</IonButton>}
          </div>
        </div>
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage ?? undefined}
          duration={3000}
          onDidDismiss={() => setToastMessage(null)}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default JoinProPage;
