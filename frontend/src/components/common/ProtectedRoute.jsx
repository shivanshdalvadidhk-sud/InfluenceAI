import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#F8FAFC',
        }}
      >
        <CircularProgress sx={{ color: '#0052FF' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole) {
    const required = normalizeRole(allowedRole);
    const userRole = normalizeRole(role);

    if (required && userRole !== required) {
      // Redirect to their respective dashboard
      const target = userRole === 'influencer' ? '/influencer/dashboard' : '/company/dashboard';
      return <Navigate to={target} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
