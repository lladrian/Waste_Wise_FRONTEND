import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate device fingerprint
  const getDeviceFingerprint = () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      platform: navigator.platform,
      // Add more identifiable information as needed
    };
    return btoa(JSON.stringify(fingerprint));
  };

  // Store session with device info
  const storeSession = async (userData, token) => {
    const sessionData = {
      user: userData,
      token: token,
      deviceFingerprint: getDeviceFingerprint(),
      timestamp: Date.now(),
      sessionId: crypto.randomUUID() // Generate unique session ID
    };
    
    const encryptedData = btoa(JSON.stringify(sessionData));
    localStorage.setItem('user_session', encryptedData);
  };

  // Validate session on load
  const validateSession = async () => {
    try {
      const encryptedSession = localStorage.getItem('user_session');
      if (!encryptedSession) return null;

      const sessionData = JSON.parse(atob(encryptedSession));
      
      // Verify session with backend
      const response = await axios.post('/api/auth/validate-session', {
        sessionId: sessionData.sessionId,
        deviceFingerprint: sessionData.deviceFingerprint,
        token: sessionData.token
      }, {
        headers: { Authorization: `Bearer ${sessionData.token}` }
      });

      if (response.data.valid) {
        return sessionData.user;
      } else {
        // Session invalid - clear it
        localStorage.removeItem('user_session');
        return null;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('user_session');
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await validateSession();
      setUser(userData);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (responseData) => {
    try {
      // responseData should contain: { user, token }
      await storeSession(responseData.user, responseData.token);
      setUser(responseData.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const encryptedSession = localStorage.getItem('user_session');
      if (encryptedSession) {
        const sessionData = JSON.parse(atob(encryptedSession));
        
        // Notify backend to invalidate session
        await axios.post('/api/auth/logout', {
          sessionId: sessionData.sessionId
        }, {
          headers: { Authorization: `Bearer ${sessionData.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user_session');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};