import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
  IonText, IonSpinner, IonIcon, IonAvatar, IonButton, IonChip, IonButtons,
  IonToast, IonModal, IonList, IonItem, IonLabel, IonInput, IonFooter,
  useIonRouter,
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Helper } from '../../models/Helper';
import { Hire } from '../../models/Hire';
import * as HelperService from '../../services/HelperService';
import * as HireService from '../../services/HireService';
import * as ConversationService from '../../services/ConversationService';
import {
  addOutline, arrowBack, briefcase, chatbubble, checkmark, checkmarkCircle,
  close, shareOutline, star, sendOutline, peopleOutline, ribbonOutline,
  alertCircleOutline, home
} from 'ionicons/icons';
import { CardHolder } from '../../models/CardHolder';
import { addHelperToCardHolder, getCardHolders, createCardHolder } from '../../services/CardHolderService';
import { useAuth } from '../../context/AuthContext';
import '../../components/StackedCards/StackedCards.css';
import './HelperProfilePage.css';
import HireModal from '../../components/HireModal/HireModal';
import HiredByModal from '../../components/HiredByModal/HiredByModal';
import ClaimBusinessModal from '../../components/ClaimBusinessModal/ClaimBusinessModal';

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
  const router = useIonRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCardHolderName, setNewCardHolderName] = useState('');
  const [isAddingCardHolder, setIsAddingCardHolder] = useState(false);

  // ── Hire feature ──
  const [allHires, setAllHires] = useState<Hire[]>([]);
  const [myHire, setMyHire] = useState<Hire | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isHiredByModalOpen, setIsHiredByModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleGoBack = () => {
    // If user clicked a public shared link or has no session, send them to home
    if (!currentUser || history.location.pathname.includes('/share/')) {
      history.push('/tabs/home');
    } else {
      history.goBack();
    }
  };

  useEffect(() => {
    const fetchHelperDetails = async () => {
      if (!id) { setError('No helper ID provided'); setLoading(false); return; }
      try {
        setLoading(true);
        const helperData = await HelperService.getHelperById(id);
        if (helperData) setHelper(helperData);
        else setError('Helper not found');
      } catch (err) {
        console.error('Error fetching helper details:', err);
        setError('Failed to fetch helper details');
      } finally {
        setLoading(false);
      }
    };
    fetchHelperDetails();
  }, [id]);

  // Load hires when helper is available
  useEffect(() => {
    if (!id) return;
    const loadHires = async () => {
      const hires = await HireService.getHiresForHelper(id);
      setAllHires(hires);
      if (currentUser) {
        const mine = hires.find(h => h.userId === currentUser.uid) ?? null;
        setMyHire(mine);
      }
    };
    loadHires();
  }, [id, currentUser]);

  useEffect(() => {
    const fetchCardHolders = async () => {
      if (currentUser) {
        const holders = await getCardHolders(currentUser.uid);
        setCardHolders(holders);
      }
    };
    if (currentUser) fetchCardHolders();
  }, [currentUser, isModalOpen]);

  const handleAddToExistingHolder = async (cardHolderId: string) => {
    if (!helper) return;
    try {
      await addHelperToCardHolder(cardHolderId, helper.id);
      setToastMessage('Helper added successfully!');
      setShowToast(true);
      setIsModalOpen(false);
    } catch (error) {
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
        setNewCardHolderName('');
        setIsAddingCardHolder(false);
        setIsModalOpen(false);
      } catch (error) {
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
    const profileUrl = `https://doitto-fdce8.web.app/share/helper/${helper.id}`;
    const shareText = `${helper.name}\n⭐ ${helper.rating} · ${helper.category}\n${helper.description?.slice(0, 120) || ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: helper.name, text: shareText, url: profileUrl });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // ── Hire handlers ──
  const handleHireSubmit = async (rating: number, experience: string) => {
    if (!currentUser || !id) return;
    if (myHire) {
      await HireService.updateHire(myHire.id, rating, experience);
      setToastMessage('Your review has been updated!');
    } else {
      await HireService.markAsHired(
        currentUser.uid, id, rating, experience,
        currentUser.displayName ?? 'Anonymous',
        currentUser.photoURL ?? '',
      );
      setToastMessage('Thanks for sharing your experience! 🎉');
    }
    setShowToast(true);
    // Refresh hires
    const hires = await HireService.getHiresForHelper(id);
    setAllHires(hires);
    setMyHire(hires.find(h => h.userId === currentUser.uid) ?? null);
  };

  const handleHireDelete = async () => {
    if (!myHire) return;
    await HireService.deleteHire(myHire.id);
    setMyHire(null);
    setAllHires(prev => prev.filter(h => h.id !== myHire.id));
    setToastMessage('Your hire record has been removed.');
    setShowToast(true);
  };

  const handleRequestQuote = async () => {
    if (!currentUser || !helper) return;
    try {
      const convId = await ConversationService.getOrCreateConversation(
        currentUser.uid,
        helper.id,
        helper.name,
        helper.avatar ?? '',
        currentUser.displayName ?? 'User',
        currentUser.photoURL ?? '',
      );
      router.push(
        `/tabs/chat/${convId}/${encodeURIComponent(helper.name)}/${encodeURIComponent(helper.avatar ?? '')}`,
      );
    } catch (err) {
      console.error('Failed to open chat:', err);
      setToastMessage('Could not open chat. Please try again.');
      setShowToast(true);
    }
  };

  // Average rating from in-app hires (separate from Yelp rating)
  const inAppAvgRating = allHires.length > 0
    ? (allHires.reduce((sum, h) => sum + h.rating, 0) / allHires.length).toFixed(1)
    : null;

  if (loading) return (
    <IonPage><IonContent className="ion-padding">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <IonSpinner /><IonText style={{ marginLeft: '10px' }}>Loading...</IonText>
      </div>
    </IonContent></IonPage>
  );

  if (error) return (
    <IonPage><IonHeader><IonToolbar>
      <IonButtons slot="start"><IonButton onClick={handleGoBack}><IonIcon icon={arrowBack} /></IonButton></IonButtons>
      <IonTitle>Error</IonTitle>
    </IonToolbar></IonHeader>
    <IonContent className="ion-padding"><IonText color="danger"><h2>Error</h2><p>{error}</p></IonText></IonContent>
    </IonPage>
  );

  if (!helper) return (
    <IonPage><IonHeader><IonToolbar>
      <IonButtons slot="start"><IonButton onClick={handleGoBack}><IonIcon icon={arrowBack} /></IonButton></IonButtons>
      <IonTitle>Not Found</IonTitle>
    </IonToolbar></IonHeader>
    <IonContent className="ion-padding"><IonText color="warning"><h2>Helper Not Found</h2></IonText></IonContent>
    </IonPage>
  );

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
                  position: 'absolute', top: '12px', right: '12px',
                  margin: 0, width: '32px', height: '32px',
                  backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
                  color: 'white', zIndex: 10, '--padding-start': '0', '--padding-end': '0'
                }}
              >
                <IonIcon icon={(!currentUser || history.location.pathname.includes('/share/')) ? home : close} style={{ fontSize: '20px' }} />
              </IonButton>
              <IonAvatar className="stack-avatar">
                <img src={helper.avatar} alt="avatar" draggable="false" />
              </IonAvatar>
            </div>

            <div className="stack-card-info" style={{ overflowY: 'visible', height: 'auto', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  {helper.name}
                </h3>
                {helper.claimed
                  ? <IonIcon icon={checkmarkCircle} color="primary" style={{ fontSize: '1.2rem' }} title="Verified business" />
                  : <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', color: '#f59e0b' }} title="Unclaimed business" />
                }
              </div>
              <div className="stack-title" style={{ marginTop: '4px', marginBottom: '16px' }}>{helper.title}</div>

              {/* Yelp rating */}
              <div className="stack-rating">
                <IonIcon icon={star} className="star-icon" />
                <span>{helper.rating} ({helper.ratingCount ?? 0} Yelp reviews)</span>
              </div>

              {/* In-app community rating */}
              {allHires.length > 0 && (
                <div className="stack-rating" style={{ marginTop: '4px', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '0.95rem', color: '#a855f7' }} />
                  <span style={{ marginLeft: '4px' }}>
                    {inAppAvgRating} from {allHires.length} app {allHires.length === 1 ? 'user' : 'users'}
                  </span>
                </div>
              )}

              {/* ── Hired By section ── */}
              {allHires.length > 0 && (
                <div className="hired-by-strip" onClick={() => setIsHiredByModalOpen(true)}>
                  <div className="hired-by-avatars">
                    {allHires.slice(0, 5).map((h) => (
                      <img
                        key={h.id}
                        className="hired-by-avatar"
                        src={h.userAvatar || 'https://www.gravatar.com/avatar?d=mp'}
                        alt={h.userDisplayName}
                        title={h.userDisplayName}
                      />
                    ))}
                  </div>
                  <span className="hired-by-label">
                    {allHires.length === 1
                      ? `${allHires[0].userDisplayName} hired this`
                      : `${allHires[0].userDisplayName} & ${allHires.length - 1} others hired this`}
                  </span>
                  <IonIcon icon={peopleOutline} className="hired-by-chevron" />
                </div>
              )}

              {/* Skills */}
              <div className="stack-skills">
                <IonIcon icon={briefcase} className="skill-icon" />
                <div className="skill-chips">
                  {helper.tags?.slice(0, 6).map((tag, index) => (
                    <span key={index} className="skill-chip">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="desc-box">
                <p>{helper.description}</p>
              </div>

              {/* Showcase images — Swiper slider */}
              {helper.showcaseImages && helper.showcaseImages.length > 0 && (
                <div className="showcase-section">
                  <p className="showcase-label">📸 Our Work</p>
                  <Swiper
                    modules={[Pagination, A11y]}
                    spaceBetween={10}
                    slidesPerView={2.5}
                    breakpoints={{
                      768: { slidesPerView: 3.5 },
                    }}
                    pagination={{ clickable: true }}
                    className="showcase-swiper"
                  >
                    {helper.showcaseImages.map((url, i) => (
                      <SwiperSlide key={i}>
                        <img
                          src={url}
                          alt={`Showcase ${i + 1}`}
                          className="showcase-slide-img"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* In-app reviews */}
              {allHires.length > 0 && (
                <div className="additional-section" style={{ marginTop: '24px' }}>
                  <div className="section-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <IonIcon icon={chatbubble} className="section-icon" style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    <IonText className="section-title" style={{ fontWeight: 600 }}>
                      Community Reviews ({allHires.length})
                    </IonText>
                  </div>
                  <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allHires.slice(0, 3).map((hire) => (
                      <div key={hire.id} className="review-item" style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <img
                            src={hire.userAvatar || 'https://www.gravatar.com/avatar?d=mp'}
                            alt={hire.userDisplayName}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{hire.userDisplayName}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#f7c948' }}>{'⭐'.repeat(hire.rating)}</p>
                          </div>
                        </div>
                        {hire.experience && (
                          <IonText style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            "{hire.experience}"
                          </IonText>
                        )}
                      </div>
                    ))}
                    {allHires.length > 3 && (
                      <IonButton fill="clear" size="small" onClick={() => setIsHiredByModalOpen(true)}>
                        See all {allHires.length} reviews →
                      </IonButton>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="stack-instructions profile-actions" style={{ marginTop: 'auto' }}>
                {currentUser && (
                  <IonButton fill="clear" className="profile-action-btn" onClick={openAddToCollectionModal}>
                    <IonIcon icon={addOutline} slot="start" />Add
                  </IonButton>
                )}
                <IonButton fill="clear" className="profile-action-btn" onClick={handleShareHelper}>
                  <IonIcon icon={shareOutline} slot="start" />Share
                </IonButton>
                {currentUser ? (
                  <IonButton
                    shape="round"
                    className="profile-quote-btn"
                    onClick={helper.claimed ? handleRequestQuote : undefined}
                    disabled={!helper.claimed}
                    title={helper.claimed ? 'Send a message' : 'This business has not been claimed yet'}
                  >
                    <IonIcon icon={sendOutline} slot="start" style={{ marginRight: '6px' }} />
                    Message
                  </IonButton>
                ) : (
                  <IonButton
                    shape="round"
                    className="profile-quote-btn"
                    onClick={() => history.push('/login')}
                  >
                    Log in to Message
                  </IonButton>
                )}
              </div>

              {/* Unclaimed notice */}
              {!helper.claimed && (
                <div className="unclaimed-notice">
                  <IonIcon icon={alertCircleOutline} className="unclaimed-icon" />
                  <div className="unclaimed-text">
                    <span className="unclaimed-title">Business not yet claimed</span>
                    <span className="unclaimed-sub">The owner hasn't registered on Do It Together yet. Messaging is unavailable.</span>
                  </div>
                  <button className="unclaimed-claim-btn" onClick={() => setIsClaimModalOpen(true)}>Claim</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add to Collection Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add to Collection</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}><IonIcon icon={close} /></IonButton>
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
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <IonInput
                      value={newCardHolderName}
                      onIonChange={(e) => setNewCardHolderName(e.detail.value!)}
                      placeholder="New collection name"
                      style={{ flexGrow: 1 }}
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
        duration={2500}
        position="bottom"
      />

      {/* Claim Business Modal */}
      {helper && currentUser && (
        <ClaimBusinessModal
          isOpen={isClaimModalOpen}
          helperId={helper.id}
          helperName={helper.name}
          prefill={{
            description: helper.description,
            hours: helper.hours,
            website: helper.website,
            contact: helper.contact,
            address: helper.address,
          }}
          currentUserId={currentUser.uid}
          onClose={() => setIsClaimModalOpen(false)}
          onClaimed={async () => {
            setIsClaimModalOpen(false);
            // Re-fetch helper to reflect claimed status
            if (id) {
              const updated = await HelperService.getHelperById(id);
              if (updated) setHelper(updated);
            }
          }}
        />
      )}

      {/* Hire / Rate modal */}
      <HireModal
        isOpen={isHireModalOpen}
        helperName={helper.name}
        existingHire={myHire}
        onClose={() => setIsHireModalOpen(false)}
        onSubmit={handleHireSubmit}
        onDelete={myHire ? handleHireDelete : undefined}
      />

      {/* Hired By list modal */}
      <HiredByModal
        isOpen={isHiredByModalOpen}
        helperName={helper.name}
        hires={allHires}
        onClose={() => setIsHiredByModalOpen(false)}
      />
    </IonPage>
  );
};

export default HelperProfilePage;
