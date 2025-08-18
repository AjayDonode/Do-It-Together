import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import './Register.css';
import { useHistory } from 'react-router';
import { doc, setDoc } from 'firebase/firestore';
import { alertCircleOutline } from 'ionicons/icons';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const history = useHistory();

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors); //TODO check 
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' }); // Clear errors for the field
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully:', formData);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return; // Prevent registration if validation fails
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        uid: user.uid,
      });
      history.push('/home');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please use a different email.');
          break;
        case 'auth/invalid-email':
          setError('The email address you entered is invalid. Please try again.');
          break;
        case 'auth/weak-password':
          setError('Your password is too weak. Please choose a stronger password.');
          break;
        case 'auth/operation-not-allowed':
          setError('Registration is currently disabled. Please contact support.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        case 'auth/internal-error':
          setError('An unexpected error occurred. Please try again later.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-text-center" style={{ color: '#ff385c', fontWeight: 'bold' }}>
          Do it To
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="auth-container auth-card">
          <div className="auth-header">
            <IonText color="primary">
              <h1 className="ion-text-center">Register</h1>
            </IonText>
            <p className="ion-text-center">Register new user</p>
          </div>

          {error && (
            <div className="error-message">
              <IonIcon icon={alertCircleOutline} color="danger" className="error-icon" />
              <IonText color="danger" className="error-text">
                {error}
              </IonText>
            </div>
          )}

          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel position="floating">First Name</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.firstName}
                    onIonChange={(e) => handleInputChange('firstName', e.detail.value!)}
                  />
                  {errors.firstName && <IonText color="danger">{errors.firstName}</IonText>}
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem>
                  <IonLabel position="floating">Last Name</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.lastName}
                    onIonChange={(e) => handleInputChange('lastName', e.detail.value!)}
                  />
                  {errors.lastName && <IonText color="danger">{errors.lastName}</IonText>}
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={formData.email}
              onIonChange={(e) => handleInputChange('email', e.detail.value!)}
            />
            {errors.email && <IonText color="danger">{errors.email}</IonText>}
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={formData.password}
              onIonChange={(e) => handleInputChange('password', e.detail.value!)}
            />
            {errors.password && <IonText color="danger">{errors.password}</IonText>}
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Confirm Password</IonLabel>
            <IonInput
              type="password"
              value={formData.confirmPassword}
              onIonChange={(e) => handleInputChange('confirmPassword', e.detail.value!)}
            />
            {errors.confirmPassword && <IonText color="danger">{errors.confirmPassword}</IonText>}
          </IonItem>
          <IonButton
            expand="block"
            onClick={handleRegister}
            className="auth-button"
          >
            Register
          </IonButton>
          <p className="auth-footer">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
