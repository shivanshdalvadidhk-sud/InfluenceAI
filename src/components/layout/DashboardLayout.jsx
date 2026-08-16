import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { authService } from '../../services/authService';

const DashboardLayout = ({ allowedRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentRole = authService.getCurrentRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && currentRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Panel - slides left margin to avoid overlapping fixed sidebar */}
      <div className="main-content">
        <Navbar />
        
        {/* Child sub-routes wrapper with top margin for fixed header navbar */}
        <div
          style={{
            marginTop: 'calc(var(--navbar-height) + 12px)',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            animation: 'fadeIn 0.3s ease-out forwards',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
