// src/components/ProtectedRoute.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getSpecificUser } from "./../hooks/user_management_hook";

import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from "react-router-dom";



const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, login, logout } = useContext(AuthContext);
  const userRole = user?.role; // Or get from context/store
  const userID = user?._id; // Or get from context/store
  const [users, setUsers] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const { data, success } = await getSpecificUser(user?._id);
      if (success === true) {
        setUsers(data.data.user)
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

  if (users && user) {

    const routePermission = () => {
      const currentPath = location.pathname;
      const allowedRoutes = user?.role_action?.route || [];

      const isManagementRoute = currentPath.includes('/management/');

      if (isManagementRoute) {
        return allowedRoutes.includes(currentPath);
      }

      return true;
    };

    // const hasPermission = allowedRoles.includes(userRole) && (users && userRole === users.role);
    const hasPermission = allowedRoles.includes(userRole);
    const hasRoutePermission = routePermission();

    if (!hasPermission || !hasRoutePermission) {
      localStorage.clear();
      navigate('/unauthorized', { replace: true });
      return;
    }
  }


  return children;
};

export default ProtectedRoute;
