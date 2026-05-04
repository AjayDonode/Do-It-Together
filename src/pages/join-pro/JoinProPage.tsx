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

  // Service Areas state
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<string[]>([]);
  const [showAddArea, setShowAddArea] = useState(false);

  const KNOWN_AREAS = [
    'San Francisco', 'San Jose', 'Oakland', 'Los Angeles', 'San Diego',
    'Sacramento', 'Fresno', 'Long Beach', 'Bakersfield', 'Anaheim',
    'Seattle', 'Portland', 'Bellevue', 'Tacoma', 'Spokane',
    'New York', 'Brooklyn', 'Queens', 'Bronx', 'Newark',
    'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'Dallas',
    'Austin', 'Denver', 'Boston', 'Atlanta', 'Miami',
    'Las Vegas', 'Nashville', 'Minneapolis', 'Detroit', 'Charlotte',
    '94105', '94103', '10001', '90001', '60601', '77001', '98101', '85001',
  ];

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
    if (selectedCategory) {
      setSelectedServices((prev) => [
        ...prev,
        { category: selectedCategory, subservices: selectedSubservices },
      ]);
      setSelectedCategory(''); // Reset selections
      setSelectedSubservices([]);
    } else {
      setToastMessage('Please select a category first.');
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
      // Map selectedServices → Service[] shape expected by ProDetails
      const mappedServices: Service[] = selectedServices.map((s, i) => ({
        id: `service-${i}-${Date.now()}`,
        name: s.category,
        subcategories: s.subservices,
      }));

      // Expand service areas: ["San Francisco", "94105"] →
      // ["San Francisco", "san francisco", "94102", "94103", …, "94105", …]
      const { expandServiceAreas } = await import('../../utils/locationUtils');
      const rawAreas = (formData.serviceAreas as string[]) || [];
      const expandedAreas = expandServiceAreas(rawAreas);

      const proDetails: ProDetails = {
        companyName: formData.companyName || '',
        bio: formData.bio || '',
        websiteUrl: formData.websiteUrl,
        rawServiceAreas: rawAreas,       // original user input — safe to edit later
        serviceAreas: expandedAreas,     // expanded search index
        services: mappedServices,
        yearsInBusiness: formData.yearsInBusiness || 0,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability || '',
        languages: formData.languages || [],
        insurance: formData.insurance ?? false,
        certifications: formData.certifications || [],
        backgroundChecked: formData.backgroundChecked ?? false,
      };

      const updatedProfile: UserProfile = {
        ...existingProfile,
        role: 'pro',
        proDetails,
      };

      console.log('Submitting profile:', updatedProfile);
      await UserProfileService.updateUserProfile(currentUser.uid, updatedProfile);

      setToastMessage('Successfully joined as Pro!');
      setToastColor('success');
      router.push('/profile');
    } catch (error) {
      console.error('Submit error:', error);
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
                <IonLabel position="stacked" className="form-label">Sub-Services (optional)</IonLabel>
                {currentSubs.length > 0 ? (
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
                ) : (
                  <IonText color="medium" style={{ fontSize: '13px', paddingTop: '8px' }}>
                    No sub-services defined for this category. You can still add it.
                  </IonText>
                )}
              </IonItem>
            )}
            <IonButton expand="block" onClick={addService} disabled={!selectedCategory || isLoadingCategories}>
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
        const currentAreas = (formData.serviceAreas || []) as string[];

        const handleAreaInput = (val: string) => {
          setServiceAreaInput(val);
          if (!val.trim()) {
            setFilteredAreas([]);
            setShowAddArea(false);
            return;
          }
          const lower = val.trim().toLowerCase();
          const alreadyAdded = currentAreas.map((a) => a.toLowerCase());
          const matches = KNOWN_AREAS.filter(
            (a) => a.toLowerCase().includes(lower) && !alreadyAdded.includes(a.toLowerCase())
          );
          setFilteredAreas(matches);
          const hasExact = KNOWN_AREAS.some((a) => a.toLowerCase() === lower);
          setShowAddArea(!hasExact && val.trim().length > 1);
        };

        const selectArea = (area: string) => {
          if (currentAreas.map((a) => a.toLowerCase()).includes(area.toLowerCase())) {
            setToastMessage(`"${area}" is already added.`);
            setToastColor('danger');
          } else {
            handleChange('serviceAreas', [...currentAreas, area]);
          }
          setServiceAreaInput('');
          setFilteredAreas([]);
          setShowAddArea(false);
        };

        const removeServiceArea = (area: string) => {
          handleChange('serviceAreas', currentAreas.filter((a) => a !== area));
        };

        return (
          <>
            <FormField
              label="Availability"
              value={formData.availability || ''}
              onChange={(val) => handleChange('availability', val)}
              placeholder="e.g., Mon-Fri 8AM-5PM"
            />

            {/* Service Areas typeahead */}
            <IonItem className="form-item" lines="none" style={{ marginTop: '8px' }}>
              <IonLabel position="stacked" className="form-label">Service Areas (Cities / Zip Codes) *</IonLabel>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <IonIcon icon={searchOutline} style={{ color: 'var(--ion-color-medium)' }} />
                <IonInput
                  value={serviceAreaInput}
                  onIonInput={(e) => handleAreaInput(e.detail.value || '')}
                  placeholder="Search city or zip code…"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                {showAddArea && (
                  <IonButton fill="clear" size="small" onClick={() => selectArea(serviceAreaInput.trim())}>
                    <IonIcon icon={checkmarkOutline} />
                  </IonButton>
                )}
              </div>
            </IonItem>

            {/* Typeahead dropdown */}
            {filteredAreas.length > 0 && serviceAreaInput && (
              <IonList
                style={{
                  position: 'absolute', zIndex: 20,
                  background: 'white', border: '1px solid #e0e0e0',
                  borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  maxHeight: '200px', overflowY: 'auto', width: 'calc(100% - 32px)',
                }}
              >
                {filteredAreas.map((area) => (
                  <IonItem key={area} button onClick={() => selectArea(area)} lines="none">
                    <IonLabel style={{ fontSize: '14px' }}>{area}</IonLabel>
                  </IonItem>
                ))}
                {showAddArea && (
                  <IonItem button onClick={() => selectArea(serviceAreaInput.trim())} lines="none"
                    style={{ borderTop: '1px solid #f0f0f0' }}
                  >
                    <IonIcon icon={checkmarkOutline} slot="start" color="primary" />
                    <IonLabel color="primary" style={{ fontSize: '14px' }}>
                      Add "{serviceAreaInput.trim()}"
                    </IonLabel>
                  </IonItem>
                )}
              </IonList>
            )}

            {/* If no suggestions and user typed but no match, show add option standalone */}
            {filteredAreas.length === 0 && showAddArea && serviceAreaInput && (
              <IonList style={{ position: 'absolute', zIndex: 20, background: 'white',
                border: '1px solid #e0e0e0', borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', width: 'calc(100% - 32px)' }}
              >
                <IonItem button onClick={() => selectArea(serviceAreaInput.trim())} lines="none">
                  <IonIcon icon={checkmarkOutline} slot="start" color="primary" />
                  <IonLabel color="primary" style={{ fontSize: '14px' }}>
                    Add "{serviceAreaInput.trim()}"
                  </IonLabel>
                </IonItem>
              </IonList>
            )}

            {/* Selected area chips */}
            {currentAreas.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px', marginTop: '8px' }}>
                {currentAreas.map((area) => (
                  <div key={area} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,56,92,0.12)', color: '#ff385c',
                    borderRadius: '20px', padding: '4px 12px',
                    fontSize: '13px', fontWeight: 500,
                  }}>
                    {area}
                    <span onClick={() => removeServiceArea(area)}
                      style={{ cursor: 'pointer', fontWeight: 700, fontSize: '15px', lineHeight: 1 }}
                    >×</span>
                  </div>
                ))}
              </div>
            )}

            {currentAreas.length === 0 && !serviceAreaInput && (
              <IonText color="medium" style={{ fontSize: '13px', padding: '4px 16px', display: 'block' }}>
                Search above to add cities or zip codes.
              </IonText>
            )}

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
      case 5: {
        const reviewRow = (label: string, value: string | undefined | null) => (
          <div style={{ marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '2px' }}>
              {label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: value ? '#1a1a1a' : '#bbb', fontStyle: value ? 'normal' : 'italic' }}>
              {value || 'Not provided'}
            </div>
          </div>
        );

        const sectionTitle = (title: string) => (
          <div style={{ fontWeight: 700, color: '#ff385c', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '20px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px solid rgba(255,56,92,0.15)' }}>
            {title}
          </div>
        );

        return (
          <div style={{ color: '#1a1a1a' }}>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              Please review your information before submitting.
            </p>

            {sectionTitle('Business Info')}
            {reviewRow('Company Name', formData.companyName)}
            {reviewRow('Bio', formData.bio)}
            {reviewRow('Website', formData.websiteUrl)}

            {sectionTitle('Services')}
            {selectedServices.length > 0 ? selectedServices.map((s, i) => (
              <div key={i} style={{ marginBottom: '8px', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{s.category}</div>
                {s.subservices.length > 0 && (
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{s.subservices.join(', ')}</div>
                )}
              </div>
            )) : (
              <div style={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic', padding: '8px 0' }}>No services added</div>
            )}

            {(formData.hourlyRate?.min || formData.hourlyRate?.max) && (
              <>
                {sectionTitle('Hourly Rate')}
                {reviewRow('Rate Range', `$${formData.hourlyRate?.min ?? 0} – $${formData.hourlyRate?.max ?? 0} /hr`)}
              </>
            )}

            {sectionTitle('Availability & Coverage')}
            {reviewRow('Availability', formData.availability)}
            {reviewRow('Service Areas', (formData.serviceAreas as string[] | undefined)?.join(', '))}
            {reviewRow('Languages', formData.languages?.join(', '))}

            {sectionTitle('Trust & Safety')}
            {reviewRow('Liability Insurance', formData.insurance === true ? 'Yes' : formData.insurance === false ? 'No' : undefined)}
            {reviewRow('Background Checked', formData.backgroundChecked === true ? 'Yes' : formData.backgroundChecked === false ? 'No' : undefined)}
            {reviewRow('Certifications', formData.certifications?.join(', '))}

            <IonButton expand="block" onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '24px' }}>
              {isSubmitting ? 'Submitting…' : 'Submit and Join as Pro'}
            </IonButton>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="auth-page-content">
        <AuthBackground />
        
        <div className="auth-wrapper">
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
            
            <div className="form-group">
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
              {currentStep < totalSteps && (
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={nextStep}
                  style={{ flex: 2, margin: 0 }}
                  disabled={isSubmitting}
                >
                  Next Step
                </IonButton>
              )}
            </div>
            
            {currentStep < totalSteps && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <IonButton fill="clear" color="medium" size="small" onClick={() => router.push('/profile')}>
                  Cancel
                </IonButton>
              </div>
            )}
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
