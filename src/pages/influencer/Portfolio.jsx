import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { authService } from '../../services/authService';
import { Layers, Video, Award, Heart, MessageSquare } from 'lucide-react';

const Portfolio = () => {
  const creator = authService.getCurrentUser();

  const featuredContent = [
    {
      id: 'p1',
      title: 'Is this the Ultimate Indian AI Assistant?',
      views: '520K views',
      likes: '48K likes',
      comments: '3.2K comments',
      eng: '8.4%',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'
    },
    {
      id: 'p2',
      title: 'Building a ₹1,50,000 Coding Rig from scratch',
      views: '380K views',
      likes: '31K likes',
      comments: '2.8K comments',
      eng: '6.8%',
      thumbnail: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400'
    },
    {
      id: 'p3',
      title: 'Top 5 Midcap Mutual Funds for High Returns in 2026',
      views: '480K views',
      likes: '35K likes',
      comments: '2.5K comments',
      eng: '7.9%',
      thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'
    }
  ];

  const brandLogs = [
    { name: 'Aura Lifestyle', logo: '👗', industry: 'Fashion & Apparel' },
    { name: 'WealthSphere', logo: '📈', industry: 'Finance Solutions' },
    { name: 'TechCraft Devices', logo: '💻', industry: 'Computer Hardware' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Creator Portfolio"
        subtitle="Aesthetic showreel displaying featured videos, performance indices, and past collaborations."
        icon={<Layers size={22} />}
      />

      {/* Grid: Featured content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={18} />
          <span>Featured Videos & Performance</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {featuredContent.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
              className="card-hover-lift"
            >
              <img src={item.thumbnail} alt="" style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.title}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={12} style={{ color: 'var(--accent-red)' }} />
                    {item.likes}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageSquare size={12} style={{ color: 'var(--accent-blue)' }} />
                    {item.comments}
                  </span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary-purple)' }}>
                    Engagement: {item.eng}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid lower: Niches & Brand Partnerships logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '24px' }} className="portfolio-split">
        
        {/* Niches tags */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Verified Niche Domains</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Technology', 'PC Hardware', 'Mutual Funds', 'Stock Market', 'Coding Tutorial'].map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-purple)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>Primary Platform: <strong style={{ color: 'var(--text-primary)' }}>{creator?.primaryPlatform || 'YouTube'}</strong></div>
            <div>Headquarters: <strong style={{ color: 'var(--text-primary)' }}>{creator?.city || 'Bengaluru'}, {creator?.state || 'Karnataka'}</strong></div>
          </div>
        </div>

        {/* Past Collaborations logs */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} style={{ color: 'var(--accent-yellow)' }} />
            <span>Past Brand Collaborations</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {brandLogs.map((brand, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {brand.logo}
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{brand.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{brand.industry}</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .portfolio-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
