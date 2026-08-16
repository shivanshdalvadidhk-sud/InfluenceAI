import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import { BarChart3, Eye, Compass, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const InfluencerAnalytics = () => {
  // Mock data
  const weeklyViews = [
    { name: 'Week 1', views: 980 },
    { name: 'Week 2', views: 1240 },
    { name: 'Week 3', views: 1450 },
    { name: 'Week 4', views: 1100 },
    { name: 'Week 5', views: 1680 },
    { name: 'Week 6', views: 1840 }
  ];

  const discoveryNiches = [
    { name: 'Technology', matches: 28 },
    { name: 'Gaming', matches: 15 },
    { name: 'Fashion', matches: 8 },
    { name: 'Education', matches: 12 },
    { name: 'Lifestyle', matches: 6 }
  ];

  const engagementRatio = [
    { post: 'Video 1', rate: 4.8 },
    { post: 'Video 2', rate: 5.2 },
    { post: 'Video 3', rate: 4.5 },
    { post: 'Video 4', rate: 6.1 },
    { post: 'Video 5', rate: 5.0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Creator Analytics"
        subtitle="Track profile traffic, search visibility in brands queries, and engagement ratios."
        icon={<BarChart3 size={22} />}
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Profile Views" value="1,248" trend="+22.4%" icon={<Eye size={20} />} />
        <StatCard label="Search Discoveries" value="38" trend="+14.2%" icon={<Compass size={20} />} />
        <StatCard label="Average AI Compatibility" value="92.5%" trend="+0.5%" icon={<TrendingUp size={20} />} />
        <StatCard label="Brand Opportunities" value="8" trend="+33.3%" icon={<BarChart3 size={20} />} />
      </div>

      {/* Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="creator-analytics-grid">
        
        {/* Chart 1: Profile Views Area Chart */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Weekly Brand Profile Views</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyViews}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-purple)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary-purple)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="var(--primary-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Discoveries by Brand Campaign Niches */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Discoveries by Brand Search Categories</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discoveryNiches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="matches" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Post Engagement Rates */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Recent Post Engagement Rate (%)</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="post" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} formatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="var(--accent-green)" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explanation Card */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '30px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-purple)' }}>✨ Network Spread Report</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your **PageRank score** has increased by **2.4%** due to high reciprocal collaborator tags with other high-authority creators in West and South India regions.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your channel has been ranked as a **Bridge Node** in Technology-Gaming segments, triggering 14 matches in the last 7 days.
          </p>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .creator-analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InfluencerAnalytics;
