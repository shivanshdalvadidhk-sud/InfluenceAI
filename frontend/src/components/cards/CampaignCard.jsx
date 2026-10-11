import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash, Copy, Eye, ExternalLink, Users, Video as Youtube, Sparkles } from 'lucide-react';

const CampaignCard = ({ campaign, onDuplicate, onDelete, onViewHistory }) => {
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
  const recs = Array.isArray(campaign.recommendations) ? campaign.recommendations : [];
  const formatSubs = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString('en-IN');
  };

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
        position: 'relative'
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
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.08)',
              color: 'var(--primary-purple)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase'
            }}
          >
            {campaign.category || 'fashion'}
          </span>
          <span
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Country: {campaign.target_country || campaign.targetCountry || campaign.state || 'India'}
          </span>
          <span
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              color: 'var(--accent-blue)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase'
            }}
          >
            Goal: {campaign.campaign_goal || campaign.campaignGoal || campaign.goal || 'awareness'}
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
            fontFamily: 'var(--font-heading)'
          }}
        >
          Status: {campaign.status}
        </span>
      </div>

      {/* Campaign Name & Description */}
      <div>
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            margin: 0
          }}
        >
          {campaign.name}
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            lineHeight: 1.4
          }}
        >
          {campaign.campaign_description || campaign.description}
        </p>
      </div>

      {/* Campaign AI Engine Parameters Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          fontSize: '0.8rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            BUDGET (INR)
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {campaign?.budgetStr || (campaign?.budget ? `₹${Number(campaign.budget).toLocaleString('en-IN')}` : '₹1,00,000')}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            CAMPAIGN GOAL
          </span>
          <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
            {campaign.campaign_goal || campaign.campaignGoal || campaign.goal || 'awareness'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            TOP N / STRICT NICHE
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            Top {campaign.top_n || campaign.topN || 10} ({campaign.strict_category !== false ? 'Strict' : 'Broad'})
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-light)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            TOP AI MATCH CANDIDATE
          </span>
          <span style={{ fontWeight: 700, color: 'var(--primary-purple)', fontSize: '0.9rem' }}>
            {campaign.topMatch || 'Ready for AI Match'}
          </span>
        </div>
      </div>

      {/* Stored Recommended Channels Preview (if available) */}
      {recs.length > 0 && (
        <div
          style={{
            border: '1px solid rgba(124, 58, 237, 0.18)',
            backgroundColor: 'rgba(124, 58, 237, 0.03)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-purple)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} /> STORED AI RECOMMENDED CHANNELS ({recs.length})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {recs.slice(0, 3).map((rec, idx) => {
              const name = rec.channel_name || rec.name || 'YouTube Channel';
              const subs = Number(rec.subscriber_count ?? rec.subscribers ?? 0);
              const url = rec.channel_url || rec.profileUrl || '';
              const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=120`;
              const thumb = rec.thumbnail_url || rec.avatar || fallback;
              const score = rec.recommendation_score !== undefined ? Math.round(rec.recommendation_score * 100) : rec.finalScore || 85;
              return (
                <div
                  key={rec.channel_id || rec.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <img
                    src={thumb}
                    alt={name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallback;
                    }}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{rec.rank || idx + 1} {name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary-purple)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Users size={11} /> {formatSubs(subs)} subs
                      </span>
                      <span>•</span>
                      <span style={{ color: '#059669' }}>{score}% Match</span>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--accent-red)',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px'
                        }}
                      >
                        <Youtube size={11} /> Channel
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <Calendar size={14} style={{ color: 'var(--text-light)' }} />
          <span>Created on {campaign.createdDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onDelete && (
            <button
              onClick={() => onDelete(campaign.id)}
              title="Delete Campaign"
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
                transition: 'all 0.2s'
              }}
            >
              <Trash size={14} />
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(campaign.id)}
              title="Duplicate Campaign"
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
                transition: 'all 0.2s'
              }}
            >
              <Copy size={14} />
            </button>
          )}

          {onViewHistory && (
            <button
              onClick={() => onViewHistory(campaign.id)}
              style={{
                backgroundColor: '#F1F5F9',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} />
              <span>Run History</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/company/recommendations?campaign=${campaign.id}`)}
            style={{
              backgroundColor: 'var(--primary-purple)',
              color: '#FFFFFF',
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
              transition: 'all 0.2s'
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
