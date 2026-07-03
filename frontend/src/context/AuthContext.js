import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logoutUser } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

    console.log(
      'AUTH STATE:',
      firebaseUser ? firebaseUser.email : 'NULL'
    );

    setUser(firebaseUser);
    setLoading(false);
  });

  return unsubscribe;
}, []);
  const triggerWelcome = useCallback((name) => {
    setWelcomeName(name || 'there');
    setShowWelcome(true);
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // const logout = useCallback(async () => {
  //   await logoutUser();
  //   setUser(null);
  // }, []);
  const logout = useCallback(async () => {
  console.log('AUTH LOGOUT START');

  await logoutUser();

  console.log('AUTH LOGOUT DONE');

  setUser(null);

  console.log('USER SET TO NULL');
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showWelcome,
        welcomeName,
        triggerWelcome,
        dismissWelcome,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}