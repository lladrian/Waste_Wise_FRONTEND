// src/components/ProtectedRoute.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from "react-router-dom";
import { getSpecificUser } from "./../hooks/user_management_hook";
import { toast } from "react-toastify";

import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        console.error('Decryption failed:', error);
        return null;
    }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useContext(AuthContext);
  const userRole = user?.role; // Or get from context/store
  const userID = user?._id; // Or get from context/store
  const [users, setUsers] = useState(null); 
  //   const userRole = decryptData(localStorage.getItem('user_role'), 'test'); // Or get from context/store
  // const userID = decryptData(localStorage.getItem('user_id'), 'test'); // Or get from context/store



  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const { data, success } = await getSpecificUser(userID);
      if (success === true) {
        setUsers(data.data)
        return;
      }
      localStorage.clear();
      // toast.error("Unauthorized");
      navigate(`/`);
      return;
    } catch (err) {
      localStorage.clear();
      // toast.error("Unauthorized");
      navigate(`/`);
      return;
    }
  };



  if (!userRole) {
    navigate(`/`);
    return;
  }

  // Check if user has permission
  const hasPermission = allowedRoles.includes(userRole) || (users && userRole === users.role);

  if (!hasPermission) {
    localStorage.clear();
    navigate(`/unauthorized`);
    return;
  }

  return children;
};

export default ProtectedRoute;
