import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { authService } from '../../services/authService';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import { recommendationService } from '../../services/recommendationService';
import {
  Sparkles,
  PlusCircle,
  Bookmark,
  Layers,
  ArrowRight,
  FileSpreadsheet,
  FolderKanban
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [campaigns, setCampaigns] = useState([]);
  const [totalCampaignsCount, setTotalCampaignsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [topMatches, setTopMatches] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildChartDistribution = (recs = []) => {
    if (!Array.isArray(recs) || recs.length === 0) return [];
    const buckets = [
      { range: '60-70%', creators: 0 },
      { range: '70-80%', creators: 0 },
      { range: '80-90%', creators: 0 },
      { range: '90-95%', creators: 0 },
      { range: '95-100%', creators: 0 }
    ];
    recs.forEach((r) => {
      const score =
        r.recommendation_score !== undefined
          ? Math.round(Number(r.recommendation_score) * 100)
          : Number(r.finalScore || 0);
      if (score >= 95) buckets[4].creators += 1;
      else if (score >= 90) buckets[3].creators += 1;
      else if (score >= 80) buckets[2].creators += 1;
      else if (score >= 70) buckets[1].creators += 1;
      else buckets[0].creators += 1;
    });
    return buckets;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const camps = await campaignService.getCampaigns();
        setTotalCampaignsCount(camps.length);
        setCampaigns(camps.slice(0, 4));

        const saved = await influencerService.getSavedInfluencers();
        setSavedCount(saved.length);

        const history = await recommendationService.getAllRecommendationHistory();
        setHistoryCount(history.length);

        let allMatchedChannels = [];
        if (history.length > 0 && Array.isArray(history[0].recommendations) && history[0].recommendations.length > 0) {
          allMatchedChannels = history[0].recommendations;
        } else if (camps.length > 0 && Array.isArray(camps[0].recommendations) && camps[0].recommendations.length > 0) {
          allMatchedChannels = camps[0].recommendations;
        }

        setTopMatches(allMatchedChannels.slice(0, 3));
        setChartData(buildChartDistribution(allMatchedChannels));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const brandDisplayName = user?.brandName || user?.name || 'Brand Partner';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      {/* Header */}
      <PageHeader
        title={`Welcome, ${brandDisplayName}`}
        subtitle="Manage your influencer campaigns, track channel recommendations, and connect with YouTube creators."
        icon={<Sparkles size={22} />}
        action={
          <button
            onClick={() => navigate('/company/campaigns/create')}
            className="button-gradient"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} />
            <span>Create Campaign</span>
          </button>
        }
      />

      {/* Metrics Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        <StatCard
          label="Active Campaigns"
          value={totalCampaignsCount}
          trend={totalCampaignsCount > 0 ? 'Active' : 'No campaigns yet'}
          icon={<Layers size={20} />}
        />
        <StatCard
          label="AI Recommendation Runs"
          value={historyCount}
          trend={historyCount > 0 ? 'Saved in History' : 'No runs yet'}
          icon={<Sparkles size={20} />}
        />
        <StatCard
          label="Saved Channels"
          value={savedCount}
          trend={savedCount > 0 ? 'Bookmarked' : 'None saved'}
          icon={<Bookmark size={20} />}
        />
      </div>

      {/* Lower splits: Recent Campaigns & Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '24px'
        }}
        className="dashboard-split"
      >
        {/* Recent Campaigns Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', margin: 0 }}>Recent Campaigns</h3>
            {campaigns.length > 0 && (
              <button
                onClick={() => navigate('/company/campaigns/history')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--primary-purple)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View History</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Loading your campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                margin: 'auto 0'
              }}
            >
              <FolderKanban size={28} style={{ color: 'var(--primary-purple)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                No Campaigns Created Yet
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '340px', lineHeight: 1.4 }}>
                You haven't launched any campaigns yet. Create your first campaign to get personalized YouTube creator recommendations.
              </p>
              <button
                onClick={() => navigate('/company/campaigns/create')}
                className="button-gradient"
                style={{
                  marginTop: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Campaign Name</th>
                    <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Category</th>
                    <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Budget</th>
                    <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Goal</th>
                    <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                      onClick={() => navigate(`/company/recommendations?campaign=${c.id}`)}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                      <td style={{ padding: '14px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>
                        {c.category}
                      </td>
                      <td style={{ padding: '14px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{c.budgetStr}</td>
                      <td style={{ padding: '14px 0', color: 'var(--accent-blue)', fontWeight: 600, textTransform: 'capitalize' }}>
                        {c.campaign_goal || c.campaignGoal || 'awareness'}
                      </td>
                      <td style={{ padding: '14px 0' }}>
                        <span
                          style={{
                            backgroundColor:
                              c.status === 'Active'
                                ? 'rgba(16, 185, 129, 0.08)'
                                : c.status === 'Completed'
                                ? 'rgba(59, 130, 246, 0.08)'
                                : 'rgba(245, 158, 11, 0.08)',
                            color:
                              c.status === 'Active'
                                ? 'var(--accent-green)'
                                : c.status === 'Completed'
                                ? 'var(--accent-blue)'
                                : 'var(--accent-yellow)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Match Score Distribution Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
            Match Score Distribution
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Compatibility breakdown of your recommended creators
          </span>

          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="creators" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                margin: 'auto 0',
                lineHeight: 1.5
              }}
            >
              No match distribution available yet. Run your first campaign match to visualize creator score ranges here.
            </div>
          )}
        </div>
      </div>

      {/* Top AI Matches Horizontal Shelf */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Top AI Recommended YouTube Channels
          </h3>
          {topMatches.length > 0 && (
            <button
              onClick={() => navigate('/company/recommendations')}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--primary-purple)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Explore All</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {topMatches.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {topMatches.map((influencer, idx) => (
              <InfluencerCard key={influencer.channel_id || influencer.id || idx} influencer={influencer} />
            ))}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '36px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Sparkles size={28} style={{ color: 'var(--primary-purple)' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              No AI Channel Recommendations Yet
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '480px', lineHeight: 1.5 }}>
              Once you create a campaign or run a match, your highest-scoring YouTube creator recommendations will be displayed here.
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Hubs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {[
            {
              title: 'Create Campaign',
              desc: 'Set up brief & run AI match',
              path: '/company/campaigns/create',
              color: 'var(--primary-light)',
              textCol: 'var(--primary-purple)',
              icon: <PlusCircle size={22} />
            },
            {
              title: 'AI Recommendations',
              desc: 'Browse matched YouTube channels',
              path: '/company/recommendations',
              color: 'rgba(59, 130, 246, 0.06)',
              textCol: 'var(--accent-blue)',
              icon: <Sparkles size={22} />
            },
            {
              title: 'Saved Bookmarks',
              desc: 'View saved channel list',
              path: '/company/saved',
              color: 'rgba(16, 185, 129, 0.06)',
              textCol: 'var(--accent-green)',
              icon: <Bookmark size={22} />
            },
            {
              title: 'Recommendation History',
              desc: 'View all past AI runs & logs',
              path: '/company/campaigns/history',
              color: 'rgba(245, 158, 11, 0.06)',
              textCol: 'var(--accent-yellow)',
              icon: <FileSpreadsheet size={22} />
            }
          ].map((action, idx) => (
            <div
              key={idx}
              onClick={() => navigate(action.path)}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              className="card-hover-lift"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: action.color,
                  color: action.textCol,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {action.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{action.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: 0 }}>{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: var(--border-light);
        }
        @media (max-width: 960px) {
          .dashboard-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
