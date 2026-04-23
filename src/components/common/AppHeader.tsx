// src/components/common/AppHeader.tsx
import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonBackButton, IonIcon, IonButton } from '@ionic/react';
import { home, person, cartOutline } from 'ionicons/icons';
import './AppHeader.css';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showIcons?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  showMenu = true,
  showIcons = true
}) => {
  return (
    <IonHeader>
      <IonToolbar className="app-header">
        <IonButtons slot="start">
          {showBack && (
            <IonBackButton
              text=""
              defaultHref="#"
              className="back-button"
            />
          )}
          {showMenu && !showBack && <IonMenuButton />}
        </IonButtons>

        <IonTitle className="header-title">{title}</IonTitle>

        {showIcons && (
          <IonButtons slot="end" className="header-actions">
            <IonButton className="icon-button">
              <IonIcon icon={home} />
            </IonButton>
            <IonButton className="icon-button">
              <IonIcon icon={person} />
            </IonButton>
            <IonButton className="icon-button">
              <IonIcon icon={cartOutline} />
            </IonButton>
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
