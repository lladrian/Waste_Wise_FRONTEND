import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Encryption function (matches your decryption)
  const encryptData = (data, key) => {
    const dataStr = JSON.stringify(data);

    // Generate random IV (16 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Combine IV with data
    const combinedData = Array.from(iv).concat(Array.from(new TextEncoder().encode(dataStr)));

    // XOR encryption with key
    let encrypted = '';
    for (let i = 0; i < combinedData.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = combinedData[i];
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }

    return btoa(encrypted);
  };

  // Your existing decryption function
  const decryptData = (encryptedData, key) => {
    try {
      const decoded = atob(encryptedData);
      let decrypted = '';

      for (let i = 0; i < decoded.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const dataChar = decoded.charCodeAt(i);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }

      // Extract IV (first 16 bytes) and actual data
      const bytes = new Uint8Array(decrypted.split('').map(c => c.charCodeAt(0)));
      const dataBytes = bytes.slice(16);
      const originalData = new TextDecoder().decode(dataBytes);

      return JSON.parse(originalData);
    } catch (error) {
      return null;
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const userData = decryptData(localStorage.getItem('user_data'), 'test');
      const data = decryptData(localStorage.getItem('data'), 'test');

      if (userData && data) {
        setUser(userData);
        setLoading(false);
      } else {
        setUser(null);
        localStorage.clear();
        setLoading(false);
        return;
      }

      // Set expiration time (e.g., 1 hour after logged_in_at)
      const loginTime = new Date(data); // "logged_in_at"
      const expirationTime = new Date(loginTime.getTime() + 30 * 60 * 1000); // +1 hour

      const now = new Date();

      if (now > expirationTime) {
        setUser(null);
        localStorage.clear();
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error fetching reg data:", err);
      toast.error("Failed to load data");
    }
  };


  const login = async (data, date) => {
    setUser(data);

    const encryptedData = encryptData(data, 'test');
    const encryptedExpirationData = encryptData(date, 'test');

    localStorage.setItem('user_data', encryptedData);
    localStorage.setItem('data', encryptedExpirationData);
  };


    const update_profile = async (data) => {
    setUser(data);

    const encryptedData = encryptData(data, 'test');

    localStorage.setItem('user_data', encryptedData);
  };

  const logout = async () => {
    // Remove from state AND localStorage
    setUser(null);
    localStorage.clear();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh: fetchData, update_profile }}>
      {children}
    </AuthContext.Provider>
  );
};