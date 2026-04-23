import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { searchOutline, copyOutline, personOutline, sparklesOutline } from 'ionicons/icons';
import Home from '../pages/Home';
import MagicSearch from '../pages/MagicSearch';
import Profile from '../pages/profile/Profile';
import MyCards from '../pages/myCards/MyCards';
import HelperProfilePage from '../pages/helperprofile/HelperProfilePage';
import JoinProPage from '../pages/join-pro/JoinProPage';

const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/magic" component={MagicSearch} />
        <Route exact path="/tabs/profile" component={Profile} />
        <Route exact path="/tabs/mycards" component={MyCards} />
        <Route exact path="/tabs/join-pro" component={JoinProPage} />
        <Route path="/tabs/helper-profile/:id" component={HelperProfilePage} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={searchOutline} />
          <IonLabel>Search</IonLabel>
        </IonTabButton>
        <IonTabButton tab="magic" href="/tabs/magic">
          <IonIcon icon={sparklesOutline} />
          <IonLabel>Magic</IonLabel>
        </IonTabButton>
        <IonTabButton tab="mycards" href="/tabs/mycards">
          <IonIcon icon={copyOutline} />
          <IonLabel>My Cards</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayout;
