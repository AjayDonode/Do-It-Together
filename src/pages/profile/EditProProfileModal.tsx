import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonList, IonText, IonSpinner, IonToast,
} from '@ionic/react';
import { close, checkmarkOutline, searchOutline, addCircleOutline, trashOutline } from 'ionicons/icons';
import { ProDetails, Service } from '../../models/Helper';
import UserProfileService from '../../services/UserProfileService';
import { UserProfile } from '../../models/UserProfile';
import { expandServiceAreas } from '../../utils/locationUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  existingProfile: UserProfile;
  onSaved: (updated: UserProfile) => void;
}

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

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'Hindi', 'Mandarin', 'Other'];

const EditProProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUserId, existingProfile, onSaved }) => {
  const pd = existingProfile.proDetails;

  // ── Form state ──
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [availability, setAvailability] = useState('');
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<boolean>(false);
  const [backgroundChecked, setBackgroundChecked] = useState<boolean>(false);
  const [certifications, setCertifications] = useState('');

  // Service areas typeahead
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<string[]>([]);
  const [showAddArea, setShowAddArea] = useState(false);

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState('');

  // UI
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Pre-fill on open
  useEffect(() => {
    if (!isOpen || !pd) return;
    setCompanyName(pd.companyName || '');
    setBio(pd.bio || '');
    setWebsiteUrl(pd.websiteUrl || '');
    setAvailability(pd.availability || '');
    setRateMin(String(pd.hourlyRate?.min ?? ''));
    setRateMax(String(pd.hourlyRate?.max ?? ''));
    setLanguages(pd.languages || []);
    setInsurance(pd.insurance ?? false);
    setBackgroundChecked(pd.backgroundChecked ?? false);
    setCertifications((pd.certifications || []).join(', '));
    // Pre-fill from rawServiceAreas (the original user input), not the expanded index
    setServiceAreas(pd.rawServiceAreas ?? pd.serviceAreas ?? []);
    setServices(pd.services || []);
    // reset input state
    setAreaInput('');
    setFilteredAreas([]);
    setShowAddArea(false);
    setNewServiceName('');
  }, [isOpen, pd]);

  // ── Area typeahead ──
  const handleAreaInput = (val: string) => {
    setAreaInput(val);
    if (!val.trim()) { setFilteredAreas([]); setShowAddArea(false); return; }
    const lower = val.trim().toLowerCase();
    const alreadyAdded = serviceAreas.map(a => a.toLowerCase());
    const matches = KNOWN_AREAS.filter(a => a.toLowerCase().includes(lower) && !alreadyAdded.includes(a.toLowerCase()));
    setFilteredAreas(matches);
    const hasExact = KNOWN_AREAS.some(a => a.toLowerCase() === lower);
    setShowAddArea(!hasExact && val.trim().length > 1);
  };

  const selectArea = (area: string) => {
    if (!serviceAreas.map(a => a.toLowerCase()).includes(area.toLowerCase())) {
      setServiceAreas(prev => [...prev, area]);
    }
    setAreaInput(''); setFilteredAreas([]); setShowAddArea(false);
  };

  const removeArea = (area: string) => setServiceAreas(prev => prev.filter(a => a !== area));

  // ── Services ──
  const addService = () => {
    if (!newServiceName.trim()) return;
    const svc: Service = { id: `svc-${Date.now()}`, name: newServiceName.trim(), subcategories: [] };
    setServices(prev => [...prev, svc]);
    setNewServiceName('');
  };

  const removeService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  // ── Save ──
  const handleSave = async () => {
    if (!companyName.trim()) { setToast('Company name is required.'); setToastColor('danger'); return; }
    setSaving(true);
    try {
      const expandedAreas = expandServiceAreas(serviceAreas);

      const updatedProDetails: ProDetails = {
        companyName: companyName.trim(),
        bio: bio.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        rawServiceAreas: serviceAreas,   // original user input
        serviceAreas: expandedAreas,     // expanded search index
        services,
        yearsInBusiness: pd?.yearsInBusiness ?? 0,
        hourlyRate: rateMin || rateMax
          ? { min: Number(rateMin) || 0, max: Number(rateMax) || 0 }
          : undefined,
        availability: availability.trim(),
        languages,
        insurance,
        certifications: certifications.split(',').map(c => c.trim()).filter(Boolean),
        backgroundChecked,
      };

      const updatedProfile: UserProfile = {
        ...existingProfile,
        proDetails: updatedProDetails,
      };

      await UserProfileService.updateUserProfile(currentUserId, updatedProfile);
      onSaved(updatedProfile);
      setToast('Business profile updated!');
      setToastColor('success');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error(err);
      setToast('Failed to save. Please try again.');
      setToastColor('danger');
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── JSX ─────────────────── */
  const sectionLabel = (text: string) => (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff385c', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '16px 16px 6px', borderBottom: '2px solid rgba(255,56,92,0.1)', marginBottom: '4px' }}>
      {text}
    </div>
  );

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Business Profile</IonTitle>
            <IonButton slot="end" fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {/* ── Business Info ── */}
          {sectionLabel('Business Info')}
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Company Name *</IonLabel>
            <IonInput value={companyName} onIonInput={e => setCompanyName(e.detail.value || '')} placeholder="e.g. Acme Plumbing" />
          </IonItem>
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Bio / Description</IonLabel>
            <IonInput value={bio} onIonInput={e => setBio(e.detail.value || '')} placeholder="Tell customers about your business" />
          </IonItem>
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Website URL</IonLabel>
            <IonInput value={websiteUrl} onIonInput={e => setWebsiteUrl(e.detail.value || '')} type="url" placeholder="https://yoursite.com" />
          </IonItem>

          {/* ── Services ── */}
          {sectionLabel('Services')}
          {services.map(s => (
            <IonItem key={s.id} lines="none">
              <IonLabel>{s.name}</IonLabel>
              <IonButton slot="end" fill="clear" color="danger" onClick={() => removeService(s.id)}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonInput
              value={newServiceName}
              onIonInput={e => setNewServiceName(e.detail.value || '')}
              onKeyDown={e => { if (e.key === 'Enter') addService(); }}
              placeholder="Add a service (e.g. Leak Repair)"
            />
            <IonButton slot="end" fill="clear" onClick={addService} disabled={!newServiceName.trim()}>
              <IonIcon icon={addCircleOutline} />
            </IonButton>
          </IonItem>

          {/* ── Service Areas ── */}
          {sectionLabel('Service Areas')}
          <div style={{ position: 'relative' }}>
            <IonItem lines="none">
              <IonIcon icon={searchOutline} style={{ marginRight: '8px', color: '#888' }} />
              <IonInput
                value={areaInput}
                onIonInput={e => handleAreaInput(e.detail.value || '')}
                placeholder="Search city or zip code…"
              />
              {showAddArea && (
                <IonButton slot="end" fill="clear" size="small" onClick={() => selectArea(areaInput.trim())}>
                  <IonIcon icon={checkmarkOutline} />
                </IonButton>
              )}
            </IonItem>

            {/* Dropdown */}
            {(filteredAreas.length > 0 || showAddArea) && areaInput && (
              <IonList style={{
                position: 'absolute', zIndex: 30, background: 'white',
                border: '1px solid #e0e0e0', borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                maxHeight: '200px', overflowY: 'auto',
                width: 'calc(100% - 32px)', left: '16px',
              }}>
                {filteredAreas.map(area => (
                  <IonItem key={area} button onClick={() => selectArea(area)} lines="none">
                    <IonLabel style={{ fontSize: '14px' }}>{area}</IonLabel>
                  </IonItem>
                ))}
                {showAddArea && (
                  <IonItem button onClick={() => selectArea(areaInput.trim())} lines="none" style={{ borderTop: '1px solid #f0f0f0' }}>
                    <IonIcon icon={checkmarkOutline} slot="start" color="primary" />
                    <IonLabel color="primary" style={{ fontSize: '14px' }}>Add "{areaInput.trim()}"</IonLabel>
                  </IonItem>
                )}
              </IonList>
            )}
          </div>

          {/* Area chips */}
          {serviceAreas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px' }}>
              {serviceAreas.map(area => (
                <div key={area} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,56,92,0.10)', color: '#ff385c',
                  borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: 500,
                }}>
                  {area}
                  <span onClick={() => removeArea(area)} style={{ cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>×</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Availability & Rate ── */}
          {sectionLabel('Availability & Rates')}
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Availability</IonLabel>
            <IonInput value={availability} onIonInput={e => setAvailability(e.detail.value || '')} placeholder="e.g. Mon-Fri 8AM-5PM" />
          </IonItem>
          <div style={{ display: 'flex', gap: '12px', padding: '0 16px 8px' }}>
            <div style={{ flex: 1 }}>
              <IonItem lines="none">
                <IonLabel position="stacked">Min Rate ($/hr)</IonLabel>
                <IonInput type="number" value={rateMin} onIonInput={e => setRateMin(e.detail.value || '')} placeholder="0" />
              </IonItem>
            </div>
            <div style={{ flex: 1 }}>
              <IonItem lines="none">
                <IonLabel position="stacked">Max Rate ($/hr)</IonLabel>
                <IonInput type="number" value={rateMax} onIonInput={e => setRateMax(e.detail.value || '')} placeholder="0" />
              </IonItem>
            </div>
          </div>

          {/* ── Trust & Safety ── */}
          {sectionLabel('Trust & Safety')}
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Languages Spoken</IonLabel>
            <IonSelect multiple value={languages} onIonChange={e => setLanguages(e.detail.value)}>
              {LANGUAGE_OPTIONS.map(l => <IonSelectOption key={l} value={l}>{l}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Liability Insurance</IonLabel>
            <IonSelect value={String(insurance)} onIonChange={e => setInsurance(e.detail.value === 'true')}>
              <IonSelectOption value="true">Yes</IonSelectOption>
              <IonSelectOption value="false">No</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="none" style={{ marginBottom: '8px' }}>
            <IonLabel position="stacked">Background Checked</IonLabel>
            <IonSelect value={String(backgroundChecked)} onIonChange={e => setBackgroundChecked(e.detail.value === 'true')}>
              <IonSelectOption value="true">Yes</IonSelectOption>
              <IonSelectOption value="false">No</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines="none" style={{ marginBottom: '16px' }}>
            <IonLabel position="stacked">Certifications (comma-separated)</IonLabel>
            <IonInput value={certifications} onIonInput={e => setCertifications(e.detail.value || '')} placeholder="e.g. Licensed Plumber, OSHA 30" />
          </IonItem>
        </IonContent>

        <IonFooter>
          <div style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
            <IonButton expand="block" fill="outline" color="medium" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </IonButton>
            <IonButton expand="block" color="primary" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
              {saving ? <IonSpinner name="dots" style={{ width: 20, height: 20 }} /> : 'Save Changes'}
            </IonButton>
          </div>
        </IonFooter>
      </IonModal>

      <IonToast
        isOpen={!!toast}
        message={toast ?? ''}
        duration={2500}
        color={toastColor}
        onDidDismiss={() => setToast(null)}
      />
    </>
  );
};

export default EditProProfileModal;
