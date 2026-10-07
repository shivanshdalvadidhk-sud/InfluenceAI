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
  Eye,
  Mail,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const trafficData = [
  { week: 'Wk 1', views: 420 },
  { week: 'Wk 2', views: 680 },
  { week: 'Wk 3', views: 590 },
  { week: 'Wk 4', views: 890 },
  { week: 'Wk 5', views: 1050 },
  { week: 'Wk 6', views: 1248 },
];

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Welcome header */}
      <PageHeader
        title={`Welcome back, ${creator?.name || 'Rohan'}`}
        subtitle="Manage your YouTube channel verified metrics and sponsorship inquiries."
        icon={<User size={22} />}
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Profile Completion" value="95%" trend="+2.4%" icon={<CheckCircle size={20} />} />
        <StatCard label="AI Brand Matches" value="38" trend="+14.2%" icon={<Sparkles size={20} />} />
        <StatCard label="Profile Views" value="1,248" trend="+22.4%" icon={<Eye size={20} />} />
        <StatCard label="Direct Inquiries" value={inquiries.length} trend="+12.0%" icon={<Mail size={20} />} />
      </div>

      {/* Main splits: Inquiries & Views Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="influencer-split">
        
        {/* Direct Inquiries */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: 'var(--primary-purple)' }} />
              <span>Direct Sponsorship Inquiries</span>
            </h3>
            <button
              onClick={() => navigate('/influencer/inquiries')}
              style={{ border: 'none', background: 'none', color: 'var(--primary-purple)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View Inbox
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Syncing inbox...</span>
            ) : inquiries.length > 0 ? (
              inquiries.slice(0, 3).map((inq) => {
                const campaignName = inq.campaignName || 'Sponsorship Integration Proposal';
                const companyName = inq.companyName || 'Partner Brand';
                const budgetDisplay = inq.budgetStr || (inq.budget ? `₹${Number(inq.budget).toLocaleString('en-IN')}` : '₹1,50,000');

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
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaignName}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: inq.status === 'New' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)', color: inq.status === 'New' ? 'var(--accent-blue)' : 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px' }}>
                          {inq.status || 'New'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        Brand: <strong>{companyName}</strong> • Budget Offer: <strong>{budgetDisplay}</strong>
                      </span>
                    </div>

                    {inq.status === 'New' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateStatus(inq.id, 'Declined')}
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--accent-red)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(inq.id, 'Interested')}
                          style={{
                            backgroundColor: 'var(--accent-green)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>Responded</span>
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No brand inquiries received yet.</span>
            )}
          </div>
        </div>

        {/* Discovery Views Chart */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>Brand Discovery Traffic</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Weekly profile views from searching brands</span>

          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="var(--primary-purple)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Creator tips */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ fontSize: '32px' }}>💡</div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>AI Tip: How to increase your brand compatibility</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Adding detailed content niches tags, specifying all languages you speak in your profile, and expanding your biography details helps our Sentence-BERT model calculate higher matches during brand searches.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .influencer-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InfluencerDashboard;
