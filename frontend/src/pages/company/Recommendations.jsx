import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { recommendationService } from '../../services/recommendationService';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { Sparkles, Search, Filter, ArrowUpDown, X, Check, Mail } from 'lucide-react';
import { INDIAN_STATES } from '../../data/mockData';

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // States
  const [campaign, setCampaign] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  // Filter values
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const [minSubs, setMinSubs] = useState('Any');
  const [sortBy, setSortBy] = useState('Highest Match');



  // Load all campaigns and recommendations
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const campList = await campaignService.getCampaigns();
        setCampaigns(campList);

        // Check if campaign is passed in URL
        const campId = searchParams.get('campaign');
        let activeCamp = null;
        if (campId) {
          activeCamp = campList.find((c) => c.id === campId);
        }
        
        // Fallback to top campaign if none selected
        if (!activeCamp && campList.length > 0) {
          activeCamp = campList[0];
        }
        
        setCampaign(activeCamp);

        // Query AI recommendations based on this campaign
        if (activeCamp) {
          const recommendations = await recommendationService.getRecommendations(activeCamp);
          setInfluencers(recommendations);
          setFilteredInfluencers(recommendations);
        } else {
          // No campaigns, load raw creators list
          const raw = await influencerService.getInfluencers();
          const mapped = raw.map(i => ({
            ...i,
            finalScore: i.graphScore,
            semanticMatch: 85,
            audienceMatch: 88,
            budgetFit: 90,
            engagementScore: 86
          }));
          setInfluencers(mapped);
          setFilteredInfluencers(mapped);
        }
      } catch (err) {
        showToast('Error loading recommendations.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Apply filters
  useEffect(() => {
    let result = [...influencers];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.handle.toLowerCase().includes(q) ||
          i.bio.toLowerCase().includes(q)
      );
    }

    // Niche filter
    if (selectedNiche !== 'All Niches') {
      result = result.filter((i) => i.category.toLowerCase() === selectedNiche.toLowerCase());
    }

    // Location filter
    if (selectedLocation !== 'All Locations') {
      result = result.filter((i) => i.state.toLowerCase() === selectedLocation.toLowerCase());
    }


    // Subscribers filter
    if (minSubs !== 'Any') {
      const min = Number(minSubs);
      result = result.filter((i) => i.subscribers >= min);
    }

    // Sorting
    if (sortBy === 'Highest Match') {
      result.sort((a, b) => b.finalScore - a.finalScore);
    } else if (sortBy === 'Highest Engagement') {
      result.sort((a, b) => b.engagementRate - a.engagementRate);
    } else if (sortBy === 'Lowest Cost') {
      result.sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else if (sortBy === 'Most Views') {
      result.sort((a, b) => b.avgViews - a.avgViews);
    }

    setFilteredInfluencers(result);
  }, [searchTerm, selectedNiche, selectedLocation, minSubs, sortBy, influencers]);

  const handleCampaignChange = async (e) => {
    const campId = e.target.value;
    const selected = campaigns.find((c) => c.id === campId);
    if (selected) {
      setCampaign(selected);
      navigate(`/company/recommendations?campaign=${campId}`);
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Upper info panel */}
      {campaign && (
        <div
          style={{
            background: 'var(--gradient-brand-light)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'var(--gradient-ai)',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                ✨ AI Match Engine Active
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Category Target: {campaign.category}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
              Matches for "{campaign.name}"
            </h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span>Budget: {campaign.budgetStr}</span>
              <span>Location Target: {campaign.state}</span>
              <span>Audience Target: {campaign.audienceGender}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Campaign:</span>
            <select
              value={campaign?.id || ''}
              onChange={handleCampaignChange}
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
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filter and sorting controls */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }} className="filters-search-row">
          {/* Search */}
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              placeholder="Search YouTubers, handles, descriptions..."
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

          {/* Niches dropdown */}
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '130px', backgroundColor: 'white' }}
          >
            <option value="All Niches">All Niches</option>
            <option value="Technology">Technology</option>
            <option value="Fashion">Fashion</option>
            <option value="Gaming">Gaming</option>
            <option value="Finance">Finance</option>
            <option value="Fitness">Fitness</option>
            <option value="Education">Education</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
          </select>

          {/* States dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '140px', backgroundColor: 'white' }}
          >
            <option value="All Locations">All Locations</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>


          {/* Min subscribers */}
          <select
            value={minSubs}
            onChange={(e) => setMinSubs(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '140px', backgroundColor: 'white' }}
          >
            <option value="Any">Min Subscribers (Any)</option>
            <option value="100000">100K+</option>
            <option value="500000">500K+</option>
            <option value="1000000">1M+</option>
            <option value="2000000">2M+</option>
          </select>

          {/* Sort selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }} className="sort-box">
            <ArrowUpDown size={16} style={{ color: 'var(--text-light)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'white' }}
            >
              <option value="Highest Match">Highest Match</option>
              <option value="Highest Engagement">Highest Engagement</option>
              <option value="Lowest Cost">Lowest Cost</option>
              <option value="Most Views">Most Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matching creators list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '4px solid var(--primary-light)',
              borderTopColor: 'var(--primary-purple)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AI Matching Engine analyzing creators...</span>
        </div>
      ) : filteredInfluencers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Showing {filteredInfluencers.length} AI recommended Indian creators
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredInfluencers.map((creator) => (
              <InfluencerCard key={creator.id} influencer={creator} />
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '32px' }}>🔍</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No matching influencers found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '380px' }}>
            Adjust your search keywords, platform categories, or subscriber filter criteria to check more creator accounts.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedNiche('All Niches');
              setSelectedLocation('All Locations');
              setSelectedPlatform('All Platforms');
              setMinSubs('Any');
            }}
            className="button-gradient"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: '8px',
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .filters-search-row {
            flex-direction: column !important;
          }
          .sort-box {
            border-left: none !important;
            padding-left: 0 !important;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
