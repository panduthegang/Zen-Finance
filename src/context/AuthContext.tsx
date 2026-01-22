import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAppStore } from '../store';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    subscribeToUserData,
} from '../services/firestoreService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const { setTransactions, setCategories, setUser, setDataLoading, clearData } = useAppStore();

    // Set up Firestore listeners when user logs in
    const setupFirestoreListeners = async (user: User) => {
        setDataLoading(true);

        // Create/update user profile in Firestore
        await createUserProfile(
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'User',
            user.email || ''
        );

        // Fetch user profile from Firestore
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
            setUser(userProfile);
        }

        // Subscribe to real-time updates
        unsubscribeRef.current = subscribeToUserData(
            user.uid,
            (transactions) => {
                setTransactions(transactions);
                setDataLoading(false);
            },
            (categories) => {
                setCategories(categories);
            }
        );
    };

    // Clean up listeners on logout
    const cleanupListeners = () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        clearData();
    };

    // Sign in with email and password
    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // Sign up with email and password
    const signUpWithEmail = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update the user's display name in Firebase Auth
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    // Logout
    const logout = async () => {
        cleanupListeners();
        await signOut(auth);
    };

    // Update display name in both Firebase Auth and Firestore
    const updateDisplayName = async (name: string) => {
        if (currentUser) {
            // Update Firebase Auth profile
            await updateProfile(currentUser, { displayName: name });

            // Update Firestore profile
            await updateUserProfile(currentUser.uid, { displayName: name });

            // Update local store
            setUser({
                uid: currentUser.uid,
                name,
                email: currentUser.email || '',
            });
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // User logged in - set up Firestore listeners
                await setupFirestoreListeners(user);
            } else {
                // User logged out - clean up
                cleanupListeners();
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            cleanupListeners();
        };
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        updateDisplayName,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
