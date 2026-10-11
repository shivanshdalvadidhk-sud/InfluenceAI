import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreBreakdown from '../../components/common/ScoreBreakdown';
import MatchBadge from '../../components/common/MatchBadge';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import {
  Users,
  MapPin,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Mail,
  TrendingUp,
  Video,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';

const InfluencerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [influencer, setInfluencer] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreator = async () => {
      setLoading(true);
      const data = await influencerService.getInfluencerById(id);
      if (data) {
        setInfluencer(data);
        setIsSaved(influencerService.isInfluencerSaved(data.channel_id || data.id));
      } else {
        showToast('Creator profile not found.', 'error');
        navigate('/company/recommendations');
      }
      setLoading(false);
    };
    loadCreator();
  }, [id, navigate]);

  const handleToggleSave = async () => {
    const cid = influencer.channel_id || influencer.id;
    const nowSaved = await influencerService.toggleSaveInfluencer(cid);
    setIsSaved(nowSaved);
    showToast(nowSaved ? 'Channel bookmarked.' : 'Bookmark removed.', 'info');
  };

  const handleSendOffer = () => {
    window.dispatchEvent(new CustomEvent('influenceai_open_inquiry_modal', { detail: influencer }));
  };

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString('en-IN');
  };

  if (loading || !influencer) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--primary-light)',
            borderTopColor: 'var(--primary-purple)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto'
          }}
        />
        <span>Loading YouTube channel statistics...</span>
      </div>
    );
  }

  const channelName = influencer.channel_name || influencer.name || 'YouTube Channel';
  const channelUrl =
    influencer.channel_url ||
    (String(influencer.id).startsWith('UC') ? `https://www.youtube.com/channel/${influencer.id}` : '');
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    channelName
  )}&background=6366f1&color=fff&size=200`;
  const thumbnailUrl = influencer.thumbnail_url || influencer.avatar || fallbackAvatar;

  const subscriberCount = Number(influencer.subscriber_count ?? influencer.subscribers ?? 0);
  const viewCount = Number(influencer.view_count ?? influencer.avgViews ?? 0);
  const rawEng = Number(influencer.engagement_rate ?? influencer.engagementRate ?? 0);
  const engPercent = rawEng <= 1 && rawEng > 0 ? (rawEng * 100).toFixed(2) : Number(rawEng).toFixed(2);
  const tier = (influencer.tier || 'mid').toUpperCase();
  const engScorePct =
    influencer.engagement_score !== undefined
      ? Math.round(Number(influencer.engagement_score) * 100)
      : influencer.engagementScore || 80;
  const recScorePct =
    influencer.recommendation_score !== undefined
      ? Math.round(Number(influencer.recommendation_score) * 100)
      : influencer.finalScore || 85;

  const rawReasons = Array.isArray(influencer.reasons) ? influencer.reasons : [];
  const reasons = rawReasons.filter(
    (r) =>
      !String(r).toLowerCase().includes('not_verified') &&
      !String(r).toLowerCase().includes('semantic') &&
      !String(r).toLowerCase().includes('fee data unavailable')
  );

  const tabs = ['Overview', 'AI Score Breakdown'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          background: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          width: 'fit-content'
        }}
      >
        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
        <span>Back to Recommendations</span>
      </button>

      {/* Profile Header Card */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '28px 30px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <img
            src={thumbnailUrl}
            alt={channelName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackAvatar;
            }}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary-light)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: 0 }}>
                {channelName}
              </h2>
              <CheckCircle2 size={18} fill="var(--accent-blue)" color="white" />
              <MatchBadge score={recScorePct} size="sm" />
              <span
                style={{
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: 'var(--primary-purple)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '8px'
                }}
              >
                {tier} TIER
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} style={{ color: 'var(--text-light)' }} />
                Country: <strong>{influencer.country || influencer.state || 'IN'}</strong>
              </span>
              <span>
                Platform: <strong style={{ color: 'var(--text-primary)' }}>YouTube</strong>
              </span>
              <span>
                Category: <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{influencer.category}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleSave}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isSaved ? 'var(--primary-purple)' : 'var(--text-secondary)'
            }}
            title={isSaved ? 'Remove Bookmark' : 'Bookmark Channel'}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>

          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px'
              }}
            >
              <Video size={18} />
              <span>Visit YouTube Channel</span>
            </a>
          )}

          <button
            onClick={handleSendOffer}
            className="button-gradient"
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Mail size={16} />
            <span>Inquiry Sponsorship</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
        {[
          {
            label: 'YouTube Subscribers',
            val: formatNumber(subscriberCount),
            desc: `${subscriberCount.toLocaleString('en-IN')} subscribers (${tier} tier)`,
            icon: <Users size={18} />
          },
          {
            label: 'Total Channel Views',
            val: formatNumber(viewCount),
            desc: `${viewCount.toLocaleString('en-IN')} cumulative views`,
            icon: <Video size={18} />
          },
          {
            label: 'Engagement Rate',
            val: `${engPercent}%`,
            desc: `Engagement Score: ${engScorePct}%`,
            icon: <TrendingUp size={18} />
          },
          {
            label: 'AI Recommendation Score',
            val: `${recScorePct}%`,
            desc: 'Overall AI Compatibility Score',
            icon: <Award size={18} />
          }
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {m.label}
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                {m.val}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{m.desc}</span>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {m.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? 'var(--primary-purple)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '280px' }}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="detail-split">
            {/* Bio Card */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Channel Description & Metadata
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {influencer.bio || influencer.description || 'Verified YouTube creator indexed in InfluenceAI.'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-purple)',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Niche: {influencer.category}
                </span>
                <span
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  Channel ID: {influencer.channel_id || influencer.id}
                </span>
              </div>
            </div>

            {/* AI Engine Reasons */}
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--primary-purple)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={18} /> Why This Channel Was Recommended
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                {reasons.length > 0 ? (
                  reasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block' }}>Content & Category Match</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Strong alignment between your campaign brief and this creator's content focus.
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block' }}>Subscriber Tier ({tier})</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Channel audience size ({subscriberCount.toLocaleString('en-IN')} subscribers) fits your campaign reach goals.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'AI Score Breakdown' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <ScoreBreakdown
              audience={88}
              engagement={engScorePct}
              final={recScorePct}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .detail-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InfluencerDetail;
