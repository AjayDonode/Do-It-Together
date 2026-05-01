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
import FormField from '../../components/common/FormField';
import AuthBackground from '../../components/common/AuthBackground';

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
            <FormField
              label="Company Name"
              value={formData.companyName || ''}
              onChange={(val) => handleChange('companyName', val)}
              required
              placeholder="e.g. Acme Plumbing"
            />
            <FormField
              label="Bio/Description"
              type="textarea"
              value={formData.bio || ''}
              onChange={(val) => handleChange('bio', val)}
              placeholder="Tell us about your business..."
            />
            <FormField
              label="Website URL"
              value={formData.websiteUrl || ''}
              onChange={(val) => handleChange('websiteUrl', val)}
              placeholder="https://example.com"
            />
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
            <IonItem className="form-item" lines="none">
              <IonLabel position="stacked" className="form-label">Service Category *</IonLabel>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <IonIcon icon={searchOutline} style={{ marginRight: '8px', color: 'var(--ion-color-medium)' }} />
                <IonInput
                  value={searchText}
                  onIonInput={handleSearchChange}
                  onIonFocus={handleCategoryFocus}
                  placeholder={isLoadingCategories ? 'Loading...' : 'Search or add a category'}
                  disabled={isLoadingCategories}
                  className="form-input"
                />
                {showAddButton && (
                  <IonButton fill="clear" onClick={handleAddNewCategory} disabled={isLoadingCategories}>
                    <IonIcon icon={checkmarkOutline} />
                  </IonButton>
                )}
              </div>
            </IonItem>
            {selectedCategory && (
              <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
                <IonLabel className="form-label">Selected: <span style={{color: '#ff385c'}}>{selectedCategory}</span></IonLabel>
                <IonButton slot="end" fill="clear" size="small" onClick={() => setSelectedCategory('')}>
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
              <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
                <IonLabel position="stacked" className="form-label">Sub-Services *</IonLabel>
                <IonSelect
                  multiple
                  value={selectedSubservices}
                  onIonChange={(e) => setSelectedSubservices(e.detail.value)}
                  placeholder="Select sub-services"
                  className="form-input"
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
            <IonList style={{ background: 'transparent' }}>
              {selectedServices.map((service, index) => (
                <IonItem key={index} className="form-item" lines="none" style={{ marginTop: '4px' }}>
                  <IonLabel className="form-label" style={{ whiteSpace: 'normal' }}>
                    <strong style={{color: '#ff385c'}}>{service.category}:</strong> {service.subservices.join(', ')}
                  </IonLabel>
                  <IonButton slot="end" fill="clear" color="danger" size="small" onClick={() => removeService(index)}>
                    Remove
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Hourly Rate Min"
                  type="number"
                  value={formData.hourlyRate?.min?.toString() || ''}
                  onChange={(val) => handleChange('hourlyRate', { ...formData.hourlyRate, min: parseInt(val, 10) || 0 })}
                  placeholder="0"
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Hourly Rate Max"
                  type="number"
                  value={formData.hourlyRate?.max?.toString() || ''}
                  onChange={(val) => handleChange('hourlyRate', { ...formData.hourlyRate, max: parseInt(val, 10) || 0 })}
                  placeholder="100"
                />
              </div>
            </div>

            <IonItem>
              <IonRange aria-label="Dual Knobs Range" dualKnobs={true} value={{lower: formData.hourlyRate?.min || 0 , upper: formData.hourlyRate?.max || 100}}></IonRange>
            </IonItem>
          </>
        );
      case 3:
        return (
          <>
            <FormField
              label="Availability"
              value={formData.availability || ''}
              onChange={(val) => handleChange('availability', val)}
              placeholder="e.g., Mon-Fri 8AM-5PM"
            />
            <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
              <IonLabel position="stacked" className="form-label">Service Areas (Cities/Zips) *</IonLabel>
              <IonSelect multiple value={formData.serviceAreas} onIonChange={(e) => handleChange('serviceAreas', e.detail.value)} className="form-input">
                <IonSelectOption value="Seattle">Seattle</IonSelectOption>
                <IonSelectOption value="98101">98101</IonSelectOption>
                <IonSelectOption value="Portland">Portland</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
              <IonLabel position="stacked" className="form-label">Languages Spoken</IonLabel>
              <IonSelect multiple value={formData.languages} onIonChange={(e) => handleChange('languages', e.detail.value)} className="form-input">
                {languageOptions.map((opt) => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          </>
        );
      case 4:
        return (
          <>
            <IonItem className="form-item" lines="none">
              <IonLabel position="stacked" className="form-label">Liability Insurance</IonLabel>
              <IonSelect value={formData.insurance} onIonChange={(e) => handleChange('insurance', e.detail.value === 'true')} className="form-input">
                <IonSelectOption value="true">Yes</IonSelectOption>
                <IonSelectOption value="false">No</IonSelectOption>
              </IonSelect>
            </IonItem>
            <div style={{ marginTop: '8px' }}>
              <FormField
                label="Certifications (comma-separated)"
                value={formData.certifications?.join(', ') || ''}
                onChange={(val) => handleChange('certifications', val.split(', ').filter(Boolean))}
                placeholder="e.g. Master Plumber, OSHA 30"
              />
            </div>
            <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
              <IonLabel position="stacked" className="form-label">Background Checked</IonLabel>
              <IonSelect value={formData.backgroundChecked} onIonChange={(e) => handleChange('backgroundChecked', e.detail.value === 'true')} className="form-input">
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
                {formData.services?.map((s) => `${s.name}: ${(s.subcategories || []).join(', ')}`).join(' | ') || 'None'}
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
      <IonContent fullscreen className="auth-page-content">
        <AuthBackground />
        
        <div className="auth-wrapper" style={{ maxWidth: '600px' }}>
          <div className="auth-brand" style={{ marginBottom: '16px' }}>
            <h1 style={{ cursor: 'pointer' }} onClick={() => router.push('/profile')}>Do It Together</h1>
          </div>
          
          <div className="auth-card">
            <div className="auth-header">
              <h2>Join as Pro</h2>
              <p>Complete the steps to upgrade your account</p>
            </div>

            <IonProgressBar value={currentStep / totalSteps} style={{ marginBottom: '16px', borderRadius: '4px', height: '8px', '--background': 'rgba(0,0,0,0.05)', '--progress-background': '#ff385c' }} />
            <h3 style={{ color: 'var(--ion-color-dark)', marginBottom: '24px', fontWeight: 'bold' }}>Step {currentStep} of {totalSteps}</h3>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              {renderStep()}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px' }}>
              <IonButton 
                fill="outline" 
                color="medium"
                onClick={prevStep}
                style={{ flex: currentStep > 1 ? 1 : 0, display: currentStep > 1 ? 'block' : 'none' }}
              >
                Back
              </IonButton>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={currentStep < totalSteps ? nextStep : undefined}
                style={{ flex: 2, margin: 0 }}
                disabled={isSubmitting}
              >
                {currentStep < totalSteps ? 'Next Step' : 'Loading...'}
              </IonButton>
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <IonButton fill="clear" color="medium" size="small" onClick={() => router.push('/profile')}>
                Cancel
              </IonButton>
            </div>
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
