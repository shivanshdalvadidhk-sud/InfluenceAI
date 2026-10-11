import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Video as Youtube,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { recommendationService } from '../services/recommendationService';

const RecommendationHistory = ({ campaignId = null, onBack = null }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
    const handleUpdated = () => fetchHistory();
    window.addEventListener('influenceai_recommendations_updated', handleUpdated);
    return () => window.removeEventListener('influenceai_recommendations_updated', handleUpdated);
  }, [campaignId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = campaignId
        ? await recommendationService.getRecommendationHistory(campaignId)
        : await recommendationService.getAllRecommendationHistory();
      const list = Array.isArray(data) ? data : [];
      setHistory(list);
      if (list.length > 0 && !expandedId) {
        setExpandedId(list[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching recommendation history:', err);
      setError('Failed to load recommendation history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await recommendationService.deleteRecommendationHistory(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString('en-IN');
  };

  const downloadRecommendations = (record, index) => {
    const recommendations = record.recommendations || [];
    const csvContent = [
      [
        'Rank',
        'Channel ID',
        'Channel Name',
        'Category',
        'Country',
        'Tier',
        'Subscribers',
        'Total Views',
        'Engagement Rate (%)',
        'Recommendation Score'
      ].join(','),
      ...recommendations.map((rec, i) => {
        const name = (rec.channel_name || rec.name || rec.full_name || 'Unknown').replace(/,/g, ' ');
        const eng =
          rec.engagement_rate !== undefined && rec.engagement_rate <= 1
            ? (rec.engagement_rate * 100).toFixed(2)
            : rec.engagementRate || 0;
        return [
          rec.rank || i + 1,
          rec.channel_id || rec.id || '',
          `"${name}"`,
          rec.category || rec.content_niche_category || '',
          rec.country || 'IN',
          rec.tier || '',
          rec.subscriber_count ?? rec.subscribers ?? 0,
          rec.view_count ?? rec.avgViews ?? 0,
          `${eng}%`,
          rec.recommendation_score ?? ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-recommendations-${record.category || 'run'}-${index + 1}.csv`;
    a.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}
      >
        <p style={{ fontWeight: 600 }}>Loading AI Recommendation History...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#F1F5F9',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              AI Recommendation History
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Every AI recommendation run for your account is stored with channel profiles, subscriber counts, and match scores.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'var(--primary-light)',
            color: 'var(--primary-purple)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem'
          }}
        >
          <RefreshCw size={14} /> Refresh History
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--accent-red)',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem'
          }}
        >
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
          <Sparkles size={36} style={{ color: 'var(--primary-purple)', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>No Recommendation Runs Stored Yet</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            Create a campaign or run a match in AI Recommendations to see your saved recommendation runs here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{history.length}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase' }}>
                Saved AI Runs
              </div>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {history.reduce((acc, h) => acc + (h.recommendations?.length || 0), 0)}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase' }}>
                Total Recommended Channels
              </div>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px'
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>
                {formatDate(history[0]?.created_at)}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', marginTop: '4px' }}>
                Latest Recommendation Run
              </div>
            </div>
          </div>

          {/* History List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((record, index) => {
              const isExpanded = expandedId === record.id;
              const recs = Array.isArray(record.recommendations) ? record.recommendations : [];
              return (
                <div
                  key={record.id || index}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {/* Record Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '16px 20px',
                      backgroundColor: isExpanded ? 'rgba(124, 58, 237, 0.04)' : '#F8FAFC',
                      cursor: 'pointer',
                      borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            backgroundColor: 'var(--primary-purple)',
                            color: 'white',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          Run #{history.length - index}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {record.campaign_name || `${(record.category || 'Campaign').toUpperCase()} Match`}
                        </span>
                        {record.category && (
                          <span
                            style={{
                              backgroundColor: 'rgba(124, 58, 237, 0.1)',
                              color: 'var(--primary-purple)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {record.category}
                          </span>
                        )}
                        {record.campaign_goal && (
                          <span
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: 'var(--accent-blue)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              textTransform: 'uppercase'
                            }}
                          >
                            Goal: {record.campaign_goal}
                          </span>
                        )}
                        {record.budget_inr && (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}
                          >
                            Budget: ₹{Number(record.budget_inr).toLocaleString('en-IN')}
                          </span>
                        )}
                        <span
                          style={{
                            backgroundColor: '#E2E8F0',
                            color: '#334155',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}
                        >
                          {recs.length} Channels Recommended
                        </span>
                      </div>

                      {record.campaign_description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {record.campaign_description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                        Generated on {formatDate(record.created_at)}
                        {record.target_country ? ` • Target Country: ${record.target_country}` : ' • Global'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadRecommendations(record, index);
                        }}
                        title="Download CSV"
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)'
                        }}
                      >
                        <Download size={14} /> CSV
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, record.id)}
                        title="Delete History Record"
                        style={{
                          padding: '8px',
                          backgroundColor: 'white',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: 'var(--accent-red)'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>

                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Channel Recommendations */}
                  {isExpanded && (
                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recs.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>
                          No channels recorded in this run.
                        </div>
                      ) : (
                        recs.map((rec, i) => {
                          const channelId = (rec.channel_id || rec.id || '').toString();
                          const name = rec.channel_name || rec.name || rec.full_name || 'YouTube Creator';
                          const channelUrl =
                            rec.channel_url ||
                            rec.profileUrl ||
                            (channelId.startsWith('UC') ? `https://www.youtube.com/channel/${channelId}` : '');
                          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name
                          )}&background=6366f1&color=fff&size=200`;
                          const thumb = rec.thumbnail_url || rec.avatar || fallbackAvatar;
                          const subs = Number(rec.subscriber_count ?? rec.subscribers ?? 0);
                          const views = Number(rec.view_count ?? rec.avgViews ?? 0);
                          const rawEng = Number(rec.engagement_rate ?? rec.engagementRate ?? 0);
                          const engPct = rawEng <= 1 && rawEng > 0 ? (rawEng * 100).toFixed(2) : Number(rawEng).toFixed(2);
                          const recScore =
                            rec.recommendation_score !== undefined
                              ? Math.round(Number(rec.recommendation_score) * 100)
                              : rec.finalScore || rec.score || 85;
                          const cleanReasons = Array.isArray(rec.reasons)
                            ? rec.reasons.filter(
                                (r) =>
                                  !String(r).toLowerCase().includes('not_verified') &&
                                  !String(r).toLowerCase().includes('semantic') &&
                                  !String(r).toLowerCase().includes('fee data unavailable')
                              )
                            : [];

                          return (
                            <div
                              key={`${record.id}-${channelId || i}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '14px',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-light)',
                                backgroundColor: '#FAFAFA'
                              }}
                            >
                              {/* Left: Rank + Avatar + Name */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px', flex: 1 }}>
                                <span
                                  style={{
                                    backgroundColor: 'var(--primary-light)',
                                    color: 'var(--primary-purple)',
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    padding: '4px 9px',
                                    borderRadius: '8px'
                                  }}
                                >
                                  #{rec.rank || i + 1}
                                </span>

                                <img
                                  src={thumb}
                                  alt={name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = fallbackAvatar;
                                  }}
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid var(--primary-light)',
                                    flexShrink: 0
                                  }}
                                />

                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                      {name}
                                    </h4>
                                    {rec.tier && (
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          padding: '2px 6px',
                                          borderRadius: '6px',
                                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                          color: 'var(--primary-purple)',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {rec.tier}
                                      </span>
                                    )}
                                  </div>

                                  {cleanReasons.length > 0 && (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                      {cleanReasons.join(' • ')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Center: Subscribers, Views, Engagement, Final Score */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                                <div>
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                    SUBSCRIBERS
                                  </span>
                                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-purple)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={13} />
                                    {formatNumber(subs)}
                                  </span>
                                </div>

                                <div>
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                    TOTAL VIEWS
                                  </span>
                                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {formatNumber(views)}
                                  </span>
                                </div>

                                <div>
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                    ENGAGEMENT
                                  </span>
                                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                    {engPct}%
                                  </span>
                                </div>

                                <div>
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                    AI SCORE
                                  </span>
                                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                                    {recScore}%
                                  </span>
                                </div>
                              </div>

                              {/* Right: Red Channel Button & Details Button */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {channelUrl && (
                                  <a
                                    href={channelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      color: 'var(--accent-red)',
                                      borderRadius: '8px',
                                      textDecoration: 'none',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <Youtube size={14} /> Channel
                                  </a>
                                )}
                                {channelId && (
                                  <button
                                    onClick={() => navigate(`/company/influencers/${channelId}`)}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: 'var(--primary-purple)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <Eye size={13} /> Details
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendationHistory;
