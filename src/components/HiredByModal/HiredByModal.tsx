import React from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonAvatar,
} from '@ionic/react';
import { close, star, starOutline } from 'ionicons/icons';
import { Hire } from '../../models/Hire';
import './HiredByModal.css';

interface HiredByModalProps {
  isOpen: boolean;
  helperName: string;
  hires: Hire[];
  onClose: () => void;
}

const HiredByModal: React.FC<HiredByModalProps> = ({ isOpen, helperName, hires, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0, 0.65, 1]} initialBreakpoint={0.65}>
      <IonHeader className="ion-no-border">
        <IonToolbar className="hbm-toolbar">
          <IonTitle className="hbm-title">Who hired {helperName}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="hbm-content">
        {hires.length === 0 ? (
          <div className="hbm-empty">
            <p>No contacts have hired this helper yet.</p>
            <p>Be the first! 🎉</p>
          </div>
        ) : (
          <div className="hbm-list">
            {hires.map((hire) => (
              <div key={hire.id} className="hbm-item">
                <IonAvatar className="hbm-avatar">
                  <img
                    src={hire.userAvatar || 'https://www.gravatar.com/avatar?d=mp'}
                    alt={hire.userDisplayName}
                  />
                </IonAvatar>

                <div className="hbm-info">
                  <p className="hbm-name">{hire.userDisplayName}</p>
                  <div className="hbm-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <IonIcon
                        key={s}
                        icon={s <= hire.rating ? star : starOutline}
                        className={`hbm-star ${s <= hire.rating ? 'filled' : ''}`}
                      />
                    ))}
                    <span className="hbm-rating-num">{hire.rating.toFixed(1)}</span>
                  </div>
                  {hire.experience && (
                    <p className="hbm-experience">"{hire.experience}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default HiredByModal;
