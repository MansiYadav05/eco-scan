import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User,
} from 'firebase/auth';
import { auth, authPersistence, firebaseConfigured } from './firebase';

export const isFirebaseConfigured = firebaseConfigured;

const formatFirebaseError = (error: unknown) => {
    const code = typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';

    switch (code) {
        case 'auth/email-already-in-use': return 'An account already exists for this email.';
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
        case 'auth/wrong-password':
        case 'auth/user-not-found': return 'The email or password is incorrect.';
        case 'auth/operation-not-allowed': return 'Email/password sign-in is disabled. Enable it in Firebase Console > Authentication > Sign-in method.';
        case 'auth/invalid-api-key': return 'The Firebase API key is invalid or belongs to a different project.';
        case 'auth/project-not-found': return 'The Firebase project could not be found. Check your Firebase configuration.';
        case 'auth/user-disabled': return 'This Firebase account has been disabled.';
        case 'auth/weak-password': return 'Use a password with at least 6 characters.';
        case 'auth/invalid-email': return 'Enter a valid email address.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        default: return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
    }
};

const ensureConfigured = () => {
    if (!isFirebaseConfigured) {
        throw new Error('Firebase Authentication is not configured. Add the Firebase web app settings to .env.');
    }
};

export const signIn = async (email: string, password: string): Promise<User> => {
    ensureConfigured();
    try {
        await authPersistence;
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        throw new Error(formatFirebaseError(error));
    }
};

export const signUp = async (email: string, password: string): Promise<User> => {
    ensureConfigured();
    try {
        await authPersistence;
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        throw new Error(formatFirebaseError(error));
    }
};

export const sendPasswordReset = async (email: string) => {
    ensureConfigured();
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error(formatFirebaseError(error));
    }
};

export const signOut = () => firebaseSignOut(auth);

export const observeAuthState = (onUserChanged: (user: User | null) => void) => (
    onAuthStateChanged(auth, onUserChanged)
);
