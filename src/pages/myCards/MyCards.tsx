
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
} from '@ionic/react';
import './MyCards.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { add, arrowBackOutline, checkmark, searchOutline, addCircleOutline, createOutline, folderOpenOutline, personAddOutline, menuOutline, shareOutline } from 'ionicons/icons';
import { star, locationOutline } from 'ionicons/icons';
import { Helper } from '../../models/Helper';
import AddHelperModal from './Modal/AddHelperModal';
import { CardHolder } from '../../models/CardHolder';
import { createCardHolder, getCardHolders, addHelperToCardHolder } from '../../services/CardHolderService';
import * as HelperService from '../../services/HelperService';
import '../../components/HelperScrollRow/HelperScrollRow.css';

const MyCards: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const [cardHolders, setCardHolders] = useState<CardHolder[]>([]);
  const [newCardHolderName, setNewCardHolderName] = useState<string>('');
  const [isAddingCardHolder, setIsAddingCardHolder] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [helpers, setDisplayedHelpers] = useState<Helper[]>([]);
  const [isAddHelperModalOpen, setIsAddHelperModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'search' | 'create'>('search');
  const [selectedCardHolder, setSelectedCardHolder] = useState<CardHolder | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchCardHolders();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedCardHolder) {
      fetchHelpersForCardHolder(selectedCardHolder);
    } else {
      setDisplayedHelpers([]);
    }
  }, [selectedCardHolder]);

  const fetchCardHolders = async () => {
    if (currentUser) {
      try {
        const fetchedCardHolders = await getCardHolders(currentUser.uid);
        setCardHolders(fetchedCardHolders);
        if (fetchedCardHolders.length > 0 && !selectedCardHolder) {
          setSelectedCardHolder(fetchedCardHolders[0]);
        }
      } catch (error) {
        console.error("Error fetching card holders:", error);
      }
    }
  };

  const fetchHelpersForCardHolder = async (cardHolder: CardHolder) => {
    try {
      const helperPromises = cardHolder.helperIds.map(id => HelperService.getHelperById(id));
      const fetchedHelpers = await Promise.all(helperPromises);
      setDisplayedHelpers(fetchedHelpers.filter(h => h !== null) as Helper[]);
    } catch (error) {
      console.error("Error fetching helpers for card holder:", error);
    }
  };


  const handleBackToHome = () => {
    history.push('/home');
  };

  const handleAddCardHolder = async () => {
    if (newCardHolderName.trim() !== '' && currentUser) {
      try {
        await createCardHolder(currentUser.uid, newCardHolderName);
        setNewCardHolderName('');
        setIsAddingCardHolder(false);
        fetchCardHolders(); // Refresh the list
      } catch (error) {
        console.error("Error creating card holder:", error);
      }
    }
  };

  const handleAddHelper = async (helper: Helper) => {
    if (selectedCardHolder && helper.id) {
      try {
        await addHelperToCardHolder(selectedCardHolder.id, helper.id);
        
        // Optimistically update the UI state
        const updatedCardHolder = {
          ...selectedCardHolder,
          helperIds: [...(selectedCardHolder.helperIds || []), helper.id]
        };
        
        setSelectedCardHolder(updatedCardHolder);
        setDisplayedHelpers(prev => [...prev, helper]);
        setCardHolders(prevHolders => prevHolders.map(ch => 
          ch.id === updatedCardHolder.id ? updatedCardHolder : ch
        ));

      } catch (error) {
        console.error("Error adding helper to card holder:", error);
      }
    }
    setIsAddHelperModalOpen(false);
  };


  const handleSelectCardHolder = (cardHolder: CardHolder) => {
    setSelectedCardHolder(cardHolder);
  };

  const handleHelperClick = (helper: Helper) => {
    history.push(`/tabs/helper-profile/${helper.id}`);
  };

  const handleShareCollection = async () => {
    if (!selectedCardHolder) return;
    const url = `https://doitto-fdce8.web.app/share/collection/${selectedCardHolder.id}`;
    const helperList = helpers
      .map((h, i) => `${i + 1}. ${h.name} ⭐${h.rating?.toFixed(1)} · ${h.category}`)
      .join('\n');
    const shareData = {
      title: `My recommended: ${selectedCardHolder.name}`,
      text: `Check out my list "${selectedCardHolder.name}":\n\n${helperList}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" fill="clear" onClick={handleBackToHome}>
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', marginRight: '8px' }} />
          </IonButton>
          <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
            My Cards
          </IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <IonIcon icon={menuOutline} style={{ fontSize: '24px', color: 'var(--color-primary, #ff385c)' }} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="my-cards-page-content">
        <div className="my-cards-container">
          
          {/* Mobile Overlay Backdrop */}
          <div 
            className={`sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sliding Vertical Sidebar */}
          <div className={`my-cards-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            
            <div className="sidebar-footer">
              {isAddingCardHolder ? (
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '4px' }}>
                  <IonInput
                    value={newCardHolderName}
                    onIonChange={(e) => setNewCardHolderName(e.detail.value!)}
                    placeholder="Collection Name"
                    style={{ '--padding-start': '8px', fontSize: '14px' }}
                  />
                  <IonButton fill="clear" size="small" onClick={handleAddCardHolder}>
                    <IonIcon icon={checkmark} />
                  </IonButton>
                </div>
              ) : (
                <button className="sidebar-action-btn btn-secondary" onClick={() => setIsAddingCardHolder(true)}>
                  <IonIcon icon={add} /> New Collection
                </button>
              )}

            </div>

            <div className="sidebar-list">
              {cardHolders.map((cardHolder) => (
                <div
                  key={cardHolder.id}
                  className={`sidebar-item ${selectedCardHolder?.id === cardHolder.id ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectCardHolder(cardHolder);
                    setIsSidebarOpen(false); // Auto-close on mobile after selection
                  }}
                >
                  <IonIcon icon={folderOpenOutline} />
                  {cardHolder.name}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content (Grid) */}
          <div className="my-cards-content">
            <div className="collection-header">
              <h2 className="collection-title">{selectedCardHolder?.name || 'Select a collection'}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {selectedCardHolder && helpers.length > 0 && (
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={handleShareCollection}
                    title="Share this collection"
                  >
                    <IonIcon icon={shareOutline} slot="icon-only" style={{ color: '#a855f7' }} />
                  </IonButton>
                )}
                {selectedCardHolder && (
                  <IonButton
                    onClick={() => {
                      setModalMode('search');
                      setIsAddHelperModalOpen(true);
                    }}
                    color="primary"
                    shape="round"
                    style={{ fontWeight: 'bold' }}
                  >
                    <IonIcon icon={add} slot="start" />
                    Add Card
                  </IonButton>
                )}
              </div>
            </div>
            
            {helpers.length > 0 && selectedCardHolder ? (
              <div className="helper-grid">
                {helpers.map(helper => (
                  <div
                    key={helper.id}
                    className="hsr-card"
                    onClick={() => handleHelperClick(helper)}
                  >
                    <div className="hsr-banner-wrap">
                      <img
                        className="hsr-banner"
                        src={helper.banner || helper.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80'}
                        alt={helper.name}
                      />
                      <div className="hsr-rating-pill">
                        <IonIcon icon={star} />
                        <span>{helper.rating?.toFixed(1) ?? '–'}</span>
                      </div>
                    </div>
                    <div className="hsr-body">
                      <div className="hsr-avatar-wrap">
                        <img
                          className="hsr-avatar"
                          src={helper.avatar || 'https://www.gravatar.com/avatar?d=mp'}
                          alt={helper.name}
                        />
                      </div>
                      <p className="hsr-name">{helper.name}</p>
                      <p className="hsr-category">{helper.category}</p>
                      {helper.zipcodes?.[0] && (
                        <p className="hsr-location">
                          <IonIcon icon={locationOutline} />
                          {helper.zipcodes[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <IonIcon icon={folderOpenOutline} style={{ fontSize: '48px', color: '#ccc', marginBottom: '12px' }} />
                <p>No contacts in this collection yet.</p>
              </div>
            )}
          </div>

        </div>

        <AddHelperModal
          isOpen={isAddHelperModalOpen}
          onClose={() => setIsAddHelperModalOpen(false)}
          onAddHelper={handleAddHelper}
          initialMode={modalMode}
        />
      </IonContent>
    </IonPage>
  );
};

export default MyCards;
