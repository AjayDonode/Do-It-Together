import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
  IonText, IonSpinner, IonIcon, IonAvatar, IonButton, IonChip, IonButtons,
  IonToast, IonModal, IonList, IonItem, IonLabel, IonInput
} from '@ionic/react';
import { Helper } from '../../models/Helper';
import * as HelperService from '../../services/HelperService';
import { addOutline, arrowBack, briefcase, chatbubble, checkmark, close, shareOutline, star } from 'ionicons/icons';
import { CardHolder } from '../../models/CardHolder';
import { addHelperToCardHolder, getCardHolders, createCardHolder } from '../../services/CardHolderService';
import { useAuth } from '../../context/AuthContext';

const HelperProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [helper, setHelper] = useState<Helper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [cardHolders, setCardHolders] = useState<CardHolder[]>([]);
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCardHolderName, setNewCardHolderName] = useState('');
  const [isAddingCardHolder, setIsAddingCardHolder] = useState(false);

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    const fetchHelperDetails = async () => {
      if (!id) {
        setError('No helper ID provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const helperData = await HelperService.getHelperById(id);
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

  useEffect(() => {
    const fetchCardHolders = async () => {
      if (currentUser) {
        const holders = await getCardHolders(currentUser.uid);
        setCardHolders(holders);
      }
    };
    if (currentUser) {
      fetchCardHolders();
    }
  }, [currentUser, isModalOpen]);

  const handleAddToExistingHolder = async (cardHolderId: string) => {
    if (!helper) return;
    try {
      await addHelperToCardHolder(cardHolderId, helper.id);
      setToastMessage(`Helper added successfully!`);
      setShowToast(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding helper to card holder:", error);
      setToastMessage('Failed to add helper.');
      setShowToast(true);
    }
  };

  const handleCreateAndAdd = async () => {
    if (newCardHolderName.trim() !== '' && currentUser && helper) {
      try {
        const newHolder = await createCardHolder(currentUser.uid, newCardHolderName);
        await addHelperToCardHolder(newHolder.id, helper.id);

        setToastMessage(`Helper added to new collection: ${newCardHolderName}`);
        setShowToast(true);

        // Reset and close
        setNewCardHolderName('');
        setIsAddingCardHolder(false);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error creating new collection:", error);
        setToastMessage('Failed to create collection.');
        setShowToast(true);
      }
    }
  };

  const openAddToCollectionModal = () => {
    setIsAddingCardHolder(false);
    setNewCardHolderName('');
    setIsModalOpen(true);
  };

  const handleShareHelper = async () => {
    if (!helper) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${helper.name} - ${helper.title}`,
          text: `${helper.description}\n\n⭐ Rating: ${helper.rating}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
        setToastMessage('Web Share API not supported in your browser.');
        setShowToast(true);
    }
  };

  if (loading) {
    return <IonPage><IonContent className="ion-padding"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><IonSpinner /><IonText style={{ marginLeft: '10px' }}>Loading...</IonText></div></IonContent></IonPage>;
  }

  if (error) {
    return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonButton onClick={handleGoBack}><IonIcon icon={arrowBack} /></IonButton></IonButtons><IonTitle>Error</IonTitle></IonToolbar></IonHeader><IonContent className="ion-padding"><IonText color="danger"><h2>Error</h2><p>{error}</p></IonText></IonContent></IonPage>;
  }

  if (!helper) {
    return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonButton onClick={handleGoBack}><IonIcon icon={arrowBack} /></IonButton></IonButtons><IonTitle>Not Found</IonTitle></IonToolbar></IonHeader><IonContent className="ion-padding"><IonText color="warning"><h2>Helper Not Found</h2></IonText></IonContent></IonPage>;
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
          <div className="card-header-container">
            <img src={helper.banner} alt={helper.name} className="banner-image" />
            <div className="avatar-container">
              <IonAvatar className="profile-avatar">
                <img src={helper.avatar} alt={helper.name} />
              </IonAvatar>
            </div>
          </div>

          <div className="name-action-row">
            <div className="name-section">
              <IonText className="name">{helper.name}</IonText>
              <IonText className="designation">{helper.title}</IonText>
            </div>
            <div className="header-rating-badge">
              <IonIcon icon={star} className="star-icon" />
              <span className="rating-text">{helper.rating}</span>
            </div>
          </div>

          <IonCardContent className="stats-content">
            <div className="stats-desc"><p className="truncate-3-lines">{helper.description}</p></div>
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
          </IonCardContent>

          <div className="contact-buttons-row">
            <div className="action-buttons-right">
              <IonButton shape="round" fill="clear" className="add-button" onClick={openAddToCollectionModal}>
                <IonIcon icon={addOutline} />
              </IonButton>
              <IonButton shape="round" fill="clear" className="share-button" onClick={handleShareHelper}>
                <IonIcon icon={shareOutline} />
              </IonButton>
            </div>
          </div>
        </IonCard>

        {/* Modal for Adding to Collection */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add to Collection</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {cardHolders.map((holder) => (
                <IonItem button key={holder.id} onClick={() => handleAddToExistingHolder(holder.id)}>
                  <IonLabel>{holder.name}</IonLabel>
                </IonItem>
              ))}
              <IonItem lines="none">
                  {isAddingCardHolder ? (
                    <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                      <IonInput
                        value={newCardHolderName}
                        onIonChange={(e) => setNewCardHolderName(e.detail.value!)}
                        placeholder="New collection name"
                        style={{flexGrow: 1}}
                      />
                      <IonButton onClick={handleCreateAndAdd} fill="clear">
                        <IonIcon icon={checkmark} />
                      </IonButton>
                    </div>
                  ) : (
                    <IonButton fill="clear" onClick={() => setIsAddingCardHolder(true)}>
                      <IonIcon icon={addOutline} slot="start" />
                      <IonLabel>Add New Collection</IonLabel>
                    </IonButton>
                  )}
              </IonItem>
            </IonList>
          </IonContent>
        </IonModal>

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
