import React, { useState, useEffect } from 'react';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
  IonList,
  IonModal,
  IonText,
  IonItem,
} from '@ionic/react';
import { Helper } from '../../../models/Helper';
import { Firestore } from 'firebase/firestore';
import HelperService from '../../../services/HelperService'; // Adjust the path as necessary

interface AddHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHelper: (helper: Helper) => void;
  db: Firestore; // Pass the Firestore instance as a prop
}

const AddHelperModal: React.FC<AddHelperModalProps> = ({ isOpen, onClose, onAddHelper, db }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [foundHelpers, setFoundHelpers] = useState<Helper[]>([]);
  const [newHelperName, setNewHelperName] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const helperService = new HelperService(db);

  useEffect(() => {
    const loadHelpers = async () => {
      if (searchTerm.trim() === '') {
        setFoundHelpers([]);
        return;
      }
      
      setSearching(true);
      try {
        const helpers = await helperService.getHelpers();
        const filteredHelpers = helpers.filter(helper => 
          helper.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFoundHelpers(filteredHelpers);
      } catch (error) {
        console.error('Error searching helpers:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceLoadHelpers = setTimeout(loadHelpers, 300); // Debounce for better performance

    return () => clearTimeout(debounceLoadHelpers);
  }, [searchTerm]); // Run effect when searchTerm changes

  const handleAddNewHelper = async () => {
    if (newHelperName.trim() !== '') {
      const newHelper: Helper = {
        id: Date.now().toString(), // Generate a unique ID
        name: newHelperName,
        avatar: 'default-avatar.png', // Placeholder for avatar
        info: 'New helper added.',
        banner: '',
        category: ''
      };

      try {
        await helperService.createHelper(newHelper);
        onAddHelper(newHelper);
        setNewHelperName('');
        onClose();
      } catch (error) {
        console.error('Error adding new helper:', error);
      }
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="no-padding-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Helper</IonTitle>
          <IonButton slot="end" onClick={onClose}>Close</IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonInput 
        value={searchTerm} 
        placeholder="Search for a helper..." 
        onIonChange={(e) => setSearchTerm(e.detail.value!)} 
      />
      
      <IonList>
        {searching ? (
          <IonText color="medium">
            <p>Searching...</p>
          </IonText>
        ) : (
          foundHelpers.length > 0 ? (
            foundHelpers.map((helper) => (
              <IonItem key={helper.id} button onClick={() => { onAddHelper(helper); onClose(); }}>
                <IonCard>
                  <IonCardContent>
                    <h3>{helper.name}</h3>
                  </IonCardContent>
                </IonCard>
              </IonItem>
            ))
          ) : (
            <IonText color="medium">
              <p>No helpers found. You can add a new helper below.</p>
            </IonText>
          )
        )}
      </IonList>

      <h4>Add New Helper</h4>
      <IonInput 
        value={newHelperName} 
        placeholder="Enter new helper name" 
        onIonChange={(e) => setNewHelperName(e.detail.value!)} 
      />
      <IonButton onClick={handleAddNewHelper}>Add New Helper</IonButton>
    </IonModal>
  );
};

export default AddHelperModal;
