import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import MatchBadge from '../../components/common/MatchBadge';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { Bookmark, Trash2, BookOpen } from 'lucide-react';

const SavedOpportunities = () => {
  const navigate = useNavigate();
  const [savedCamps, setSavedCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedCampaigns = async () => {
    setLoading(true);
    try {
      const savedIds = JSON.parse(localStorage.getItem('influenceai_saved_campaign_ids') || '[]');
      const allCamps = await campaignService.getCampaigns();
      
      const filtered = allCamps
        .filter((c) => savedIds.includes(c.id))
        .map((c) => ({
          ...c,
          matchScore: 94 // default match
        }));
      setSavedCamps(filtered);
    } catch (err) {
      showToast('Error loading saved campaigns.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedCampaigns();
    window.addEventListener('influenceai_saved_changed', loadSavedCampaigns);
    return () => window.removeEventListener('influenceai_saved_changed', loadSavedCampaigns);
  }, []);

  const handleRemove = (id) => {
    const savedIds = JSON.parse(localStorage.getItem('influenceai_saved_campaign_ids') || '[]');
    const updated = savedIds.filter((cid) => cid !== id);
    localStorage.setItem('influenceai_saved_campaign_ids', JSON.stringify(updated));
    showToast('Saved opportunity removed.', 'info');
    loadSavedCampaigns();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="Saved Campaign Opportunities"
        subtitle="Review or express interest in campaign deals you bookmarked."
        icon={<Bookmark size={22} />}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <span>Loading bookmarked opportunities...</span>
        </div>
      ) : savedCamps.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {savedCamps.map((camp) => (
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
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Brand: {camp.companyName}</span>
                <MatchBadge score={camp.matchScore} size="sm" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camp.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>{camp.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={() => handleRemove(camp.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    backgroundColor: 'white',
                    color: 'var(--accent-red)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
                
                <button
                  onClick={() => navigate(`/influencer/opportunities/${camp.id}`)}
                  className="button-gradient"
                  style={{
                    flexGrow: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <BookOpen size={14} />
                  <span>Inspect Brief Specs</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', maxWidth: '440px', margin: '40px auto 0 auto' }}>
          <span style={{ fontSize: '32px' }}>🔖</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '10px' }}>No saved campaigns logged</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginTop: '4px' }}>Bookmark campaign briefs from their details view to save and review them here.</p>
        </div>
      )}

    </div>
  );
};

export default SavedOpportunities;
