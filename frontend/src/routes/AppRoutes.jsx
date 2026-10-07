import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import SelectRole from '../pages/auth/SelectRole';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Company pages
import CompanyDashboard from '../pages/company/CompanyDashboard';
import CreateCampaign from '../pages/company/CreateCampaign';
import Recommendations from '../pages/company/Recommendations';
import InfluencerDetail from '../pages/company/InfluencerDetail';
import GraphAnalytics from '../pages/company/GraphAnalytics';
import SavedInfluencers from '../pages/company/SavedInfluencers';
import CampaignHistory from '../pages/company/CampaignHistory';
import CompanyAnalytics from '../pages/company/CompanyAnalytics';
import CompanyProfile from '../pages/company/CompanyProfile';

// Influencer pages
import InfluencerDashboard from '../pages/influencer/InfluencerDashboard';
import InfluencerProfile from '../pages/influencer/InfluencerProfile';
import Inquiries from '../pages/influencer/Inquiries';
import OpportunityDetail from '../pages/influencer/OpportunityDetail';
import SavedOpportunities from '../pages/influencer/SavedOpportunities';

// Shared pages
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/select-role" element={<SelectRole />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Brand Partner Layout Dashboard routes */}
      <Route element={<DashboardLayout allowedRole="Company" />}>
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/campaigns/create" element={<CreateCampaign />} />
        <Route path="/company/recommendations" element={<Recommendations />} />
        <Route path="/company/influencers/:id" element={<InfluencerDetail />} />
        <Route path="/company/influencers/:id/graph" element={<GraphAnalytics />} />
        <Route path="/company/saved" element={<SavedInfluencers />} />
        <Route path="/company/campaigns/history" element={<CampaignHistory />} />
        <Route path="/company/analytics" element={<CompanyAnalytics />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/notifications" element={<Notifications />} />
        <Route path="/company/settings" element={<Settings />} />
      </Route>

      {/* Creator Layout Dashboard routes */}
      <Route element={<DashboardLayout allowedRole="Influencer" />}>
        <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
        <Route path="/influencer/profile" element={<InfluencerProfile />} />
        <Route path="/influencer/inquiries" element={<Inquiries />} />
        <Route path="/influencer/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/influencer/saved" element={<SavedOpportunities />} />
        <Route path="/influencer/notifications" element={<Notifications />} />
        <Route path="/influencer/settings" element={<Settings />} />
      </Route>

      {/* Redirect fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
