import React, { useState } from 'react';
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
} from '@ionic/react';
import './MyCards.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router';
import { add, arrowBackOutline, checkmark } from 'ionicons/icons';

// Define a type for the helper
interface Helper {
  id: number;
  name: string;
  info: string;
  avatar: string;
}

const MyCards: React.FC = () => {
  const { currentUser } = useAuth(); // Access user data from AuthContext
  const history = useHistory(); // React Router's useHistory hook for navigation

  const [items, setItems] = useState<string[]>(['Recent', 'Plumbers', 'Handyman', 'Electricians']); // Specify type for items
  const [newItem, setNewItem] = useState<string>(''); // Specify type for newItem
  const [isEditing, setIsEditing] = useState<boolean>(false); // Specify type for isEditing
  const [displayedHelpers, setDisplayedHelpers] = useState<Helper[]>([]); // Specify type for displayedHelpers
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null); // Specify type for selectedHelper
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Specify type for modal state

  /** Sample Data */
  const initialHelpers: Helper[] = [
    { id: 1, name: 'John Doe', info: 'Expert plumber with 10 years of experience.', avatar: 'link_to_avatar1' },
    { id: 2, name: 'Jane Smith', info: 'Professional handyman for all your needs.', avatar: 'link_to_avatar2' },
  ];

  const additionalHelpers: Helper[] = [
    { id: 3, name: 'Mike Johnson', info: 'Electrician specializing in residential work.', avatar: 'link_to_avatar3' },
    { id: 4, name: 'Emily Davis', info: 'Skilled carpenter with a focus on custom furniture.', avatar: 'link_to_avatar4' },
  ];

  const handleButtonClick = () => {
    setDisplayedHelpers(additionalHelpers); // Change to the new dataset
  };

  const handleBackToHome = () => {
    history.push('/home'); // Navigate back to the home page
  };

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem]);
      setNewItem('');
      setIsEditing(false);
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
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center' }}>
          {items.map((item, index) => (
            <span key={index} style={{ marginRight: '15px', cursor: 'pointer' }}>
              <IonButton onClick={handleButtonClick} fill="clear"> {item}</IonButton>
            </span>
          ))}
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="New list name"
              />
              <IonButton onClick={handleAddItem} fill="clear">
                <IonIcon icon={checkmark} />
              </IonButton>
            </div>
          ) : (
            <IonButton onClick={() => setIsEditing(true)} fill="clear">
              <IonIcon icon={add} />
            </IonButton>
          )}
        </div>
        <div className="helper-grid">
          {(displayedHelpers.length > 0 ? displayedHelpers : initialHelpers).map((helper) => (
            <IonCard
              className="helper-card"
              key={helper.id}
              button
              onClick={() => {
                setSelectedHelper(helper);
                setIsModalOpen(true);
              }}
            >
              <IonImg src={helper.avatar} alt="Helper" className="card-img" />
              <IonCardContent className="card-body">
                <h3>{helper.name}</h3>
                <p>{helper.info.slice(0, 40)}...</p>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedHelper?.name}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedHelper && (
              <IonCard>
                <IonImg src={selectedHelper.avatar} alt="Selected Helper" />
                <IonCardContent>
                  <h3>{selectedHelper.name}</h3>
                  <p>{selectedHelper.info}</p>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default MyCards;
