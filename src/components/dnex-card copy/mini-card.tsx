import React from 'react';
import { 
  IonCard, 
  IonCardContent, 
  IonAvatar, 
  IonButton, 
  IonIcon, 
  IonText 
} from '@ionic/react';
import { heartOutline, addOutline, star } from 'ionicons/icons';
import './mini-card.css';

const MiniCard = () => {
  return (
    <IonCard className="mini-card">
      {/* Header with curved banner */}
      <div className="card-header-container">
        <img 
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=150&fit=crop&crop=center" 
          alt="banner" 
          className="banner-image"
        />
        
        {/* Rating badge in top right corner */}
        <div className="header-rating-badge">
          <IonIcon icon={star} className="star-icon" />
          <span className="rating-text">Jitter Expert +6</span>
        </div>
        
        <div className="avatar-container">
          <IonAvatar className="profile-avatar">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
              alt="Alexander Ross" 
            />
          </IonAvatar>
        </div>
      </div>

      {/* Name section only */}
      <div className="name-action-row">
        <div className="name-section">
          <IonText className="name">Alexander Ross</IonText>
          <IonText className="designation">Motion designer</IonText>
        </div>
      </div>

      {/* Stats section - description removed */}
      <IonCardContent className="stats-content">

      </IonCardContent>

      
    </IonCard>
  );
};

export default MiniCard;
