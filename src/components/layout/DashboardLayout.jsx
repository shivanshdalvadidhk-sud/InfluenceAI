import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { authService } from '../../services/authService';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../common/Toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Mail } from 'lucide-react';

const DashboardLayout = ({ allowedRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentRole = authService.getCurrentRole();

  // Inquiry Modal States
  const [openInquiry, setOpenInquiry] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [inquiryDeliverables, setInquiryDeliverables] = useState([]);
  const [customInquiryBudget, setCustomInquiryBudget] = useState(0);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || currentRole !== 'Company') return;

    // Load all campaigns
    const loadCampaigns = async () => {
      try {
        const campList = await campaignService.getCampaigns();
        setCampaigns(campList);
        if (campList.length > 0) {
          setSelectedCampaignId(campList[0].id);
        }
      } catch (err) {
        console.error('Error fetching campaigns globally:', err);
      }
    };
    loadCampaigns();

    // Listen for custom event to open the inquiry modal from anywhere
    const handleOpenInquiry = (e) => {
      const creator = e.detail;
      setSelectedCreator(creator);
      setInquiryDeliverables([creator.format] || []);
      setCustomInquiryBudget(creator.estimatedCost);
      setOpenInquiry(true);
    };

    window.addEventListener('influenceai_open_inquiry_modal', handleOpenInquiry);
    return () => {
      window.removeEventListener('influenceai_open_inquiry_modal', handleOpenInquiry);
    };
  }, [isAuthenticated, currentRole]);

  const handleInquirySubmit = async () => {
    if (!selectedCampaignId) {
      showToast('Please select a campaign.', 'error');
      return;
    }

    setSendingInquiry(true);
    try {
      await influencerService.sendInquiry({
        influencerId: selectedCreator.id,
        influencerName: selectedCreator.name,
        influencerHandle: selectedCreator.handle,
        influencerAvatar: selectedCreator.avatar,
        campaignId: selectedCampaignId,
        campaignName: campaigns.find((c) => c.id === selectedCampaignId)?.name || 'Campaign Launch',
        budget: customInquiryBudget,
        budgetStr: `₹${Number(customInquiryBudget).toLocaleString('en-IN')}`,
        deliverables: inquiryDeliverables
      });
      showToast(`Inquiry dispatched to ${selectedCreator.name}!`, 'success');
      setOpenInquiry(false);
    } catch (err) {
      showToast('Error sending inquiry.', 'error');
    } finally {
      setSendingInquiry(false);
    }
  };

  const toggleInquiryDeliverable = (d) => {
    if (inquiryDeliverables.includes(d)) {
      setInquiryDeliverables(inquiryDeliverables.filter(item => item !== d));
    } else {
      setInquiryDeliverables([...inquiryDeliverables, d]);
    }
  };

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

      {/* Global Inquiry Sponsor offer modal */}
      {selectedCreator && (
        <Dialog open={openInquiry} onClose={() => setOpenInquiry(false)} maxWidth="sm" fullWidth>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>
            ✨ Send Sponsorship Inquiry
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
            
            {/* Creator details summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <img src={selectedCreator.avatar} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{selectedCreator.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedCreator.handle} • Collab Rate: ₹{selectedCreator.estimatedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Campaign Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Active Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deliverables selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Deliverables for Creator</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Dedicated Video', 'Integrated Sponsor Segment', 'Short/Reel', 'Story', 'Product Review'].map((d) => {
                  const isChecked = inquiryDeliverables.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleInquiryDeliverable(d)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: isChecked ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--primary-purple)' : 'white',
                        color: isChecked ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget offer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Proposed Collaboration Budget (₹)</label>
              <input
                type="number"
                value={customInquiryBudget}
                onChange={(e) => setCustomInquiryBudget(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
            </div>

          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button onClick={() => setOpenInquiry(false)} style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              onClick={handleInquirySubmit}
              disabled={sendingInquiry}
              variant="contained"
              style={{
                backgroundColor: 'var(--primary-purple)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {sendingInquiry ? 'Sending...' : (
                <>
                  <Mail size={14} />
                  <span>Send Offer</span>
                </>
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardLayout;
