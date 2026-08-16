import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import MatchBadge from '../../components/common/MatchBadge';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';
import { Briefcase, Search, Filter } from 'lucide-react';

const Opportunities = () => {
  const navigate = useNavigate();
  const creator = authService.getCurrentUser();
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const list = await campaignService.getCampaigns();
        
        // Calculate match scores dynamically based on creator category
        const mapped = list.map((c) => {
          let score = 75; // base match
          if (creator && c.category.toLowerCase() === creator.category.toLowerCase()) {
            score = 94;
          } else {
            // adjacent
            score = 82;
          }
          return {
            ...c,
            matchScore: score
          };
        });
        
        setCamps(mapped);
        setFilteredCamps(mapped);
      } catch (err) {
        showToast('Error loading opportunities.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [creator]);

  // Apply filter pipeline
  useEffect(() => {
    let result = [...camps];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedLocation !== 'All') {
      result = result.filter((c) => c.state.toLowerCase() === selectedLocation.toLowerCase());
    }

    // Sort by match score descending
    result.sort((a, b) => b.matchScore - a.matchScore);

    setFilteredCamps(result);
  }, [searchTerm, selectedCategory, selectedLocation, camps]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Brand Collaboration Opportunities"
        subtitle="Browse active sponsorship briefs recommended by our AI Match engine."
        icon={<Briefcase size={22} />}
      />

      {/* Filter Row */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search campaigns, brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '130px', backgroundColor: 'white' }}
        >
          <option value="All">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Fashion">Fashion</option>
          <option value="Gaming">Gaming</option>
          <option value="Finance">Finance</option>
          <option value="Fitness">Fitness</option>
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '140px', backgroundColor: 'white' }}
        >
          <option value="All">All Locations</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi NCR</option>
          <option value="Gujarat">Gujarat</option>
        </select>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <span>Loading collaboration opportunities...</span>
        </div>
      ) : filteredCamps.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
              className="card-hover-lift"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Brand: {camp.companyName}</span>
                <MatchBadge score={camp.matchScore} size="sm" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camp.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>{camp.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginTop: 'auto' }}>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem' }}>BUDGET OFFER</span>
                  <span style={{ fontWeight: 700 }}>{camp.budgetStr}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem' }}>LOCATION TARGET</span>
                  <span style={{ fontWeight: 700 }}>{camp.state}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/influencer/opportunities/${camp.id}`)}
                className="button-gradient"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                Inspect Opportunity Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '32px' }}>🔍</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>No campaign opportunities match</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Adjust your category filter tabs or search queries to check other active briefs.</p>
        </div>
      )}

    </div>
  );
};

export default Opportunities;
