import React from 'react';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardContent, 
  IonAvatar, 
  IonButton, 
  IonIcon, 
  IonText,
  IonBadge,
  IonChip,
  useIonRouter
} from '@ionic/react';
import {  addOutline, star, briefcase, school, globe, time, chatbubble, shareOutline } from 'ionicons/icons';
import './card.css';
import { Helper } from '../../models/Helper';

interface CardProps {
    helper: Helper
    onClick: (helper: Helper) => void;
    onClose: (helperId: string) => void;
}

const Card: React.FC<CardProps> = ({helper, onClick, onClose}) => {
   const router = useIonRouter();

  const handleVisitPage = () => {
    // Navigate to helper profile page with helper data
    console.log("Id is "+helper.id);
    router.push(`/helper-profile/${helper.id}`);
    onClose(helper.id);
  };

  const handleAddHelper = () => {
    // Navigate to helper profile page with helper data
    console.log("Id is "+helper.id);
    
  };

  const handleShareHelper = () => {
    // Navigate to helper profile page with helper data
    console.log("Id is "+helper.id);
    
  };

  
  return (
    <IonCard className="freelancer-card">
      {/* Header with curved banner */}
      <div className="card-header-container">
        <img 
          src={helper.banner}
          alt={helper.name}
          className="banner-image"
        />
        
        {/* Rating badge in top right corner */}
        <div className="header-rating-badge">
          <IonIcon icon={star} className="star-icon" />
          <span className="rating-text">{helper.rating}</span>
        </div>
        
        <div className="avatar-container">
          <IonAvatar className="profile-avatar">
            <img 
              src={helper.avatar}
              alt={helper.name}
            />
          </IonAvatar>
        </div>
      </div>

      {/* Name section only */}
      <div className="name-action-row">
        <div className="name-section">
          <IonText className="name">{helper.name}</IonText>
          <IonText className="designation">{helper.title}</IonText>
        </div>
      </div>

      {/* Stats section */}
      <IonCardContent className="stats-content">
        <div className="stats-desc"><p className="truncate-3-lines">{helper.description} </p></div>
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
        <div className="contact-section">
        <div className="contact-buttons-row">
          <IonButton className="contact-button" onClick={handleVisitPage}>
            Visit Page 
          </IonButton>
          <div className="action-buttons-right">
            <IonButton fill="clear" className="add-button" onClick={handleAddHelper}>
              <IonIcon icon={addOutline} />
            </IonButton>
            <IonButton fill="clear" className="share-button" onClick={handleShareHelper}>
              <IonIcon icon={shareOutline} />
            </IonButton>
          </div>
        </div>
      </div>
      </IonCardContent>

      {/* Contact section with all buttons aligned left and right */}
      

      {/* NEW SECTIONS - Scrollable content area */}
      <div className="scrollable-content">
        
        {/* Skills Section */}
        <div className="additional-section">
          <div className="section-header">
            <IonIcon icon={briefcase} className="section-icon" />
            <IonText className="section-title">Skills & Expertise</IonText>
          </div>
          <div className="skills-grid">
            {helper.tags?.slice(0, 6).map((tag, index) => (
              <IonChip key={index} className="skill-chip">
                {tag}
              </IonChip>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="additional-section">
          <div className="section-header">
            <IonIcon icon={time} className="section-icon" />
            <IonText className="section-title">Experience</IonText>
          </div>
          <div className="experience-list">
            {helper.tags?.slice(0, 3).map((tag, index) => (
              <div key={index} className="experience-item">
                <IonText className="exp-role">A</IonText>
                <IonText className="exp-company">B</IonText>
                <IonText className="exp-duration">C</IonText>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="additional-section">
          <div className="section-header">
            <IonIcon icon={school} className="section-icon" />
            <IonText className="section-title">Education</IonText>
          </div>
          <div className="education-list">
            EDucation
          </div>
        </div>

        {/* Languages Section */}
        <div className="additional-section">
          <div className="section-header">
            <IonIcon icon={globe} className="section-icon" />
            <IonText className="section-title">Languages</IonText>
          </div>
          <div className="languages-list">
            {/* {helper.languages?.map((lang, index) => (
              <div key={index} className="language-item">
                <IonText className="lang-name">{lang.name}</IonText>
                <IonBadge className="lang-level">{lang.level}</IonBadge>
              </div>
            ))} */}
          </div>
        </div>

        {/* Recent Reviews Section */}
        <div className="additional-section">
          <div className="section-header">
            <IonIcon icon={chatbubble} className="section-icon" />
            <IonText className="section-title">Recent Reviews</IonText>
          </div>
          <div className="reviews-list">
            {helper.reviews?.slice(0, 2).map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <IonText className="reviewer-name">Review</IonText>
                  <div className="review-rating">
                    <IonIcon icon={star} className="small-star" />
                    <IonText>{review.rating}</IonText>
                  </div>
                </div>
                <IonText className="review-text">{review.comment}</IonText>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IonCard>
  );
};

export default Card;
