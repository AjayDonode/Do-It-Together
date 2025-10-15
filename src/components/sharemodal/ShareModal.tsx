import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import {
  shareSocialOutline,
  logoFacebook,
  logoTwitter,
  logoLinkedin,
  logoWhatsapp,
  copyOutline,
  closeOutline
} from 'ionicons/icons';
import { Helper } from '../../models/Helper';


interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: Helper | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, helper }) => {
  const handleWebShare = async () => {
    if (!helper) return;
    
    try {
      const shareData = {
        title: `${helper.name} - ${helper.title}`,
        text: `Check out ${helper.name}, a ${helper.title} available on Do it To!`,
        url: `${window.location.origin}/helper/${helper.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        onClose();
      } else {
        await copyToClipboard();
      }
    } catch (error) {
      console.error('Web share error:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!helper) return;
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/helper/${helper.id}`);
      alert('Link copied to clipboard!');
      onClose();
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Could not copy to clipboard.');
    }
  };

  const shareOnPlatform = (platform: string) => {
    if (!helper) return;
    
    const shareUrl = `${window.location.origin}/helper/${helper.id}`;
    const shareText = `Check out ${helper.name}, a ${helper.title} available on Do it To!`;
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
    onClose();
  };

  if (!helper) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="social-share-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Share {helper.name}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonText>
            <h3>Share this helper profile</h3>
          </IonText>
          
          <IonGrid>
            <IonRow className="social-share-buttons">
              <IonCol size="3">
                <IonButton 
                  fill="clear" 
                  className="facebook-button"
                  onClick={() => shareOnPlatform('facebook')}
                >
                  <IonIcon icon={logoFacebook} />
                </IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton 
                  fill="clear" 
                  className="twitter-button"
                  onClick={() => shareOnPlatform('twitter')}
                >
                  <IonIcon icon={logoTwitter} />
                </IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton 
                  fill="clear" 
                  className="linkedin-button"
                  onClick={() => shareOnPlatform('linkedin')}
                >
                  <IonIcon icon={logoLinkedin} />
                </IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton 
                  fill="clear" 
                  className="whatsapp-button"
                  onClick={() => shareOnPlatform('whatsapp')}
                >
                  <IonIcon icon={logoWhatsapp} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

          <div className="ion-margin-top">
            <IonButton expand="block" onClick={handleWebShare}>
              <IonIcon icon={shareSocialOutline} slot="start" />
              Share via...
            </IonButton>
            
            <IonButton expand="block" fill="outline" onClick={copyToClipboard}>
              <IonIcon icon={copyOutline} slot="start" />
              Copy Link
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ShareModal;
