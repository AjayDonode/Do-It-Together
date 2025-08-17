// src/components/ProtectedRoute.tsx
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react';

interface ProtectedRouteProps {
    children: JSX.Element;
  }

const ProtectedRoute: React.FC<{
  path: string;
  component: React.ComponentType;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  return (
    <Route
    //   {...rest}
    //   render={(props) =>
    //     currentUser ? (
    //       <Component {...props} />
    //     ) : (
    //       <Redirect to="/login" />
    //     )
    //   }
    />
  );
};

export default ProtectedRoute;
