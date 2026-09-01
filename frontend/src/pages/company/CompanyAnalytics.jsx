import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import { BarChart3, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CompanyAnalytics = () => {
  const [range, setRange] = useState('30 Days');

  // Mock data
  const scoreData = [
    { range: '60-70%', count: 12 },
    { range: '70-80%', count: 32 },
    { range: '80-90%', count: 58 },
    { range: '90-95%', count: 18 },
    { range: '95-100%', count: 8 }
  ];

  const categoryData = [
    { name: 'Technology', value: 38, color: '#A855F7' },
    { name: 'Fashion', value: 24, color: '#EC4899' },
    { name: 'Gaming', value: 18, color: '#3B82F6' },
    { name: 'Fitness', value: 12, color: '#10B981' },
    { name: 'Others', value: 8, color: '#64748B' }
  ];

  const costData = [
    { name: 'Tech', avg: 148000 },
    { name: 'Fashion', avg: 135000 },
    { name: 'Gaming', avg: 160000 },
    { name: 'Finance', avg: 170000 },
    { name: 'Fitness', avg: 102000 },
    { name: 'Education', avg: 65000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Header */}
      <PageHeader
        title="Brand Analytics Dashboard"
        subtitle="Calibrate matching metrics, review cost distributions, and monitor performance curves."
        icon={<BarChart3 size={22} />}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--text-light)' }} />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                backgroundColor: 'white',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="7 Days">Last 7 Days</option>
              <option value="30 Days">Last 30 Days</option>
              <option value="90 Days">Last 90 Days</option>
            </select>
          </div>
        }
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Matches Collected" value="128" trend="+14.2%" icon={<BarChart3 size={20} />} />
        <StatCard label="Average AI Suitability" value="91.4%" trend="+1.5%" icon={<Target size={20} />} />
        <StatCard label="Average Creator Engagement" value="5.6%" trend="+0.8%" icon={<TrendingUp size={20} />} />
        <StatCard label="Average Estimated Cost" value="₹1,24,000" trend="-4.2%" icon={<DollarSign size={20} />} />
      </div>

      {/* Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="analytics-grid">
        
        {/* Chart 1: AI Match Score Distribution */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>AI Match Score Distribution</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary-purple)" radius={[4, 4, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Collaboration Cost by Category */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Average Collab Rate by Niche (₹)</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} formatter={(v) => `₹${v/1000}K`} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="avg" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Allocation */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', marginBottom: '20px', alignSelf: 'flex-start' }}>Creators Distribution by Category</h3>
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
                <span>{cat.name}: <strong>{cat.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Explanation text */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '30px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-purple)' }}>✨ AI System Analytics Summary</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Our recommendation logs indicate that the **Technology** and **Fashion** creator niches generate the highest overall semantic compatibility levels for D2C brands.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Graph analysis shows creator nodes in **Bengaluru** and **Mumbai** hubs act as the strongest network bridges, scoring high on Betweenness Centrality.
          </p>
        </div>

      </div>

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
