import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { authService } from '../services/authService';
import { Bell, Sparkles, User, Briefcase, Info, Trash } from 'lucide-react';
import { showToast } from '../components/common/Toast';

const Notifications = () => {
  const role = authService.getCurrentRole();

  const brandNotices = [
    { id: '1', type: 'Recommendation', text: 'AI Matching Engine completed candidate filtering for "Festive Tech & Lifestyle YouTube Launch". Found 11 matches.', time: '10 mins ago', read: false, icon: <Sparkles size={16} /> },
    { id: '2', type: 'Campaign', text: 'Vikramaditya Roy expressed interest in your "Summer Activewear Apparel Blast" brief.', time: '2 hours ago', read: false, icon: <Briefcase size={16} /> },
    { id: '3', type: 'Profile', text: 'Rohan Mehta updated his primary platform details and estimated rates card.', time: '1 day ago', read: true, icon: <User size={16} /> },
    { id: '4', type: 'System', text: 'Topological network graph index updated for 2,400 Indian creator nodes.', time: '2 days ago', read: true, icon: <Info size={16} /> }
  ];

  const creatorNotices = [
    { id: '1', type: 'Recommendation', text: 'Your profile matched a Technology campaign: "Festive Tech Launch 2026" with 94% suitability.', time: '12 mins ago', read: false, icon: <Sparkles size={16} /> },
    { id: '2', type: 'Campaign', text: 'Aura Lifestyle sent you a direct sponsorship offer: ₹1,84,800 for a Dedicated Video.', time: '1 hour ago', read: false, icon: <Briefcase size={16} /> },
    { id: '3', type: 'System', text: 'InfluenceAI updated your PageRank and Closeness Centrality parameters.', time: '3 hours ago', read: true, icon: <Info size={16} /> },
    { id: '4', type: 'Profile', text: 'Successfully verified and connected YouTube channel API handle.', time: '3 days ago', read: true, icon: <User size={16} /> }
  ];

  const [notices, setNotices] = useState(role === 'Company' ? brandNotices : creatorNotices);

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
        subtitle="Manage match updates, campaigns applications, and network indexes updates."
        icon={<Bell size={22} />}
        action={
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
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            Mark all as read
          </button>
        }
      />

      {notices.length > 0 ? (
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
                transition: 'all 0.2s',
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
                    justifyContent: 'center',
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
                  padding: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-light)')}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', maxWidth: '440px', margin: '40px auto 0 auto' }}>
          <span style={{ fontSize: '32px' }}>🔔</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>Inbox empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>You have read all notification logs.</p>
        </div>
      )}

    </div>
  );
};

export default Notifications;
