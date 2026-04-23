import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
  IonText, IonSpinner, IonIcon, IonAvatar, IonButton, IonChip, IonButtons,
  IonToast, IonModal, IonList, IonItem, IonLabel, IonInput, IonFooter
} from '@ionic/react';
import { Helper } from '../../models/Helper';
import * as HelperService from '../../services/HelperService';
import { addOutline, arrowBack, briefcase, chatbubble, checkmark, checkmarkCircle, close, shareOutline, star, sendOutline } from 'ionicons/icons';
import { CardHolder } from '../../models/CardHolder';
import { addHelperToCardHolder, getCardHolders, createCardHolder } from '../../services/CardHolderService';
import { useAuth } from '../../context/AuthContext';
import '../../components/StackedCards/StackedCards.css';
import './HelperProfilePage.css';

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
        await addHelperToCardHolder(newHolder, helper.id);

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
      <IonContent className="ion-padding" fullscreen>
        <div className="profile-page-container">
          <div className="stack-card profile-stack-override">
            <div className="card-image-wrapper" style={{ height: '120px' }}>
              <img src={helper.banner} className="stack-banner" alt="cover" draggable="false" />
              <IonButton
                onClick={handleGoBack}
                fill="clear"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  margin: 0,
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  color: 'white',
                  zIndex: 10,
                  '--padding-start': '0',
                  '--padding-end': '0'
                }}
              >
                <IonIcon icon={close} style={{ fontSize: '20px' }} />
              </IonButton>
              <IonAvatar className="stack-avatar">
                <img src={helper.avatar} alt="avatar" draggable="false" />
              </IonAvatar>
            </div>
            
            <div className="stack-card-info" style={{ overflowY: 'visible', height: 'auto', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>{helper.name}</h3>
                <IonIcon icon={checkmarkCircle} color="primary" style={{ fontSize: '1.2rem' }} />
              </div>
              <div className="stack-title" style={{ marginTop: '4px', marginBottom: '16px' }}>{helper.title}</div>
              
              <div className="stack-rating">
                <IonIcon icon={star} className="star-icon" />
                <span>{helper.rating} ({helper.reviews?.length || 0} reviews)</span>
              </div>
              
              <div className="stack-skills">
                <IonIcon icon={briefcase} className="skill-icon" />
                <div className="skill-chips">
                  {helper.tags?.slice(0, 6).map((tag, index) => (
                    <span key={index} className="skill-chip">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="stats-desc" style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <p>{helper.description}</p>
              </div>

              <div className="additional-section" style={{ marginTop: '24px' }}>
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <IonIcon icon={chatbubble} className="section-icon" style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                  <IonText className="section-title" style={{ fontWeight: 600 }}>Recent Reviews</IonText>
                </div>
                <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {helper.reviews?.slice(0, 2).map((review, index) => (
                    <div key={index} className="review-item" style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                      <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <IonText className="reviewer-name" style={{ fontWeight: 600, fontSize: '14px' }}>Review</IonText>
                        <div className="review-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IonIcon icon={star} className="small-star" style={{ color: '#ffb400', fontSize: '14px' }} />
                          <IonText>{review.rating}</IonText>
                        </div>
                      </div>
                      <IonText className="review-text" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{review.comment}</IonText>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stack-instructions profile-actions" style={{ marginTop: 'auto' }}>
                <IonButton fill="clear" className="profile-action-btn" onClick={openAddToCollectionModal}>
                  <IonIcon icon={addOutline} slot="start" />
                  Add
                </IonButton>
                <IonButton fill="clear" className="profile-action-btn" onClick={handleShareHelper}>
                  <IonIcon icon={shareOutline} slot="start" />
                  Share
                </IonButton>
                <IonButton shape="round" className="profile-quote-btn">
                  <IonIcon icon={sendOutline} slot="start" style={{ marginRight: '6px' }} />
                  Request Quote
                </IonButton>
              </div>
            </div>
          </div>
        </div>
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
