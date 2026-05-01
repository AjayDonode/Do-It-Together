// src/App.tsx
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import Profile from './pages/profile/Profile';
import MyCards from './pages/myCards/MyCards';
import HelperProfilePage from './pages/helperprofile/HelperProfilePage';
import JoinProPage from './pages/join-pro/JoinProPage';

import TabsLayout from './components/TabsLayout';
import ShareCollectionPage from './pages/share/ShareCollectionPage';

setupIonicReact();

const PrivateRoute: React.FC<{ component: React.ComponentType }> = ({
  component: Component
}) => {
  const { currentUser } = useAuth();
  const history = useHistory();
  const location = useLocation();

  if (!currentUser) {
    history.replace('/login', { from: location });
    return null;
  }

  return <Component />;
};

// Usage in routes:

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route path="/tabs" component={TabsLayout} />
            <Route exact path="/home" render={() => <Redirect to="/tabs/home" />} />
            <Route exact path="/profile" render={() => <Redirect to="/tabs/profile" />} />
            <Route exact path="/mycards" render={() => <Redirect to="/tabs/mycards" />} />
            <Route exact path="/join-pro" render={() => <Redirect to="/tabs/join-pro" />} />
            <Route path="/helper-profile/:id" render={(props: any) => <Redirect to={`/tabs/helper-profile/${props.match.params.id}`} />} />
            {/* Public share pages — no auth required and NO footer tabs */}
            <Route exact path="/share/collection/:collectionId" component={ShareCollectionPage} />
            <Route exact path="/share/helper/:id" component={HelperProfilePage} />
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
