import {
    IonButton,
    IonContent,
    IonPage,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonSpinner,
} from '@ionic/react';
import { logoGoogle, logoFacebook, lockClosedOutline, mailOutline } from 'ionicons/icons';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import FormField from '../components/common/FormField';
import AuthBackground from '../components/common/AuthBackground';
import './Login.css';
import { useHistory } from 'react-router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            if (user) {
                history.push('/home');
            }
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else {
                setError('Failed to login. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: any) => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user) {
                // Check if user exists in Firestore, if not create them
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    const nameParts = user.displayName?.split(' ') || [];
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        firstName: nameParts[0] || 'Google',
                        lastName: nameParts.slice(1).join(' ') || 'User',
                        createdAt: new Date(),
                    });
                }
                history.push('/home');
            }
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Login cancelled.');
            } else {
                setError('Social login failed. Please try again.');
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
                            <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <IonIcon icon={lockClosedOutline} className="error-icon" />
                            <IonText>
                                <p>{error}</p>
                            </IonText>
                        </div>
                    )}

                    <div className="form-group">
                        <FormField
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            required
                            helperText="We'll never share your email"
                            error={email && !/\S+@\S+\.\S+/.test(email) ? 'Invalid email format' : ''}
                        />

                        <FormField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            required
                            helperText="Minimum 6 characters"
                        />
                    </div>

                    <IonButton
                        expand="block"
                        onClick={handleLogin}
                        className="login-button"
                        disabled={loading || !email || !password}
                    >
                        {loading ? (
                            <>
                                <IonSpinner name="dots" /> Signing In...
                            </>
                        ) : (
                            <>
                                <IonIcon slot="start" icon={lockClosedOutline} />
                                Sign In
                            </>
                        )}
                    </IonButton>

                    <div className="separator">
                        <span>OR CONTINUE WITH</span>
                    </div>

                    <div className="social-note">
                        <p>By continuing, you agree to our Terms of Use and Privacy Policy</p>
                    </div>

                    <div className="social-buttons">
                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => handleSocialLogin(new GoogleAuthProvider())}
                            className="google-button"
                            disabled={loading}
                        >
                            <IonIcon slot="start" icon={logoGoogle} />
                            Google
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => handleSocialLogin(new FacebookAuthProvider())}
                            className="facebook-button"
                            disabled={loading}
                        >
                            <IonIcon slot="start" icon={logoFacebook} />
                            Facebook
                        </IonButton>
                    </div>

                    <div className="auth-footer ion-text-center">
                        <p>
                            Don't have an account?{' '}
                            <a href="/register" className="signup-link">Create one</a>
                        </p>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
