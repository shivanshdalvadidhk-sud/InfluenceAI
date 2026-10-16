import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import { authService } from '../../services/authService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import {
  User,
  Sparkles,
  Mail,
  CheckCircle,
  Clock
} from 'lucide-react';

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const creator = authService.getCurrentUser();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const list = await influencerService.getInquiries();
      setInquiries(list || []);
    } catch (err) {
      console.error('Error loading influencer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('influenceai_inquiries_changed', loadDashboardData);
    return () => window.removeEventListener('influenceai_inquiries_changed', loadDashboardData);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await influencerService.updateInquiryStatus(id, status);
      showToast(`Inquiry marked as ${status}.`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Error updating status.', 'error');
    }
  };

  const newOffersCount = inquiries.filter((i) => i.status === 'Pending' || i.status === 'New').length;
  const acceptedCount = inquiries.filter((i) => i.status === 'Accepted' || i.status === 'Interested').length;
  const hasProfileDetails = Boolean(creator?.bio && creator?.subscribers > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      {/* Welcome header */}
      <PageHeader
        title={`Welcome, ${creator?.creatorName || creator?.name || 'Creator'}`}
        subtitle="Manage your YouTube channel profile and respond to brand sponsorship inquiries."
        icon={<User size={22} />}
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard
          label="Direct Inquiries"
          value={inquiries.length}
          trend={inquiries.length > 0 ? 'Total Received' : 'No inquiries yet'}
          icon={<Mail size={20} />}
        />
        <StatCard
          label="Pending Brand Offers"
          value={newOffersCount}
          trend={newOffersCount > 0 ? 'Awaiting Response' : 'All caught up'}
          icon={<Sparkles size={20} />}
        />
        <StatCard
          label="Accepted Collaborations"
          value={acceptedCount}
          trend={acceptedCount > 0 ? 'Active' : 'None accepted yet'}
          icon={<CheckCircle size={20} />}
        />
      </div>

      {/* Direct Inquiries */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Mail size={18} style={{ color: 'var(--primary-purple)' }} />
            <span>Direct Sponsorship Inquiries</span>
          </h3>
          {inquiries.length > 0 && (
            <button
              onClick={() => navigate('/influencer/inquiries')}
              style={{ border: 'none', background: 'none', color: 'var(--primary-purple)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View All
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Checking for brand inquiries...</span>
          ) : inquiries.length > 0 ? (
            inquiries.map((inq) => {
              const campaignName = inq.campaignName || 'Sponsorship Collaboration Proposal';
              const companyName = inq.companyName || 'Brand Partner';
              const budgetDisplay = inq.budgetStr || (inq.budget ? `₹${Number(inq.budget).toLocaleString('en-IN')}` : '₹0');
              const isPending = inq.status === 'Pending' || inq.status === 'New';
              const isAccepted = inq.status === 'Accepted' || inq.status === 'Interested';

              return (
                <div
                  key={inq.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaignName}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isPending ? '#FEF3C7' : isAccepted ? '#D1FAE5' : '#FEE2E2',
                          color: isPending ? '#B45309' : isAccepted ? '#065F46' : '#B91C1C',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {isPending ? 'Pending Response' : isAccepted ? 'Accepted' : 'Declined'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      Brand: <strong>{companyName}</strong> • Budget Offer: <strong>{budgetDisplay}</strong>
                      {inq.deliverables && (
                        <span> • Deliverables: <em>{Array.isArray(inq.deliverables) ? inq.deliverables.join(', ') : inq.deliverables}</em></span>
                      )}
                    </span>
                  </div>

                  {isPending ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'Declined')}
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: 'var(--accent-red)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'Accepted')}
                        style={{
                          backgroundColor: 'var(--accent-green)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        Accept Offer
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <span style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} color="#059669" />
                      <span>Accepted & Active</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>Declined</span>
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              No sponsorship inquiries received yet. Keep your creator profile updated so brands can discover and contact you for upcoming campaigns.
            </div>
          )}
        </div>
      </div>

      {/* Quick Creator tip */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '32px' }}>💡</div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              {hasProfileDetails ? 'Your Creator Profile is Active' : 'Complete Your Creator Profile'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Adding your YouTube channel details, content category, languages, and bio helps brands discover your channel when matching campaigns.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/influencer/profile')}
          className="button-gradient"
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
