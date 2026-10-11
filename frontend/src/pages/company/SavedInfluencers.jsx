import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { influencerService } from '../../services/influencerService';
import { AI_ENGINE_CATEGORIES } from '../../services/recommendationService';
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
    const handleSavedChanged = () => loadSaved();
    window.addEventListener('influenceai_saved_changed', handleSavedChanged);
    return () => window.removeEventListener('influenceai_saved_changed', handleSavedChanged);
  }, []);

  useEffect(() => {
    let result = [...savedCreators];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          (i.channel_name || i.name || '').toLowerCase().includes(q) ||
          (i.channel_url || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All Niches') {
      result = result.filter((i) => (i.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    setFilteredCreators(result);
  }, [searchTerm, categoryFilter, savedCreators]);

  const handleRemove = (id) => {
    setSavedCreators((prev) => prev.filter((c) => (c.channel_id || c.id) !== id));
    showToast('Bookmark removed.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      <PageHeader
        title="Saved YouTube Channels"
        subtitle="Keep track of recommended YouTube channels you bookmarked for current or future campaigns."
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
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search saved channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '150px', backgroundColor: 'white' }}
          >
            <option value="All Niches">All Categories</option>
            {AI_ENGINE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bookmarks Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--primary-light)',
              borderTopColor: 'var(--primary-purple)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto'
            }}
          />
          <span>Loading bookmarked YouTube channels...</span>
        </div>
      ) : filteredCreators.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}
        >
          {filteredCreators.map((creator, idx) => (
            <InfluencerCard
              key={creator.channel_id || creator.id || idx}
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
            margin: '40px auto 0 auto'
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
              fontSize: '28px'
            }}
          >
            🔖
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No saved channels yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Bookmark YouTube channels from the AI Recommendations tab to keep track of candidate profiles here.
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
              cursor: 'pointer'
            }}
          >
            Explore AI Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedInfluencers;
