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

const MiniCard: React.FC<CardProps> = ({ helper, onClick }) => {
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
      <div className="m-action-row">
        <div className="name-section">
          <IonText className="m-name">{helper.name}</IonText>
          <IonText className="m-designation">{helper.title}</IonText>
          {/* Wrap rating badge in a container */}
          <div className="m-rating-badge-container">
            <div className="m-rating-badge">
              <IonIcon icon={star} className="star-icon" />
              <span className="rating-text">4</span>
            </div>
          </div>
        </div>

      </div>

      {/* Stats section - description removed */}
      <IonCardContent className="m-content">
        test content here
      </IonCardContent>
    </IonCard>
  );
};

export default MiniCard;
