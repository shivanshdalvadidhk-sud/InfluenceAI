import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { authService } from '../services/authService';
import { campaignService } from '../services/campaignService';
import { recommendationService } from '../services/recommendationService';
import { influencerService } from '../services/influencerService';
import { Bell, Sparkles, Briefcase, Trash } from 'lucide-react';
import { showToast } from '../components/common/Toast';

const Notifications = () => {
  const role = authService.getCurrentRole();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const items = [];
        if (role === 'Company') {
          const [camps, history] = await Promise.all([
            campaignService.getCampaigns(),
            recommendationService.getAllRecommendationHistory()
          ]);
          history.slice(0, 5).forEach((h) => {
            items.push({
              id: `hist-${h.id}`,
              type: 'Recommendation',
              text: `Generated ${Array.isArray(h.recommendations) ? h.recommendations.length : 0} channel matches for "${h.campaign_name || h.category}".`,
              time: h.created_at ? new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
              read: false,
              icon: <Sparkles size={16} />
            });
          });
          camps.slice(0, 5).forEach((c) => {
            items.push({
              id: `camp-${c.id}`,
              type: 'Campaign',
              text: `Campaign "${c.name}" (${c.category.toUpperCase()}) is ${c.status}.`,
              time: c.createdDate || 'Recently',
              read: true,
              icon: <Briefcase size={16} />
            });
          });
        } else {
          const inquiries = await influencerService.getInquiries();
          inquiries.forEach((inq) => {
            items.push({
              id: `inq-${inq.id}`,
              type: 'Sponsorship Offer',
              text: `${inq.companyName} sent a collaboration inquiry for "${inq.campaignName}" (${inq.budgetStr}).`,
              time: inq.date || 'Recently',
              read: inq.status !== 'New',
              icon: <Briefcase size={16} />
            });
          });
        }
        setNotices(items);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [role]);

  const handleMarkAllRead = () => {
    setNotices(notices.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const handleDelete = (id) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      <PageHeader
        title="Notifications Center"
        subtitle="Stay updated on your campaigns, recommendation runs, and sponsorship inquiries."
        icon={<Bell size={22} />}
        action={
          notices.length > 0 ? (
            <button
              onClick={handleMarkAllRead}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Mark all as read
            </button>
          ) : null
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          Loading notifications...
        </div>
      ) : notices.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notices.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                opacity: n.read ? 0.75 : 1,
                borderLeft: n.read ? '1px solid var(--border-color)' : '4px solid var(--primary-purple)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {n.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      {n.type}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>• {n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: n.read ? 500 : 600 }}>
                    {n.text}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(n.id)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-light)',
                  padding: '6px'
                }}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '440px',
            margin: '40px auto 0 auto'
          }}
        >
          <span style={{ fontSize: '32px' }}>🔔</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>No Notifications Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {role === 'Company'
              ? 'Activity from your campaigns and AI recommendation runs will appear here.'
              : 'New sponsorship offers and campaign inquiries from brands will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
