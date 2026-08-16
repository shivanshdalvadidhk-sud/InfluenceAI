import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ScoreBreakdown from '../../components/common/ScoreBreakdown';
import MatchBadge from '../../components/common/MatchBadge';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import {
  User,
  MapPin,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Mail,
  Network,
  TrendingUp,
  Award,
  Video,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
        setIsSaved(influencerService.isInfluencerSaved(data.id));
      } else {
        showToast('Creator profile not found.', 'error');
        navigate('/company/recommendations');
      }
      setLoading(false);
    };
    loadCreator();
  }, [id, navigate]);

  const handleToggleSave = async () => {
    const nowSaved = await influencerService.toggleSaveInfluencer(influencer.id);
    setIsSaved(nowSaved);
    showToast(nowSaved ? 'Creator bookmarked.' : 'Bookmark removed.', 'info');
  };

  const handleSendOffer = () => {
    window.dispatchEvent(new CustomEvent('influenceai_open_inquiry_modal', { detail: influencer }));
  };

  if (loading || !influencer) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
        <span>Loading profile statistics...</span>
      </div>
    );
  }

  // Prep audience gender chart data
  const genderData = [
    { name: 'Male', value: influencer.audienceGender.male, color: '#3B82F6' },
    { name: 'Female', value: influencer.audienceGender.female, color: '#EC4899' }
  ];

  // Prep audience age chart data
  const ageData = Object.keys(influencer.audienceAge).map((key) => ({
    bracket: key,
    percent: influencer.audienceAge[key]
  }));

  const tabs = ['Overview', 'AI Analysis'];

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
          padding: '30px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <img
            src={influencer.avatar}
            alt=""
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{influencer.name}</h2>
              <CheckCircle2 size={18} fill="var(--accent-blue)" color="white" />
              <MatchBadge score={influencer.graphScore} size="sm" />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{influencer.handle}</div>
            
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} style={{ color: 'var(--text-light)' }} />
                {influencer.city ? `${influencer.city}, ` : ''}{influencer.state}
              </span>
              <span>Platform: <strong style={{ color: 'var(--text-primary)' }}>{influencer.platform}</strong></span>
              <span>Niche: <strong style={{ color: 'var(--text-primary)' }}>{influencer.category}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '10px' }}>
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
              color: isSaved ? 'var(--primary-purple)' : 'var(--text-secondary)',
            }}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          
          <button
            onClick={() => navigate(`/company/influencers/${influencer.id}/graph`)}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: '1px solid var(--primary-purple)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-purple)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Network size={16} />
            <span>Network Influence Graph</span>
          </button>

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
            }}
          >
            <Mail size={16} />
            <span>Inquiry Sponsorship</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Followers / Subscribers', val: influencer.subscribersStr, desc: 'Total community size', icon: <User size={18} /> },
          { label: 'Average Video Views', val: influencer.avgViewsStr, desc: 'Average reach per post', icon: <Video size={18} /> },
          { label: 'Engagement Rate', val: `${influencer.engagementRate}%`, desc: 'Comment/like engagement', icon: <TrendingUp size={18} /> },
          { label: 'Graph Influence Index', val: `${influencer.graphScore}/100`, desc: 'Based on PageRank centrality', icon: <Award size={18} /> }
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
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '4px 0', fontFamily: 'var(--font-heading)' }}>{m.val}</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{m.desc}</span>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
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
              boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="detail-split">
            {/* Bio Card */}
            <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Biography Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{influencer.bio}</p>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>NICHE LABELS</span>
                <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-purple)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 600 }}>{influencer.category}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SUPPORTED LANGUAGES</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{influencer.language}</span>
              </div>

              {influencer.collaborators && influencer.collaborators.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>COLLABORATORS IN GRAPH</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {influencer.collaborators.map((c, idx) => (
                      <span key={idx} style={{ backgroundColor: '#F1F5F9', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Why Recommend */}
            <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-purple)' }}>Why We Recommend This Creator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Semantic Relevance Match</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>Sentence-BERT indicates high thematic similarity with your campaign keywords.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Graph Node Centrality</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>PageRank score positions this creator as a powerful hub for organic distribution.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Budget Suitability</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>Estimated rates are within limits, ensuring high cost-to-reach efficiency.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'AI Analysis' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <ScoreBreakdown
              semantic={influencer.semanticMatch || 96}
              audience={influencer.audienceMatch || 93}
              budget={influencer.budgetFit || 90}
              engagement={influencer.engagementScore || 95}
              graph={influencer.graphScore}
              final={influencer.finalScore || influencer.graphScore}
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
