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
import './card.css';

const Card = () => {
  return (
    <IonCard className="freelancer-card">
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

      {/* Stats section */}
      <IonCardContent className="stats-content">
        <div className="stats-desc"><p className="truncate-3-lines"> Description here for long text it need to be wrapped or displayed.
            Description here for long text it need to be wrapped or displayed
            Description here for long text it need to be wrapped or displayed
            Description here for long text it need to be wrapped or displayed </p></div>
        <div className="stats-grid">
          <div className="stat-item">
            <IonText className="stat-value">4.9</IonText>
            <IonText className="stat-label">rating</IonText>
          </div>
          <div className="stat-item">
            <IonText className="stat-value">$35k+</IonText>
            <IonText className="stat-label">earned</IonText>
          </div>
          <div className="stat-item">
            <IonText className="stat-value">$45/hr</IonText>
            <IonText className="stat-label">rate</IonText>
          </div>
        </div>
      </IonCardContent>

      {/* Contact section with all buttons aligned left and right */}
      <div className="contact-section">
        <div className="contact-buttons-row">
          <IonButton className="contact-button">
            Get In Touch
          </IonButton>
          <div className="action-buttons-right">
            <IonButton fill="clear" className="like-button">
              <IonIcon icon={heartOutline} />
            </IonButton>
            <IonButton fill="clear" className="add-button">
              <IonIcon icon={addOutline} />
            </IonButton>
          </div>
        </div>
      </div>
    </IonCard>
  );
};

export default Card;
