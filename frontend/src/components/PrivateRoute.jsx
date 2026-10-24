import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  
  // If a JWT token exists in local storage, render the protected component
  // Otherwise, immediately redirect the user to the login screen
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
