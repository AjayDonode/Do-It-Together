
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonImg,
  IonModal,
  IonInput,
  IonItem,
  IonList,
} from '@ionic/react';
import './MyCards.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { add, arrowBackOutline, checkmark } from 'ionicons/icons';
import { Helper } from '../../models/Helper';
import AddHelperModal from './Modal/AddHelperModal';
import ModalHelperDetails from '../modals/ModalHelperDetails';
import { CardHolder } from '../../models/CardHolder';
import { createCardHolder, getCardHolders, addHelperToCardHolder } from '../../services/CardHolderService';
import { getHelperById } from '../../services/HelperService';

const MyCards: React.FC = () => {
  const { currentUser } = useAuth();
  const history = useHistory();

  const [cardHolders, setCardHolders] = useState<CardHolder[]>([]);
  const [newCardHolderName, setNewCardHolderName] = useState<string>('');
  const [isAddingCardHolder, setIsAddingCardHolder] = useState<boolean>(false);
  const [helpers, setDisplayedHelpers] = useState<Helper[]>([]);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [isAddHelperModalOpen, setIsAddHelperModalOpen] = useState(false);
  const [isHelperDetailsModalOpen, setIsHelperDetailsModalOpen] = useState(false);
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
      const helperPromises = cardHolder.helperIds.map(id => getHelperById(id));
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
        fetchHelpersForCardHolder(selectedCardHolder);
      } catch (error) {
        console.error("Error adding helper to card holder:", error);
      }
    }
    setIsAddHelperModalOpen(false);
  };


  const handleSelectCardHolder = (cardHolder: CardHolder) => {
    setSelectedCardHolder(cardHolder);
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
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="my-cards-container">
          {/* Vertical Menu */}
          <div className="my-cards-menu">
            <IonList>
              {cardHolders.map((cardHolder) => (
                <IonItem
                  key={cardHolder.id}
                  button
                  onClick={() => handleSelectCardHolder(cardHolder)}
                  style={selectedCardHolder?.id === cardHolder.id ? { fontWeight: 'bold' } : {}}
                >
                  {cardHolder.name}
                </IonItem>
              ))}
              {isAddingCardHolder ? (
                <IonItem>
                  <IonInput
                    value={newCardHolderName}
                    onIonChange={(e) => setNewCardHolderName(e.detail.value!)}
                    placeholder="New collection"
                  />
                  <IonButton onClick={handleAddCardHolder}>
                    <IonIcon icon={checkmark} />
                  </IonButton>
                </IonItem>
              ) : (
                <IonItem button onClick={() => setIsAddingCardHolder(true)}>
                  <IonIcon icon={add} slot="start" />
                  Add Collection
                </IonItem>
              )}
            </IonList>
          </div>

          {/* Main Content */}
          <div className="my-cards-content">
            <h2>{selectedCardHolder?.name || 'Select a collection'}</h2>
            <div className="card-section">
              <div className="helper-grid">
                {helpers.map((helper) => (
                  <IonCard
                    className="helper-card"
                    key={helper.id}
                    button
                    onClick={() => {
                      setSelectedHelper(helper);
                      setIsHelperDetailsModalOpen(true);
                    }}
                  >
                    <IonImg src={helper.avatar} alt="Helper" className="card-img" />
                    <IonCardContent className="card-body">
                      <h3>{helper.name}</h3>
                      <p>{helper.info.slice(0, 40)}...</p>
                    </IonCardContent>
                  </IonCard>
                ))}
                {selectedCardHolder && (
                  <IonCard
                    className="helper-card"
                    button
                    onClick={() => setIsAddHelperModalOpen(true)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      minHeight: '200px',
                    }}
                  >
                    <IonIcon icon={add} style={{ fontSize: '50px' }} />
                    <IonCardContent>
                      <h3>Add Helper</h3>
                    </IonCardContent>
                  </IonCard>
                )}
              </div>
            </div>
          </div>
        </div>

        <AddHelperModal
          isOpen={isAddHelperModalOpen}
          onClose={() => setIsAddHelperModalOpen(false)}
          onAddHelper={handleAddHelper}
        />

        <ModalHelperDetails
          isOpen={isHelperDetailsModalOpen}
          onDidDismiss={() => setIsHelperDetailsModalOpen(false)}
          helper={selectedHelper}
        />
      </IonContent>
    </IonPage>
  );
};

export default MyCards;
