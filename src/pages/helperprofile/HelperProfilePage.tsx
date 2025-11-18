import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonText, IonSpinner, IonIcon, IonAvatar, IonButton, IonChip, IonButtons, IonToast } from '@ionic/react';
import { Helper } from '../../models/Helper';
import HelperService from '../../services/HelperService';
import { addOutline, arrowBack, briefcase, chatbubble, logoFacebook, logoLinkedin, logoTwitter, logoWhatsapp, shareOutline, star, time } from 'ionicons/icons';

const HelperProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const cardRef = useRef<HTMLIonCardElement>(null);

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    const fetchHelperDetails = async () => {
      console.log("The id is " + id);

      if (!id) {
        setError('No helper ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const helperService = new HelperService();
        const helperData = await helperService.getHelperById(id);

        if (helperData) {
          setHelper(helperData);
        } else {
          setError('Helper not found');
        }
      } catch (err) {
        console.error('Error fetching helper details:', err);
        setError('Failed to fetch helper details');
      } finally {
        setLoading(false);
      }
    };

    fetchHelperDetails();
  }, [id]);


  const shareOnPlatform = (platform: string) => {
    if (!helper) return;

    const shareText = `Check out ${helper.name}'s profile - ${helper.title}\n\n${helper.description}\n\nRating: ${helper.rating} ⭐`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(window.location.href);

    // Include avatar URL for platforms that support image sharing
    const encodedImage = encodeURIComponent(helper.avatar);
    const encodedName = encodeURIComponent(helper.name);

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        // Twitter supports text, URL, and hashtags
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=HelperProfile`;
        break;

      case 'facebook':
        // Facebook uses Open Graph tags, but we can still share with text
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;

      case 'linkedin':
        // LinkedIn sharing with title and summary
        const linkedinTitle = encodeURIComponent(`${helper.name} - ${helper.title}`);
        const linkedinSummary = encodeURIComponent(helper.description);
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${linkedinTitle}&summary=${linkedinSummary}`;
        break;

      case 'whatsapp':
        // WhatsApp sharing with text and URL
        shareUrl = `https://wa.me/?text=${encodedText}%0A%0AView profile: ${encodedUrl}`;
        break;

      case 'pinterest':
        // Pinterest supports image sharing
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`;
        break;

      default:
        return;
    }
    // Open sharing window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };


  const handleAddHelper = async () => {
    if (!helper) return;
  }
  // Enhanced Web Share API function with better content
  const handleShareHelper = async () => {
    if (!helper) return;

    try {
      const shareData = {
        title: `${helper.name} - ${helper.title}`,
        text: `${helper.description}\n\n⭐ Rating: ${helper.rating}\n💼 ${helper.contact}`,
        url: window.location.href,

      };
      // Try to include files (images) if supported
      if (navigator.share && navigator.canShare) {
        try {
          const imageResponse = await fetch(helper.avatar);
          const blob = await imageResponse.blob();
          const filesArray = [new File([blob], `${helper.name}-avatar.jpg`, { type: 'image/jpeg' })];

          if (navigator.canShare({ files: filesArray })) {
            await navigator.share({
              ...shareData,
              files: filesArray
            });
            return;
          }
        } catch (imageError) {
          console.error('Error fetching or sharing image:', imageError);
          console.log('Image sharing not supported, falling back to text sharing');
        }
      }

      // Standard Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
      }
      // Fallback for desktop browsers
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${window.location.href}`);
        setToastMessage('Profile details copied to clipboard!');
        setShowToast(true);
      }
      // Fallback for older browsers
      else {
        copyToClipboardFallback(`${shareData.title}\n\n${shareData.text}\n\n${window.location.href}`);
        setToastMessage('Profile details copied to clipboard!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setToastMessage('Failed to share. Please try again.');
      setShowToast(true);
    }
  };


  function copyToClipboardFallback(arg0: string) {
    throw new Error('Function not implemented.');
  }

  // Enhanced meta tags generation for better social sharing previews
  const generateMetaTags = () => {
    if (!helper) return null;

    return (
      <>
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={`${helper.name} - ${helper.title}`} />
        <meta property="og:description" content={helper.description} />
        <meta property="og:image" content={helper.avatar} />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="profile" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${helper.name} - ${helper.title}`} />
        <meta name="twitter:description" content={helper.description} />
        <meta name="twitter:image" content={helper.avatar} />
        <meta name="twitter:site" content="@yourplatform" />

        {/* Additional Meta Tags */}
        <meta name="description" content={`${helper.name} - ${helper.title}. ${helper.description}`} />
        <meta name="author" content={helper.name} />
      </>
    );
  };

  // Function to generate a shareable image card (optional)
  const generateShareCard = async (): Promise<string> => {
    if (!helper || !cardRef.current) return '';

    try {
      // This would require html2canvas or similar library
      // For now, we'll use the avatar directly
      return helper.avatar;
    } catch (error) {
      console.error('Error generating share card:', error);
      return helper.avatar; // Fallback to avatar
    }
  };



  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
            <IonText style={{ marginLeft: '10px' }}>Loading helper details...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleGoBack}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="danger">
            <h2>Error</h2>
            <p>{error}</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  if (!helper) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleGoBack}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Helper Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="warning">
            <h2>Helper Not Found</h2>
            <p>The requested helper could not be found.</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleGoBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{helper.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard className="freelancer-card">
          {/* Header with curved banner */}
          <div className="card-header-container">
            <img
              src={helper.banner}
              alt={helper.name}
              className="banner-image"
            />

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
              <IonText className="email">{helper.email}</IonText>
              <IonText className="contact">{helper.contact}</IonText>
            </div>
            {/* Rating badge in top right corner */}
            <div className="header-rating-badge">
              <IonIcon icon={star} className="star-icon" />
              <span className="rating-text">{helper.rating}</span>
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

            <div className="contact-buttons-row">
              <div className="action-buttons-right">
                <IonButton shape="round" fill="clear" className="add-button" onClick={handleAddHelper}>
                  <IonIcon icon={addOutline} />
                </IonButton>
                <IonButton  shape="round" fill="clear" className="share-button" onClick={handleShareHelper}>
                  <IonIcon icon={shareOutline} />
                </IonButton>
              </div>

              <div className="social-sharing-options" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <IonButton
                  shape="round"
                  fill="clear" className="share-button"
                  onClick={() => shareOnPlatform('facebook')}
                  style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                >
                  <IonIcon icon={logoFacebook} size="large" />
                </IonButton>
                <IonButton
                  shape="round"
                  fill="clear" className="share-button"
                  onClick={() => shareOnPlatform('twitter')}
                  style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                >
                  <IonIcon icon={logoTwitter} size="large" />
                </IonButton>
                <IonButton
                  shape="round"
                 fill="clear" className="share-button"
                  onClick={() => shareOnPlatform('linkedin')}
                  style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                >
                  <IonIcon icon={logoLinkedin} size="large" />
                </IonButton>
                <IonButton
                  shape="round"
                  fill="clear" className="share-button"
                  onClick={() => shareOnPlatform('whatsapp')}
                  style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                >
                  <IonIcon icon={logoWhatsapp} size="large" />
                </IonButton>
              </div>

            </div>
          </div>
        </IonCard>
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </IonPage>
  );
};

export default HelperProfilePage;


