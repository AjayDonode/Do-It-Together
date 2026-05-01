import React, { useState } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonTextarea, IonFooter,
} from '@ionic/react';
import { close, star, starOutline } from 'ionicons/icons';
import { Hire } from '../../models/Hire';
import './HireModal.css';

interface HireModalProps {
  isOpen: boolean;
  helperName: string;
  existingHire?: Hire | null;
  onClose: () => void;
  onSubmit: (rating: number, experience: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const HireModal: React.FC<HireModalProps> = ({
  isOpen, helperName, existingHire, onClose, onSubmit, onDelete,
}) => {
  const [rating, setRating] = useState(existingHire?.rating ?? 0);
  const [experience, setExperience] = useState(existingHire?.experience ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      await onSubmit(rating, experience);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.75, 1]} initialBreakpoint={0.75}>
      <IonHeader className="ion-no-border">
        <IonToolbar className="hire-modal-toolbar">
          <IonTitle className="hire-modal-title">
            {existingHire ? 'Update Your Review' : 'Rate Your Experience'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="hire-modal-content">
        <div className="hire-helper-label">
          <p>How was your experience with</p>
          <h2>{helperName}?</h2>
        </div>

        {/* Star rating */}
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} className="star-btn" onClick={() => setRating(s)}>
              <IonIcon
                icon={s <= rating ? star : starOutline}
                className={`star-pick ${s <= rating ? 'filled' : ''}`}
              />
            </button>
          ))}
        </div>
        <p className="star-label">
          {rating === 0 ? 'Tap to rate' :
           rating === 1 ? '😞 Poor' :
           rating === 2 ? '😕 Fair' :
           rating === 3 ? '😊 Good' :
           rating === 4 ? '😃 Great' : '🤩 Excellent!'}
        </p>

        {/* Experience text */}
        <div className="experience-wrap">
          <IonTextarea
            className="experience-input"
            placeholder="Share your experience — what did they do well? Would you hire again?"
            value={experience}
            onIonInput={(e) => setExperience(e.detail.value ?? '')}
            rows={4}
            autoGrow
          />
        </div>
      </IonContent>

      <IonFooter className="ion-no-border hire-modal-footer">
        <IonButton
          expand="block"
          className="hire-submit-btn"
          disabled={rating === 0 || saving}
          onClick={handleSubmit}
        >
          {saving ? 'Saving…' : existingHire ? 'Update Review' : '✓ Mark as Hired & Submit'}
        </IonButton>
        {existingHire && onDelete && (
          <IonButton
            expand="block"
            fill="clear"
            color="danger"
            className="hire-delete-btn"
            disabled={saving}
            onClick={handleDelete}
          >
            Remove my hire record
          </IonButton>
        )}
      </IonFooter>
    </IonModal>
  );
};

export default HireModal;
