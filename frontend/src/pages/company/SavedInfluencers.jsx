import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { Bookmark, Search } from 'lucide-react';

const SavedInfluencers = () => {
  const navigate = useNavigate();
  const [savedCreators, setSavedCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Niches');
  const [locationFilter, setLocationFilter] = useState('All Locations');

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await influencerService.getSavedInfluencers();
      setSavedCreators(data);
      setFilteredCreators(data);
    } catch (err) {
      showToast('Error loading bookmarks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...savedCreators];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.handle.toLowerCase().includes(q) ||
          i.bio.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All Niches') {
      result = result.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (locationFilter !== 'All Locations') {
      result = result.filter((i) => i.state.toLowerCase() === locationFilter.toLowerCase());
    }

    setFilteredCreators(result);
  }, [searchTerm, categoryFilter, locationFilter, savedCreators]);

  const handleRemove = (id) => {
    // Refresh creator arrays
    setSavedCreators(savedCreators.filter((c) => c.id !== id));
    showToast('Bookmark removed.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Saved Influencers"
        subtitle="Keep track of creators you bookmarked for current or future campaigns."
        icon={<Bookmark size={22} />}
      />

      {/* Filter Row */}
      {savedCreators.length > 0 && (
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
              placeholder="Search saved creators..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '130px', backgroundColor: 'white' }}
          >
            <option value="All Niches">All Niches</option>
            <option value="Technology">Technology</option>
            <option value="Fashion">Fashion</option>
            <option value="Gaming">Gaming</option>
            <option value="Finance">Finance</option>
            <option value="Fitness">Fitness</option>
            <option value="Education">Education</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '140px', backgroundColor: 'white' }}
          >
            <option value="All Locations">All Locations</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
          </select>
        </div>
      )}

      {/* Bookmarks Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <span>Loading bookmarked creators...</span>
        </div>
      ) : filteredCreators.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredCreators.map((creator) => (
            <InfluencerCard
              key={creator.id}
              influencer={creator}
              showCampaignContext={true}
              onRemove={handleRemove}
            />
          ))}
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
            gap: '16px',
            maxWidth: '460px',
            margin: '40px auto 0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🔖
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No saved influencers yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Bookmark creators from the recommendations tab to keep track of candidate profiles here.
            </p>
          </div>
          <button
            onClick={() => navigate('/company/recommendations')}
            className="button-gradient"
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Explore Recommendations
          </button>
        </div>
      )}

    </div>
  );
};

export default SavedInfluencers;
