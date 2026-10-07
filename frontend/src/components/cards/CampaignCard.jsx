import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash, Copy, Eye, BarChart } from 'lucide-react';

const CampaignCard = ({ campaign, onDuplicate, onDelete }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--accent-green)' };
      case 'Completed':
        return { bg: 'rgba(59, 130, 246, 0.08)', text: 'var(--accent-blue)' };
      case 'Draft':
        return { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--accent-yellow)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.08)', text: 'var(--text-secondary)' };
    }
  };

  const colors = getStatusColor(campaign.status);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      className="card-hover-lift"
    >
      {/* Top Details */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.08)',
              color: 'var(--primary-purple)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {campaign.category}
          </span>
          <span
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {campaign.state}
          </span>
        </div>

        <span
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '12px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Status: {campaign.status}
        </span>
      </div>

      {/* Campaign Name */}
      <div>
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {campaign.name}
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            lineHeight: 1.4,
          }}
        >
          {campaign.description}
        </p>
      </div>

      {/* Campaign Details Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          fontSize: '0.8rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            BUDGET ALLOCATION
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {campaign?.budgetStr || (campaign?.budget ? `₹${Number(campaign.budget).toLocaleString('en-IN')}` : '₹0')}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            TARGET AUDIENCE
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {campaign.audienceAgeRange ? `${campaign.audienceAgeRange[0]}-${campaign.audienceAgeRange[1]} Yrs` : '18-35 Yrs'} ({campaign.audienceGender || 'All'})
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            CAMPAIGN GOAL
          </span>
          <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
            {campaign.goal}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            TOP AI MATCH CANDIDATE
          </span>
          <span style={{ fontWeight: 700, color: 'var(--primary-purple)', fontSize: '0.9rem' }}>
            {campaign.topMatch || 'Calculating...'}
          </span>
        </div>
      </div>

      {/* Bottom section with Date & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '16px',
          marginTop: 'auto',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <Calendar size={14} style={{ color: 'var(--text-light)' }} />
          <span>Created on {campaign.createdDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onDelete && (
            <button
              onClick={() => onDelete(campaign.id)}
              style={{
                border: '1px solid rgba(239, 68, 68, 0.2)',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-red)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash size={14} />
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(campaign.id)}
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Copy size={14} />
            </button>
          )}

          <button
            onClick={() => navigate(`/company/recommendations?campaign=${campaign.id}`)}
            style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-purple)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-purple)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              e.currentTarget.style.color = 'var(--primary-purple)';
            }}
          >
            <Eye size={14} />
            <span>AI Matches</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
