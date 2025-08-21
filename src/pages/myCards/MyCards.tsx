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
import { Helper } from '../../models/Helper';

// Define a type for the helper


const MyCards: React.FC = () => {
  const { currentUser } = useAuth(); // Access user data from AuthContext
  const history = useHistory(); // React Router's useHistory hook for navigation

  const [items, setItems] = useState<string[]>(['Recent', 'Plumbers', 'Handyman', 'Electricians']);
  const [newItem, setNewItem] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [helpers, setDisplayedHelpers] = useState<Helper[]>([]);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('Recent');

  // Function to fetch helpers based on the label
  const fetchHelpers = async (label: string) => {
    try {
      // Simulate a service call (replace with your actual API call)
      const response = await fetch(`https://api.example.com/helpers?type=${label}`); // Adjust the URL as needed
      const data: Helper[] = await response.json();
      setDisplayedHelpers(data); // Update the state with fetched helpers
    } catch (error) {
      console.error("Error fetching helpers:", error);
    }
  };

  const handleDisplayHelper = (label: string) => {
    console.log("Selected button is " + label);
    setSelectedLabel(label); // Update the selected label
    fetchHelpers(label); // Fetch helpers based on the selected label
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

  function handleAddHelperClick(event: MouseEvent<HTMLIonCardElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }
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
        <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {items.map((item, index) => (
              <span key={index} style={{ marginRight: '15px', cursor: 'pointer' }}>
                <IonButton onClick={() => handleDisplayHelper(item)} fill="clear"
                  style={{
                    fontSize: '10px', // Smaller font size
                    textDecoration: 'underline', // Makes it look like a link
                    padding: '0', // Removes extra padding
                    height: 'auto', // Adjusts height
                    lineHeight: 'normal', // Normalizes line height
                  }}
                > {item}</IonButton>
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

          {/* Selected Label */}
          <h2 style={{ marginLeft: '20px', marginTop: '10px' }}>{selectedLabel}</h2> {/* Align with the buttons */}
        </div>

        <div className="card-section">
          <div className="helper-grid">
            {helpers.map((helper) => (
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

            <IonCard
              className="helper-card"
              button
              onClick={handleAddHelperClick}
              style={{
                display: helpers.length === 0 ? 'block' : 'flex',
                margin: '0 auto', // Center the card horizontally
                textAlign: 'center', // Center the text inside the card
                maxWidth: '400px', // Optional: Set a max width
                padding: '20px', // Add padding for a larger touch area
              }} // Show if helpers are empty
            >
              <IonIcon icon={add} style={{ fontSize: '100px', margin: 'auto' }} />
              <IonCardContent className="card-body" style={{ textAlign: 'center' }}>
                <h3>Add Helper to List</h3>
              </IonCardContent>
            </IonCard>
          </div>
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
