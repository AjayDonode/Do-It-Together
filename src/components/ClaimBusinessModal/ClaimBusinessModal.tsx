import React, { useState, useRef, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButton, IonButtons, IonIcon, IonInput, IonTextarea, IonLabel,
  IonSpinner, IonProgressBar,
} from '@ionic/react';
import {
  close, chevronBackOutline, chevronForwardOutline,
  imageOutline, trashOutline, checkmarkCircle,
} from 'ionicons/icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import './ClaimBusinessModal.css';

interface ClaimBusinessModalProps {
  isOpen: boolean;
  helperId: string;
  helperName: string;
  prefill: {
    description?: string;
    hours?: string;
    website?: string;
    contact?: string;
    address?: string;
  };
  currentUserId: string;
  onClose: () => void;
  onClaimed: () => void; // refresh parent
}

const STEPS = ['Business Info', 'Showcase Photos', 'Review & Submit'];

const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({
  isOpen, helperId, helperName, prefill, currentUserId, onClose, onClaimed,
}) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 — business info
  const [description, setDescription] = useState(prefill.description ?? '');
  const [hours, setHours] = useState(prefill.hours ?? '');
  const [website, setWebsite] = useState(prefill.website ?? '');
  const [contact, setContact] = useState(prefill.contact ?? '');
  const [address, setAddress] = useState(prefill.address ?? '');

  // Sync prefill every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription(prefill.description ?? '');
      setHours(prefill.hours ?? '');
      setWebsite(prefill.website ?? '');
      setContact(prefill.contact ?? '');
      setAddress(prefill.address ?? '');
      setStep(0);
      setDone(false);
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2 — images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const storageRef = ref(storage, `helpers/${helperId}/showcase/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const showcaseImages = await uploadImages();
      await updateDoc(doc(db, 'helpers', helperId), {
        claimed: true,
        claimedByUserId: currentUserId,
        claimedAt: serverTimestamp(),
        description: description || undefined,
        hours: hours || undefined,
        website: website || undefined,
        contact: contact || undefined,
        address: address || undefined,
        ...(showcaseImages.length > 0 && { showcaseImages }),
      });
      setDone(true);
      setTimeout(() => {
        onClaimed();
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Claim error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setDone(false);
    setSaving(false);
    onClose();
  };

  const canNext = () => {
    if (step === 0) return description.trim().length > 0;
    return true;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} breakpoints={[0, 1]} initialBreakpoint={1}>
      <IonHeader className="ion-no-border cbm-header">
        <IonToolbar className="cbm-toolbar">
          <IonButtons slot="start">
            {step > 0 && !done && (
              <IonButton fill="clear" onClick={() => setStep(s => s - 1)}>
                <IonIcon icon={chevronBackOutline} />
              </IonButton>
            )}
          </IonButtons>
          <IonTitle className="cbm-title">Claim "{helperName}"</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Step progress bar */}
        {!done && (
          <div className="cbm-steps">
            <IonProgressBar value={(step) / (STEPS.length - 1)} color="secondary" />
            <div className="cbm-step-labels">
              {STEPS.map((label, i) => (
                <span key={label} className={`cbm-step-label ${i <= step ? 'active' : ''}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </IonHeader>

      <IonContent className="cbm-content">
        {/* ── Success state ── */}
        {done && (
          <div className="cbm-success">
            <IonIcon icon={checkmarkCircle} className="cbm-success-icon" />
            <h2>Business Claimed!</h2>
            <p>Your profile is now verified and messaging is enabled.</p>
          </div>
        )}

        {/* ── Step 0: Business Info ── */}
        {!done && step === 0 && (
          <div className="cbm-form">
            <p className="cbm-section-hint">
              Fill in your business details. Fields already imported from Yelp are pre-filled — update anything that's incorrect.
            </p>

            <div className="cbm-field">
              <IonLabel className="cbm-label">Business Description *</IonLabel>
              <IonTextarea
                className="cbm-textarea"
                placeholder="Tell customers about your services, experience, and what makes you stand out…"
                value={description}
                onIonInput={e => setDescription(e.detail.value ?? '')}
                rows={4}
                autoGrow
              />
            </div>

            <div className="cbm-field">
              <IonLabel className="cbm-label">Business Hours</IonLabel>
              <IonInput
                className="cbm-input"
                placeholder="e.g. Mon–Fri 8AM–6PM, Sat 9AM–3PM"
                value={hours}
                onIonInput={e => setHours(e.detail.value ?? '')}
              />
            </div>

            <div className="cbm-field">
              <IonLabel className="cbm-label">Address</IonLabel>
              <IonInput
                className="cbm-input"
                placeholder="123 Main St, San Jose, CA 95101"
                value={address}
                onIonInput={e => setAddress(e.detail.value ?? '')}
              />
            </div>

            <div className="cbm-field">
              <IonLabel className="cbm-label">Phone / Contact</IonLabel>
              <IonInput
                className="cbm-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contact}
                onIonInput={e => setContact(e.detail.value ?? '')}
              />
            </div>

            <div className="cbm-field">
              <IonLabel className="cbm-label">Website</IonLabel>
              <IonInput
                className="cbm-input"
                type="url"
                placeholder="https://yourbusiness.com"
                value={website}
                onIonInput={e => setWebsite(e.detail.value ?? '')}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Showcase Photos ── */}
        {!done && step === 1 && (
          <div className="cbm-form">
            <p className="cbm-section-hint">
              Add up to <strong>5 photos</strong> showcasing your work. Great photos build trust and attract more customers!
            </p>

            <div className="cbm-photo-grid">
              {imagePreviews.map((src, i) => (
                <div key={i} className="cbm-photo-slot filled">
                  <img src={src} alt={`Showcase ${i + 1}`} className="cbm-photo-img" />
                  <button className="cbm-photo-remove" onClick={() => removeImage(i)}>
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <div className="cbm-photo-slot empty" onClick={() => fileInputRef.current?.click()}>
                  <IonIcon icon={imageOutline} className="cbm-photo-add-icon" />
                  <span>Add photo</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImagePick}
            />

            {imageFiles.length > 0 && (
              <p className="cbm-photo-count">
                {imageFiles.length} of 5 photos selected
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {!done && step === 2 && (
          <div className="cbm-form">
            <p className="cbm-section-hint">
              Review your information before submitting. Once claimed, your profile will be verified immediately.
            </p>

            <div className="cbm-review-row"><span>Description</span><p>{description || '—'}</p></div>
            <div className="cbm-review-row"><span>Hours</span><p>{hours || '—'}</p></div>
            <div className="cbm-review-row"><span>Address</span><p>{address || '—'}</p></div>
            <div className="cbm-review-row"><span>Contact</span><p>{contact || '—'}</p></div>
            <div className="cbm-review-row"><span>Website</span><p>{website || '—'}</p></div>
            <div className="cbm-review-row"><span>Photos</span><p>{imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''}</p></div>

            {imageFiles.length > 0 && (
              <div className="cbm-review-photos">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="cbm-review-thumb" />
                ))}
              </div>
            )}
          </div>
        )}
      </IonContent>

      {!done && (
        <IonFooter className="ion-no-border cbm-footer">
          {step < STEPS.length - 1 ? (
            <IonButton
              expand="block"
              className="cbm-next-btn"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              Next
              <IonIcon icon={chevronForwardOutline} slot="end" />
            </IonButton>
          ) : (
            <IonButton
              expand="block"
              className="cbm-next-btn"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? <><IonSpinner name="dots" style={{ marginRight: 8 }} /> Uploading…</> : '✓ Claim this Business'}
            </IonButton>
          )}
        </IonFooter>
      )}
    </IonModal>
  );
};

export default ClaimBusinessModal;
