import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { influencerService } from '../../services/influencerService';
import MatchBadge from '../common/MatchBadge';
import { Bookmark, BookmarkCheck, CheckCircle2, ExternalLink, Mail, MapPin } from 'lucide-react';
import { Tooltip } from '@mui/material';

const InfluencerCard = ({ influencer, showCampaignContext = false, onRemove }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (influencer?.id) {
      setIsSaved(influencerService.isInfluencerSaved(influencer.id));
    }
  }, [influencer?.id]);

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    const nowSaved = await influencerService.toggleSaveInfluencer(influencer.id);
    setIsSaved(nowSaved);
    if (!nowSaved && onRemove) {
      onRemove(influencer.id);
    }
  };

  const handleSendOffer = (e) => {
    e.stopPropagation();
    // Dispatch offer details to global callback or redirect
    window.dispatchEvent(new CustomEvent('influenceai_open_inquiry_modal', { detail: influencer }));
  };

  // Convert numbers to readable format
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num;
  };

  return (
    <div
      onClick={() => navigate(`/company/influencers/${influencer.id}`)}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        height: '100%',
        minHeight: '380px',
      }}
      className="card-hover-lift"
    >
      {/* Top badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <span
          style={{
            backgroundColor: influencer.platform === 'YouTube' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(236, 72, 153, 0.08)',
            color: influencer.platform === 'YouTube' ? 'var(--accent-red)' : '#EC4899',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '12px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {influencer.platform}
        </span>
        <MatchBadge score={influencer.finalScore || influencer.graphScore} size="sm" />
      </div>

      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src={influencer.avatar}
          alt={influencer.name}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--primary-light)',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {influencer.name}
            </h3>
            <Tooltip title="Verified Creator">
              <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center' }}>
                <CheckCircle2 size={14} fill="currentColor" color="white" />
              </span>
            </Tooltip>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{influencer.handle}</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              marginTop: '4px',
            }}
          >
            <MapPin size={12} style={{ color: 'var(--text-light)' }} />
            <span>
              {influencer.city ? `${influencer.city}, ` : ''}{influencer.state}
            </span>
          </div>
        </div>
      </div>

      {/* Bio text */}
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '52px',
        }}
      >
        {influencer.bio}
      </p>

      {/* Deliverable tag */}
      {influencer.format && (
        <div>
          <span
            style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-purple)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            Format: {influencer.format}
          </span>
        </div>
      )}

      {/* Grid statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 16px',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 0',
          marginTop: 'auto',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>
            SUBSCRIBERS
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {influencer.subscribersStr || formatNumber(influencer.subscribers)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>
            AVG VIEWS / VIDEO
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-green)' }}>
            {influencer.avgViewsStr || formatNumber(influencer.avgViews)}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>
            AUDIENCE MATCH
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
            {influencer.audienceMatch || 85}%
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>
            EST. COLLAB COST
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{(influencer?.estimatedCost || (influencer?.subscribers ? Math.round(influencer.subscribers * 0.1) : 95000)).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Campaign context if displayed in saved/history */}
      {showCampaignContext && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            Campaign: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tech & Lifestyle Launch</span>
          </div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.7rem', marginTop: '2px' }}>Saved: Aug 16, 2026</div>
        </div>
      )}

      {/* Bottom buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        <button
          onClick={handleToggleSave}
          style={{
            flexGrow: 0,
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            borderRadius: '10px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? 'var(--primary-purple)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        <button
          onClick={() => navigate(`/company/influencers/${influencer.id}`)}
          style={{
            flexGrow: 1,
            backgroundColor: '#F1F5F9',
            color: 'var(--text-primary)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
        >
          <ExternalLink size={14} />
          <span>Profile Specs</span>
        </button>

        <button
          onClick={handleSendOffer}
          style={{
            flexGrow: 1,
            backgroundColor: 'var(--primary-purple)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-purple)')}
        >
          <Mail size={14} />
          <span>Sponsor Offer</span>
        </button>
      </div>
    </div>
  );
};

export default InfluencerCard;
