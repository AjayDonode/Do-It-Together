import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import './Register.css';
import { useHistory } from 'react-router';
import { doc, setDoc } from 'firebase/firestore';
import { personAddOutline } from 'ionicons/icons';
import FormField from '../components/common/FormField';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import AuthBackground from '../components/common/AuthBackground';

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
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const validateForm = () => {
    const newErrors: Partial<typeof errors> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      ...newErrors,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        uid: user.uid,
        createdAt: new Date(),
      });

      history.push('/home');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Try logging in instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address. Please check and try again.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger one.');
          break;
        case 'auth/operation-not-allowed':
          setError('Registration is temporarily disabled. Please try later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Check your Internet connection.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

    return (
    <IonPage>
      <IonContent fullscreen className="auth-page-content">
        <AuthBackground />
        <div className="auth-wrapper">
          <div className="auth-brand">
            <h1>Do It Together</h1>
          </div>
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
            <p>Join the community and start helping others</p>
          </div>

          {error && (
            <div className="error-banner">
              <IonIcon icon={personAddOutline} className="error-icon" />
              <IonText>
                <p>{error}</p>
              </IonText>
            </div>
          )}

          <div className="form-group">
            <div className="name-row">
              <FormField
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(val) => handleInputChange('firstName', val)}
                placeholder="John"
                required
                error={errors.firstName}
              />
              <FormField
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(val) => handleInputChange('lastName', val)}
                placeholder="Doe"
                required
                error={errors.lastName}
              />
            </div>

            <FormField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(val) => handleInputChange('email', val)}
              placeholder="you@example.com"
              required
              helperText="We'll verify your email"
              error={errors.email}
            />

            <FormField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(val) => handleInputChange('password', val)}
              placeholder="••••••••"
              required
              error={errors.password}
            />

            <PasswordStrengthMeter password={formData.password} />

            <FormField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(val) => handleInputChange('confirmPassword', val)}
              placeholder="••••••••"
              required
              error={errors.confirmPassword}
            />
          </div>

          <IonButton
            expand="block"
            onClick={handleRegister}
            className="register-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <IonSpinner name="dots" /> Creating Account...
              </>
            ) : (
              <>
                <IonIcon slot="start" icon={personAddOutline} />
                Create Account
              </>
            )}
          </IonButton>

          <div className="auth-footer ion-text-center">
            <p>
              Already have an account?{' '}
              <a href="/login" className="login-link">Sign in</a>
            </p>
          </div>

          <div className="terms-text">
            <p>
              By creating an account, you agree to our{' '}
              <a href="#" className="link">Terms of Service</a> and{' '}
              <a href="#" className="link">Privacy Policy</a>
            </p>
          </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
