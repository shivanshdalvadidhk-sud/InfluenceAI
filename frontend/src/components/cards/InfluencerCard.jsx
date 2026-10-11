import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { influencerService } from '../../services/influencerService';
import MatchBadge from '../common/MatchBadge';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Users,
  Video as Youtube,
  Sparkles,
  Eye
} from 'lucide-react';
import { Tooltip } from '@mui/material';

const InfluencerCard = ({ influencer, showCampaignContext = false, onRemove }) => {
  const navigate = useNavigate();
  const channelId = (influencer?.channel_id || influencer?.id || '').toString();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (channelId) {
      setIsSaved(influencerService.isInfluencerSaved(channelId));
    }
  }, [channelId]);

  const channelName =
    influencer?.channel_name ||
    influencer?.name ||
    influencer?.full_name ||
    influencer?.creator_name ||
    'YouTube Channel';

  const channelUrl =
    influencer?.channel_url ||
    influencer?.profileUrl ||
    (channelId.startsWith('UC')
      ? `https://www.youtube.com/channel/${channelId}`
      : `https://www.youtube.com/${influencer?.handle || ''}`);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    channelName
  )}&background=6366f1&color=fff&size=200`;

  const thumbnailUrl = influencer?.thumbnail_url || influencer?.avatar || fallbackAvatar;

  const subscriberCount = Number(
    influencer?.subscriber_count ?? influencer?.subscribers ?? 0
  );

  const viewCount = Number(
    influencer?.view_count ?? influencer?.avgViews ?? influencer?.avg_views ?? 0
  );

  const rawEngagement = Number(
    influencer?.engagement_rate ?? influencer?.engagementRate ?? 0
  );
  const engagementPercent =
    rawEngagement <= 1 && rawEngagement > 0
      ? (rawEngagement * 100).toFixed(2)
      : Number(rawEngagement).toFixed(2);

  const recScore =
    influencer?.recommendation_score !== undefined
      ? Math.round(Number(influencer.recommendation_score) * 100)
      : influencer?.finalScore || influencer?.graphScore || 85;

  const tier = (
    influencer?.tier ||
    (subscriberCount < 10000
      ? 'nano'
      : subscriberCount < 100000
      ? 'micro'
      : subscriberCount <= 500000
      ? 'mid'
      : 'macro')
  ).toUpperCase();

  const country = influencer?.country || influencer?.state || 'IN';
  const category = (influencer?.category || influencer?.content_niche_category || 'general').toUpperCase();
  const rawReasons = Array.isArray(influencer?.reasons) ? influencer.reasons : [];
  const reasons = rawReasons.filter(
    (r) =>
      !String(r).toLowerCase().includes('not_verified') &&
      !String(r).toLowerCase().includes('semantic') &&
      !String(r).toLowerCase().includes('fee data unavailable')
  );

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    const nowSaved = await influencerService.toggleSaveInfluencer(channelId);
    setIsSaved(nowSaved);
    if (!nowSaved && onRemove) {
      onRemove(channelId);
    }
  };

  const handleSendOffer = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('influenceai_open_inquiry_modal', {
        detail: {
          ...influencer,
          id: channelId,
          name: channelName,
          avatar: thumbnailUrl,
          subscribers: subscriberCount
        }
      })
    );
  };

  const handleVisitProfile = (e) => {
    e.stopPropagation();
    if (channelUrl) {
      window.open(channelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString('en-IN');
  };

  const tierColors = {
    NANO: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
    MICRO: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB' },
    MID: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' },
    MACRO: { bg: 'rgba(245, 158, 11, 0.12)', text: '#D97706' }
  }[tier] || { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' };

  return (
    <div
      onClick={() => navigate(`/company/influencers/${channelId}`)}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        height: '100%'
      }}
      className="card-hover-lift"
    >
      {/* Top badges: Rank, Platform, Tier, Match Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {influencer?.rank && (
            <span
              style={{
                backgroundColor: 'var(--primary-purple)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)'
              }}
            >
              #{influencer.rank}
            </span>
          )}
          <span
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--accent-red)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '10px',
              fontFamily: 'var(--font-heading)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Youtube size={12} /> YouTube
          </span>
          <span
            style={{
              backgroundColor: tierColors.bg,
              color: tierColors.text,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '10px',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {tier} TIER
          </span>
        </div>
        <MatchBadge score={recScore} size="sm" />
      </div>

      {/* Profile Header with Thumbnail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src={thumbnailUrl}
          alt={channelName}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackAvatar;
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--primary-light)',
            flexShrink: 0,
            backgroundColor: '#F1F5F9'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3
              style={{
                fontSize: '1.02rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={channelName}
            >
              {channelName}
            </h3>
            <Tooltip title="Verified YouTube Channel">
              <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={15} fill="currentColor" color="white" />
              </span>
            </Tooltip>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              marginTop: '4px'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} style={{ color: 'var(--text-light)' }} />
              {country}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{category}</span>
          </div>
        </div>
      </div>

      {/* Prominent Subscriber & Total Views Highlight Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--primary-purple)', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
              Subscribers
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-purple)' }}>
              {formatNumber(subscriberCount)}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginLeft: '4px' }}>
              ({subscriberCount.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
            Total Views
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={13} style={{ color: 'var(--accent-blue)' }} />
            {formatNumber(viewCount)}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 14px',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
          padding: '10px 0'
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
            ENGAGEMENT RATE
          </span>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
            {engagementPercent}%
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
            FINAL AI SCORE
          </span>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
            {recScore}%
          </span>
        </div>
      </div>

      {/* Recommendation Reasons */}
      {reasons.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backgroundColor: '#F8FAFC',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)'
          }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} style={{ color: 'var(--primary-purple)' }} /> WHY RECOMMENDED
          </span>
          {reasons.slice(0, 2).map((reason, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.73rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.3,
                display: 'block'
              }}
            >
              • {reason}
            </span>
          ))}
        </div>
      )}

      {/* Campaign context if displayed in saved/history */}
      {showCampaignContext && influencer?.campaignName && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>
            Campaign: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{influencer.campaignName}</span>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          marginTop: 'auto'
        }}
      >
        <button
          onClick={handleToggleSave}
          title={isSaved ? 'Remove from saved' : 'Save channel'}
          style={{
            flexGrow: 0,
            border: '1px solid var(--border-color)',
            backgroundColor: isSaved ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
            borderRadius: '10px',
            padding: '9px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? 'var(--primary-purple)' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>

        <button
          onClick={handleVisitProfile}
          title="Open YouTube Channel Profile"
          style={{
            flexGrow: 1,
            border: '1px solid rgba(239, 68, 68, 0.25)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderRadius: '10px',
            padding: '9px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: 'var(--accent-red)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.78rem',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
        >
          <Youtube size={15} />
          <span>Channel</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/company/influencers/${channelId}`);
          }}
          style={{
            flexGrow: 1,
            backgroundColor: '#F1F5F9',
            color: 'var(--text-primary)',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 10px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
        >
          <ExternalLink size={13} />
          <span>Details</span>
        </button>

        <button
          onClick={handleSendOffer}
          style={{
            flexGrow: 1,
            backgroundColor: 'var(--primary-purple)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 10px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
        >
          <Mail size={13} />
          <span>Offer</span>
        </button>
      </div>
    </div>
  );
};

export default InfluencerCard;
