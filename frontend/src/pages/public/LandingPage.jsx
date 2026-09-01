import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, BarChart3, Share2, Compass, Cpu, HelpCircle } from 'lucide-react';
import MatchBadge from '../../components/common/MatchBadge';
import { authService } from '../../services/authService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Technology');

  const demoData = {
    Technology: [
      { name: 'Rohan Mehta', handle: '@techwithrohan', loc: 'Bengaluru, Karnataka', subs: '1.85M', views: '420K', eng: '4.8%', match: 95, aud: 93, cost: '₹1,84,800', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' },
      { name: 'Aravind Swamy', handle: '@aravind_tech_tamil', loc: 'Chennai, Tamil Nadu', subs: '1.25M', views: '320K', eng: '5.0%', match: 91, aud: 88, cost: '₹1,35,000', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120' }
    ],
    Fashion: [
      { name: 'Suhana Kapoor', handle: '@suhana_vogue_yt', loc: 'Delhi, Delhi', subs: '1.6M', views: '410K', eng: '6.1%', match: 92, aud: 90, cost: '₹1,80,400', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
      { name: 'Priya Menon', handle: '@priyabeauty_insta', loc: 'Kochi, Kerala', subs: '750K', views: '210K', eng: '6.9%', match: 89, aud: 86, cost: '₹88,000', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' }
    ],
    Gaming: [
      { name: 'Kabir Dev', handle: '@kabirplay', loc: 'Mumbai, Maharashtra', subs: '2.4M', views: '650K', eng: '7.4%', match: 96, aud: 94, cost: '₹2,20,000', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
      { name: 'Kshitij Verma', handle: '@kshitijplays_gaming', loc: 'Pune, Maharashtra', subs: '1.32M', views: '390K', eng: '7.1%', match: 90, aud: 89, cost: '₹1,40,000', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=120' }
    ],
    Finance: [
      { name: 'Rajesh Gowda', handle: '@rajesh_finance', loc: 'Bengaluru, Karnataka', subs: '1.1M', views: '280K', eng: '4.1%', match: 93, aud: 91, cost: '₹1,45,000', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120' },
      { name: 'Devashish Sharma', handle: '@dev_finance_stocks', loc: 'Mumbai, Maharashtra', subs: '1.52M', views: '390K', eng: '4.3%', match: 88, aud: 85, cost: '₹1,95,000', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120' }
    ],
    Education: [
      { name: 'Shreya Sen', handle: '@shreyacodes', loc: 'Kolkata, West Bengal', subs: '420K', views: '110K', eng: '8.9%', match: 94, aud: 92, cost: '₹65,000', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120' }
    ]
  };

  const trustStats = [
    { value: '10,000+', label: 'Verified Creators' },
    { value: '98.4%', label: 'Match Accuracy' },
    { value: '3.8x', label: 'Average Campaign ROI' },
    { value: '28', label: 'States & UTs Covered' }
  ];

  const features = [
    {
      title: 'Real Viewership Analytics',
      desc: 'Move past static follower numbers. Analyze actual average view counts, retention curves, and historical engagement quality.',
      icon: <BarChart3 size={24} />
    },
    {
      title: 'Semantic Campaign Matching',
      desc: 'SBERT (Sentence-BERT) reads your campaign briefs and creators bios semantically to calculate content suitability contextual scores.',
      icon: <Cpu size={24} />
    },
    {
      title: 'Graph-Based Influence Analysis',
      desc: 'PageRank and Betweenness Centrality mapping reveals how connected a creator is to other nodes, identifying true hubs.',
      icon: <Share2 size={24} />
    },
    {
      title: 'Explainable AI Recommendations',
      desc: 'Gain clarity behind every match. Breakdown scores across Semantic Relevance, Audience, Budget fit, and Network Centrality.',
      icon: <Compass size={24} />
    }
  ];

  const steps = [
    { title: 'Create Campaign', desc: 'Detail your budget, targets, location, and brief.' },
    { title: 'Target Audience', desc: 'Define language, gender, and age segments.' },
    { title: 'Location Filter', desc: 'Refine creators matching your state or city.' },
    { title: 'Semantic Scoring', desc: 'NLP measures contextual similarity via Sentence-BERT.' },
    { title: 'Graph intelligence', desc: 'PageRank ranks network centrality parameters.' },
    { title: 'View matches', desc: 'Explore recommendations sorted by overall suitability.' }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Landing Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 8%',
          backgroundColor: 'white',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Influence<span style={{ color: 'var(--primary-purple)' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {authService.isAuthenticated() ? (
            <button
              onClick={() => {
                const role = authService.getCurrentRole();
                navigate(role === 'Company' ? '/company/dashboard' : '/influencer/dashboard');
              }}
              className="button-gradient"
              style={{
                borderRadius: '24px',
                padding: '8px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/select-role')}
                className="button-gradient"
                style={{
                  borderRadius: '24px',
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 8% 60px 8%',
          textAlign: 'center',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(124, 58, 237, 0.06)',
            color: 'var(--primary-purple)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <Sparkles size={14} />
          Next-Generation Creator Analytics
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Find the Perfect{' '}
          <span className="gradient-text" style={{ fontWeight: 800 }}>
            Influencers
          </span>{' '}
          for Your Brand with{' '}
          <span className="gradient-text-ai" style={{ fontWeight: 800 }}>
            AI
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '680px',
          }}
        >
          InfluenceAI uses semantic matching, audience analytics, performance metrics and graph intelligence to connect
          brands with creators who actually fit their campaigns.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button
            onClick={() => navigate('/select-role')}
            className="button-gradient"
            style={{
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Find Influencers</span>
            <ArrowRight size={18} />
          </button>
          <a
            href="#sandbox"
            style={{
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            See How It Works
          </a>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px',
            width: '100%',
            marginTop: '50px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '40px',
          }}
        >
          {trustStats.map((s, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live AI Recommendation sandbox */}
      <section
        id="sandbox"
        style={{
          padding: '60px 8%',
          backgroundColor: 'white',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
            Live AI Recommendation Demo
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Select a vertical below to run our matching model dynamically and check creator suitability metrics.
          </p>
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {Object.keys(demoData).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '10px 22px',
                borderRadius: '24px',
                border: activeTab === cat ? 'none' : '1px solid var(--border-color)',
                backgroundColor: activeTab === cat ? 'var(--primary-purple)' : 'transparent',
                color: activeTab === cat ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Influencer Demo Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          {demoData[activeTab].map((creator, index) => (
            <div
              key={index}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '24px',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  YouTube Partner
                </span>
                <MatchBadge score={creator.match} size="sm" />
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img
                  src={creator.img}
                  alt={creator.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{creator.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{creator.handle}</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>{creator.loc}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px 16px',
                  borderTop: '1px dashed var(--border-color)',
                  borderBottom: '1px dashed var(--border-color)',
                  padding: '12px 0',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>SUBSCRIBERS</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{creator.subs}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>AVG VIEWS</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{creator.views}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>AUDIENCE FIT</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{creator.aud}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', marginBottom: '2px' }}>COLLAB COST</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{creator.cost}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Send Collaboration Request
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section style={{ padding: '80px 8%' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
            Engineered for Precision Matching
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            We deploy advanced machine learning and topological network metrics to evaluate creators.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-lg)',
                padding: '30px 24px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
              className="card-hover-lift"
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Explainable AI showcase */}
      <section style={{ padding: '60px 8%', backgroundColor: 'white', borderTop: '1px solid var(--border-color)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            maxWidth: '960px',
            margin: '0 auto',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                color: 'var(--accent-blue)',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Explainable AI (XAI)
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>
              Why was Rohan Mehta recommended?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
              We don't believe in black-box algorithms. InfluenceAI outlines exactly why a creator has been ranked for
              your brand, helping campaigns calibrate features weights.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle size={16} color="var(--accent-green)" />
                <span>Strong Sentence-BERT semantic overlap (96%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle size={16} color="var(--accent-green)" />
                <span>PageRank centrality node ranks in the top 5% (92%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle size={16} color="var(--accent-green)" />
                <span>Rate card fits campaign budget thresholds (90%)</span>
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '24px',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                AI MATCH SUITABILITY
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-purple)' }}>94%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Semantic Matching', val: 96, col: '#A855F7' },
                { label: 'Audience Overlap', val: 93, col: '#3B82F6' },
                { label: 'Budget Fit', val: 90, col: '#10B981' },
                { label: 'Engagement Quality', val: 95, col: '#F59E0B' },
                { label: 'Graph centrality influence', val: 92, col: '#06B6D4' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.val}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.val}%`, backgroundColor: item.col }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section style={{ padding: '80px 8%', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
            The Matchmaking Pipeline
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            From brand campaign description input to Ranked Influencer Recommendation listing.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {steps.map((s, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '24px',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--gradient-brand)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {idx + 1}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section
        style={{
          padding: '80px 8%',
          background: 'var(--gradient-brand-light)',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <h2
          style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            marginBottom: '14px',
          }}
        >
          Ready to Find Your Next Creator?
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 30px auto' }}>
          Connect with brands or get detailed insights into creator network collaboration channels today.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              localStorage.setItem('influenceai_register_role', 'Company');
              navigate('/register');
            }}
            className="button-gradient"
            style={{
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            I'm a Brand / Company
          </button>
          <button
            onClick={() => {
              localStorage.setItem('influenceai_register_role', 'Influencer');
              navigate('/register');
            }}
            style={{
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '0.95rem',
              fontWeight: 600,
              backgroundColor: 'white',
              color: 'var(--primary-purple)',
              border: '1px solid var(--primary-purple)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            I'm an Influencer / Creator
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 8%',
          backgroundColor: 'white',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>© 2026 InfluenceAI. Designed for College Project Demonstration.</div>
        <div style={{ marginTop: '8px', color: 'var(--text-light)' }}>
          Powered by Sentence-BERT, PageRank Centrality & FastAPI
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
