import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import { campaignService } from '../../services/campaignService';
import { recommendationService } from '../../services/recommendationService';
import { BarChart3, TrendingUp, Users, Target, Sparkles, PlusCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#64748B'];

const CompanyAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allRecs, setAllRecs] = useState([]);
  const [campaignsCount, setCampaignsCount] = useState(0);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [camps, history] = await Promise.all([
          campaignService.getCampaigns(),
          recommendationService.getAllRecommendationHistory()
        ]);
        setCampaignsCount(camps.length);

        const collected = [];
        history.forEach((h) => {
          if (Array.isArray(h.recommendations)) {
            collected.push(...h.recommendations);
          }
        });
        if (collected.length === 0) {
          camps.forEach((c) => {
            if (Array.isArray(c.recommendations)) {
              collected.push(...c.recommendations);
            }
          });
        }
        setAllRecs(collected);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const totalMatches = allRecs.length;

  const avgScore =
    totalMatches > 0
      ? (
          allRecs.reduce(
            (acc, r) =>
              acc +
              (r.recommendation_score !== undefined
                ? Number(r.recommendation_score) * 100
                : Number(r.finalScore || 0)),
            0
          ) / totalMatches
        ).toFixed(1)
      : '0';

  const avgEngagement =
    totalMatches > 0
      ? (
          allRecs.reduce((acc, r) => {
            const raw = Number(r.engagement_rate ?? r.engagementRate ?? 0);
            return acc + (raw <= 1 && raw > 0 ? raw * 100 : raw);
          }, 0) / totalMatches
        ).toFixed(2)
      : '0';

  const avgSubscribers =
    totalMatches > 0
      ? Math.round(
          allRecs.reduce((acc, r) => acc + Number(r.subscriber_count ?? r.subscribers ?? 0), 0) /
            totalMatches
        ).toLocaleString('en-IN')
      : '0';

  const scoreData = [
    { range: '60-70%', count: 0 },
    { range: '70-80%', count: 0 },
    { range: '80-90%', count: 0 },
    { range: '90-95%', count: 0 },
    { range: '95-100%', count: 0 }
  ];

  const categoryCounts = {};
  allRecs.forEach((r) => {
    const score =
      r.recommendation_score !== undefined
        ? Math.round(Number(r.recommendation_score) * 100)
        : Number(r.finalScore || 0);
    if (score >= 95) scoreData[4].count += 1;
    else if (score >= 90) scoreData[3].count += 1;
    else if (score >= 80) scoreData[2].count += 1;
    else if (score >= 70) scoreData[1].count += 1;
    else scoreData[0].count += 1;

    const cat = (r.category || 'general').toUpperCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, count], idx) => ({
    name,
    value: Math.round((count / totalMatches) * 100),
    color: COLORS[idx % COLORS.length]
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      <PageHeader
        title="Brand Analytics Dashboard"
        subtitle="Monitor your campaign recommendations, match score distribution, and creator engagement metrics."
        icon={<BarChart3 size={22} />}
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard
          label="Total Matches Generated"
          value={totalMatches}
          trend={totalMatches > 0 ? `${campaignsCount} Campaigns` : 'No matches yet'}
          icon={<BarChart3 size={20} />}
        />
        <StatCard
          label="Average AI Match Score"
          value={`${avgScore}%`}
          trend={totalMatches > 0 ? 'Across all runs' : 'N/A'}
          icon={<Target size={20} />}
        />
        <StatCard
          label="Average Creator Engagement"
          value={`${avgEngagement}%`}
          trend={totalMatches > 0 ? 'Engagement Rate' : 'N/A'}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Average Channel Subscribers"
          value={avgSubscribers}
          trend={totalMatches > 0 ? 'YouTube Reach' : 'N/A'}
          icon={<Users size={20} />}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading analytics...
        </div>
      ) : totalMatches === 0 ? (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <Sparkles size={36} style={{ color: 'var(--primary-purple)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            No Analytics Data Available Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: 0, lineHeight: 1.5 }}>
            You haven't generated any campaign recommendations yet. Create a campaign to view score distributions and category insights based on your real creator matches.
          </p>
          <button
            onClick={() => navigate('/company/campaigns/create')}
            className="button-gradient"
            style={{
              marginTop: '6px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="analytics-grid">
          {/* Chart 1: AI Match Score Distribution */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
              AI Match Score Distribution
            </h3>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary-purple)" radius={[4, 4, 0, 0]} barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Allocation */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px', alignSelf: 'flex-start' }}>
              Recommended Channels by Category
            </h3>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.8rem', marginTop: '10px' }}>
              {categoryData.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }} />
                  <span>
                    {cat.name}: <strong>{cat.value}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyAnalytics;
