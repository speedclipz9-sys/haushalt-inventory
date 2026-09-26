import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth, database } from './firebaseConfig';
import { ref, set, get, child } from 'firebase/database';

export const AuthContext = createContext();

const REMEMBERED_LOGIN_KEY = 'haushaltinventory-remembered-login';
const REMEMBERED_LOGIN_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

const getBrowserStorage = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return window.localStorage;
};

const clearRememberedLogin = () => getBrowserStorage()?.removeItem(REMEMBERED_LOGIN_KEY);

const saveRememberedLogin = (email) => {
  getBrowserStorage()?.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify({ email, createdAt: Date.now() }));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let unsubscribe;
    let active = true;

    const initializeAuth = async () => {
      const storage = getBrowserStorage();
      const rememberedLogin = storage?.getItem(REMEMBERED_LOGIN_KEY);
      if (rememberedLogin) {
        try {
          const { createdAt } = JSON.parse(rememberedLogin);
          if (!createdAt || Date.now() - createdAt >= REMEMBERED_LOGIN_MAX_AGE) {
            clearRememberedLogin();
            await signOut(auth);
          }
        } catch (error) {
          clearRememberedLogin();
          await signOut(auth);
        }
      }

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      if (currentUser) {
        if (Platform.OS === 'web' && !getBrowserStorage()?.getItem(REMEMBERED_LOGIN_KEY)) {
          saveRememberedLogin(currentUser.email || '');
        }
        setUser(currentUser);
        try {
          const userRef = ref(database, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
      });
    };

    initializeAuth();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  const signUpWithEmail = async (email, password, displayName, rememberMe = true) => {
      if (Platform.OS === 'web') {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      }
    try {
      if (rememberMe) saveRememberedLogin(email);
      else clearRememberedLogin();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await set(ref(database, `users/${uid}`), {
        email,
        displayName,
        createdAt: new Date().toISOString(),
        householdId: null,
      });

      setUserProfile({
        email,
        displayName,
        householdId: null,
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email, password, rememberMe = true) => {
    try {
      if (Platform.OS === 'web') {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) saveRememberedLogin(email);
      else clearRememberedLogin();
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const uid = userCredential.user.uid;

      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          createdAt: new Date().toISOString(),
          householdId: null,
        });
      }

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      clearRememberedLogin();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};