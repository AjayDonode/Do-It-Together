import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { close } from 'ionicons/icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  phoneNumber: string;
  setAddress: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  handleSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  address,
  phoneNumber,
  setAddress,
  setPhoneNumber,
  handleSave,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ color: '#ff385c', fontWeight: 'bold' }}>Edit Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Address</IonLabel>
            <IonTextarea
              value={address}
              onIonChange={(e) => setAddress(e.detail.value!)}
              placeholder="Enter your address"
            ></IonTextarea>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Phone Number</IonLabel>
            <IonInput
              type="tel"
              value={phoneNumber}
              onIonChange={(e) => setPhoneNumber(e.detail.value!)}
              placeholder="Enter your phone number"
            ></IonInput>
          </IonItem>
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton expand="block" color="success" onClick={handleSave}>
                  Save
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="block" color="danger" onClick={onClose}>
                  Cancel
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default EditProfileModal;
