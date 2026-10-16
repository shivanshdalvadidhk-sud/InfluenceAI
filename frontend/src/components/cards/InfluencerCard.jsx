import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { influencerService, buildSafeYoutubeUrl } from '../../services/influencerService';
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
  Eye,
  Copy,
  Check,
  TrendingUp
} from 'lucide-react';
import { Tooltip } from '@mui/material';

const InfluencerCard = ({ influencer, showCampaignContext = false, onRemove }) => {
  const navigate = useNavigate();
  const channelId = (influencer?.channel_id || influencer?.id || '').toString();
  const [isSaved, setIsSaved] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const contactEmail = influencer?.contact_email || influencer?.contactEmail || null;

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

  const channelUrl = buildSafeYoutubeUrl(
    influencer?.channel_url || influencer?.profileUrl || influencer?.handle,
    channelId
  );

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
    MACRO: { bg: 'rgba(245, 158, 11, 0.12)', text: '#D97706' },
    MEGA: { bg: 'rgba(236, 72, 153, 0.12)', text: '#DB2777' }
  }[tier] || { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' };

  return (
    <div
      onClick={() => navigate(`/company/influencers/${channelId}`)}
      style={{
        backgroundColor: 'var(--bg-card, #FFFFFF)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #E2E8F0)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        height: '100%',
        transition: 'all 0.25s ease'
      }}
      className="card-hover-lift"
    >
      {/* Top badges: Platform, Tier, Match Score */}
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
          <span
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--accent-red, #EF4444)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              fontFamily: 'var(--font-heading)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Youtube size={13} /> YouTube
          </span>
          <span
            style={{
              backgroundColor: tierColors.bg,
              color: tierColors.text,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
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
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #EDE9FE',
            flexShrink: 0,
            backgroundColor: '#F1F5F9'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary, #0F172A)',
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
              <span style={{ color: 'var(--accent-blue, #3B82F6)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={16} fill="currentColor" color="white" />
              </span>
            </Tooltip>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary, #64748B)',
              fontSize: '0.75rem',
              marginTop: '4px'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} style={{ color: 'var(--text-light, #94A3B8)' }} />
              {country}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #0F172A)' }}>{category}</span>
          </div>
        </div>
      </div>

      {/* Prominent Subscriber & Total Views Highlight Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-purple, #7C3AED)'
            }}
          >
            <Users size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #64748B)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Subscribers
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-purple, #7C3AED)' }}>
                {formatNumber(subscriberCount)}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-light, #94A3B8)' }}>
                ({subscriberCount.toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary, #64748B)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Views
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #0F172A)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={13} style={{ color: 'var(--accent-blue, #3B82F6)' }} />
            {formatNumber(viewCount)}
          </span>
        </div>
      </div>

      {/* Engagement Rate Display (Clean single metric row replacing previous Final AI Score) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '8px 12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={15} style={{ color: 'var(--accent-blue, #3B82F6)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748B)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Engagement Rate
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-blue, #3B82F6)' }}>
            {engagementPercent}%
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: (influencer?.dominant_sentiment === 'positive' || Number(influencer?.comment_sentiment_score) >= 0.65)
                ? '#059669'
                : ((influencer?.dominant_sentiment === 'negative' || (influencer?.comment_sentiment_score && Number(influencer?.comment_sentiment_score) < 0.4))
                ? '#DC2626'
                : (Number(engagementPercent) >= 3.5 ? '#059669' : '#64748B')),
              backgroundColor: (influencer?.dominant_sentiment === 'positive' || Number(influencer?.comment_sentiment_score) >= 0.65)
                ? 'rgba(16, 185, 129, 0.1)'
                : ((influencer?.dominant_sentiment === 'negative' || (influencer?.comment_sentiment_score && Number(influencer?.comment_sentiment_score) < 0.4))
                ? 'rgba(239, 68, 68, 0.1)'
                : (Number(engagementPercent) >= 3.5 ? 'rgba(16, 185, 129, 0.1)' : '#E2E8F0')),
              padding: '2px 8px',
              borderRadius: '12px'
            }}
          >
            {influencer?.dominant_sentiment
              ? `${influencer.dominant_sentiment.charAt(0).toUpperCase() + influencer.dominant_sentiment.slice(1)} Sentiment`
              : (Number(engagementPercent) >= 5 ? 'High' : Number(engagementPercent) >= 3 ? 'Good' : 'Moderate')}
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
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0'
          }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary, #64748B)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} style={{ color: 'var(--primary-purple, #7C3AED)' }} /> WHY RECOMMENDED
          </span>
          {reasons.slice(0, 2).map((reason, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary, #64748B)',
                lineHeight: 1.35,
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
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748B)' }}>
          <div>
            Campaign: <span style={{ fontWeight: 600, color: 'var(--text-primary, #0F172A)' }}>{influencer.campaignName}</span>
          </div>
        </div>
      )}

      {/* Contact Email (shown only if registered on platform and opted in) */}
      {contactEmail && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(124, 58, 237, 0.04)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '10px',
            padding: '7px 12px',
            fontSize: '0.8rem',
            gap: '8px',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Mail size={13} style={{ color: 'var(--primary-purple, #7C3AED)', flexShrink: 0 }} />
            <a
              href={`mailto:${contactEmail}`}
              title={`Send collaboration email to ${contactEmail}`}
              style={{
                color: 'var(--primary-purple, #7C3AED)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.78rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {contactEmail}
            </a>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(contactEmail);
              setCopiedEmail(true);
              setTimeout(() => setCopiedEmail(false), 2000);
            }}
            title="Copy email to clipboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              backgroundColor: copiedEmail ? '#DCFCE7' : '#EDE9FE',
              color: copiedEmail ? '#166534' : 'var(--primary-purple, #7C3AED)',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700,
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
          >
            {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}

      {/* Bottom Action Buttons: Bookmark, YouTube Channel, and View Details */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          marginTop: 'auto',
          paddingTop: '4px'
        }}
      >
        <button
          onClick={handleToggleSave}
          title={isSaved ? 'Remove from saved' : 'Save channel'}
          style={{
            flexShrink: 0,
            width: '40px',
            height: '40px',
            border: isSaved ? '1px solid var(--primary-purple, #7C3AED)' : '1px solid var(--border-color, #E2E8F0)',
            backgroundColor: isSaved ? 'rgba(124, 58, 237, 0.08)' : '#F8FAFC',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? 'var(--primary-purple, #7C3AED)' : 'var(--text-secondary, #64748B)',
            transition: 'all 0.2s'
          }}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        <button
          onClick={handleVisitProfile}
          title="Open YouTube Channel in new tab"
          style={{
            flex: 1,
            height: '40px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            borderRadius: '10px',
            padding: '0 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--accent-red, #EF4444)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.82rem',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
        >
          <Youtube size={16} />
          <span>Channel</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/company/influencers/${channelId}`);
          }}
          title="View detailed channel metrics & analysis"
          style={{
            flex: 1.2,
            height: '40px',
            backgroundColor: 'var(--primary-purple, #7C3AED)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '0 14px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          <span>Details</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

export default InfluencerCard;
