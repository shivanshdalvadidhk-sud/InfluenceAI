import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import {
  Sparkles,
  PlusCircle,
  Bookmark,
  Layers,
  ArrowRight,
  TrendingUp,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [topMatches, setTopMatches] = useState([]);

  // Mock chart data representing match scores count
  const chartData = [
    { range: '60-70%', creators: 2 },
    { range: '70-80%', creators: 5 },
    { range: '80-90%', creators: 8 },
    { range: '90-95%', creators: 4 },
    { range: '95-100%', creators: 1 }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      const camps = await campaignService.getCampaigns();
      setCampaigns(camps.slice(0, 3)); // show top 3

      const saved = await influencerService.getSavedInfluencers();
      setSavedCount(saved.length);

      const creators = await influencerService.getInfluencers();
      // sort by subscribers/views to simulate top matches
      const sorted = [...creators].sort((a, b) => b.subscribers - a.subscribers);
      setTopMatches(sorted.slice(0, 3));
    };

    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      {/* Header */}
      <PageHeader
        title="Good morning, Aura Lifestyle"
        subtitle="Discover creators who match your campaigns using AI-powered recommendations."
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
          gap: '20px',
        }}
      >
        <StatCard label="Active Campaigns" value="4" trend="+25.0%" icon={<Layers size={20} />} />
        <StatCard label="Recommended Influencers" value="128" trend="+12.4%" icon={<Sparkles size={20} />} />
        <StatCard label="Saved Influencers" value={savedCount} trend="+8.2%" icon={<Bookmark size={20} />} />
        <StatCard label="Average AI Match" value="91.4%" trend="+1.2%" icon={<TrendingUp size={20} />} />
      </div>

      {/* Lower splits: Recent Campaigns & Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '24px',
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
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>Recent Campaigns</h3>
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
                gap: '4px',
              }}
            >
              <span>View History</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Campaign Name</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Category</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Budget</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 600 }}>State</th>
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
                    <td style={{ padding: '14px 0', color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td style={{ padding: '14px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{c.budgetStr}</td>
                    <td style={{ padding: '14px 0', color: 'var(--text-secondary)' }}>{c.state}</td>
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
                          fontWeight: 700,
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
        </div>

        {/* AI distribution Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
            Recommendation Engine
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            AI Suitability Score index matching distribution
          </span>

          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="creators" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top AI Matches Horizontal Shelf */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Top AI Matches</h3>
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
              gap: '4px',
            }}
          >
            <span>Explore All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {topMatches.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      </div>

      {/* Quick Action Hubs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {[
            { title: 'Create Campaign', desc: 'Define goals & run AI filters', path: '/company/campaigns/create', color: 'var(--primary-light)', textCol: 'var(--primary-purple)', icon: <PlusCircle size={22} /> },
            { title: 'Find Influencers', desc: 'Browse matched database', path: '/company/recommendations', color: 'rgba(59, 130, 246, 0.06)', textCol: 'var(--accent-blue)', icon: <Sparkles size={22} /> },
            { title: 'Saved Bookmarks', desc: 'View saved creator list', path: '/company/saved', color: 'rgba(16, 185, 129, 0.06)', textCol: 'var(--accent-green)', icon: <Bookmark size={22} /> },
            { title: 'Campaign Logs', desc: 'Duplicate or expand details', path: '/company/campaigns/history', color: 'rgba(245, 158, 11, 0.06)', textCol: 'var(--accent-yellow)', icon: <FileSpreadsheet size={22} /> }
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
                transition: 'all 0.2s',
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
                  justifyContent: 'center',
                }}
              >
                {action.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{action.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{action.desc}</p>
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
