import React from 'react';
import { 
  IonCard, 
  IonCardContent, 
  IonAvatar, 

  IonIcon, 
  IonText 
} from '@ionic/react';
import { heartOutline, addOutline, star } from 'ionicons/icons';
import './mini-card.css';
import { Helper } from '../../models/Helper';


interface CardProps {
    // cardItem: Object;
    helper: Helper
    onClick: (helper: Helper) => void; // Add a prop for click event
}

const MiniCard: React.FC<CardProps> = ({helper , onClick}) => {
  return (
    <IonCard className="mini-card" onClick={() => onClick(helper)}>
      {/* Header with curved banner */}
      <div className="card-header-container">
        <img 
          src={helper.avatar}
          alt="banner" 
          className="banner-image"
        />
        
        {/* Rating badge in top right corner */}
        <div className="header-rating-badge">
          <IonIcon icon={star} className="star-icon" />
          <span className="rating-text">Jitter Expert +6</span>
        </div>
        
        {/* <div className="avatar-container">
          <IonAvatar className="profile-avatar">
            <img 
              src={helper.avatar}
              alt={helper.name}
            />
          </IonAvatar>
        </div> */}
      </div>

      {/* Name section only */}
      <div className="name-action-row">
        <div className="name-section">
          <IonText className="name">{helper.name}</IonText>
          <IonText className="designation">{helper.title}</IonText>
        </div>
      </div>

      {/* Stats section - description removed */}
      <IonCardContent className="stats-content">
          test content here 
      </IonCardContent>
    </IonCard>
  );
};

export default MiniCard;
