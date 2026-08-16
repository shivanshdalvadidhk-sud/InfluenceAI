import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { Mail, Check, X, Calendar, DollarSign, ListCollapse, BookOpen } from 'lucide-react';

const Inquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await influencerService.getInquiries();
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (err) {
      showToast('Error loading inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
    window.addEventListener('influenceai_inquiries_changed', loadInquiries);
    return () => window.removeEventListener('influenceai_inquiries_changed', loadInquiries);
  }, []);

  // Filter pipeline
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(inquiries.filter((i) => i.status === statusFilter));
    }
  }, [statusFilter, inquiries]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await influencerService.updateInquiryStatus(id, status);
      showToast(`Inquiry status marked as ${status}.`, 'success');
      loadInquiries();
    } catch (err) {
      showToast('Error updating status.', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New':
        return { bg: 'rgba(59, 130, 246, 0.08)', text: 'var(--accent-blue)' };
      case 'Interested':
        return { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--accent-green)' };
      case 'Declined':
        return { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--accent-red)' };
      default:
        return { bg: '#F1F5F9', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Campaign Inquiries Inbox"
        subtitle="Review sponsorship requests and proposals sent directly by brand partners."
        icon={<Mail size={22} />}
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {['All', 'New', 'Interested', 'Declined', 'Closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: statusFilter === status ? 'white' : 'transparent',
              color: statusFilter === status ? 'var(--primary-purple)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: statusFilter === status ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <span>Syncing inquiries list...</span>
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredInquiries.map((inq) => {
            const styles = getStatusStyle(inq.status);
            return (
              <div
                key={inq.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--border-radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {inq.campaignName}
                    </span>
                    <span style={{ backgroundColor: styles.bg, color: styles.text, fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                      {inq.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                    Proposed by: <strong style={{ color: 'var(--text-primary)' }}>{inq.companyName}</strong>
                  </span>
                  
                  {/* Info badges */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', marginTop: '10px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={14} style={{ color: 'var(--text-light)' }} />
                      Budget: <strong>{inq.budgetStr}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                      Received: {inq.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ListCollapse size={14} style={{ color: 'var(--text-light)' }} />
                      Deliverables: {inq.deliverables.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Actions Panel */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  
                  {/* View details */}
                  <button
                    onClick={() => navigate(`/influencer/opportunities/${inq.campaignId}`)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'white',
                      color: 'var(--primary-purple)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <BookOpen size={14} />
                    <span>View Campaign Brief</span>
                  </button>

                  {/* Accept/Decline triggers */}
                  {inq.status === 'New' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'Declined')}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          backgroundColor: 'transparent',
                          color: 'var(--accent-red)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'Interested')}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'var(--accent-green)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                      >
                        <Check size={16} />
                        <span>Accept Offer</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', maxWidth: '440px', margin: '40px auto 0 auto' }}>
          <span style={{ fontSize: '32px' }}>✉️</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>Inquiries inbox empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginTop: '4px' }}>Brands will send you direct sponsorship requests once they calculate matching scores on your profile.</p>
        </div>
      )}

    </div>
  );
};

export default Inquiries;
