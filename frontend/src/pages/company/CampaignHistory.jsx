import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import CampaignCard from '../../components/cards/CampaignCard';
import RecommendationHistory from '../../components/RecommendationHistory';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { History, PlusCircle, Sparkles, FolderKanban } from 'lucide-react';

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'recommendations'
  const [selectedCampaignForHistory, setSelectedCampaignForHistory] = useState(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      showToast('Error loading history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDuplicate = async (id) => {
    try {
      await campaignService.duplicateCampaign(id);
      showToast('Campaign duplicated successfully.', 'success');
      loadCampaigns();
    } catch (err) {
      showToast('Error duplicating campaign.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.deleteCampaign(id);
        showToast('Campaign deleted successfully.', 'success');
        loadCampaigns();
      } catch (err) {
        showToast('Error deleting campaign.', 'error');
      }
    }
  };

  const handleViewCampaignHistory = (campaignId) => {
    setSelectedCampaignForHistory(campaignId);
    setActiveTab('recommendations');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      <PageHeader
        title="Campaign & Recommendation History"
        subtitle="Permanent archive of all created campaigns and every AI recommendation run with channel links, profile photos & subscriber counts."
        icon={<History size={22} />}
        action={
          <button
            onClick={() => navigate('/company/campaigns/create')}
            className="button-gradient"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} />
            <span>New YouTube Campaign</span>
          </button>
        }
      />

      {/* Tab Switcher: Campaigns Archive vs All AI Recommendation Runs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          width: 'fit-content'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedCampaignForHistory(null);
            setActiveTab('campaigns');
          }}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'campaigns' ? 'var(--primary-purple)' : 'transparent',
            color: activeTab === 'campaigns' ? 'white' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FolderKanban size={15} />
          <span>Campaigns Archive ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCampaignForHistory(null);
            setActiveTab('recommendations');
          }}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'recommendations' ? 'var(--primary-purple)' : 'transparent',
            color: activeTab === 'recommendations' ? 'white' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={15} />
          <span>AI Recommendation Runs History</span>
        </button>
      </div>

      {activeTab === 'recommendations' ? (
        <RecommendationHistory
          campaignId={selectedCampaignForHistory}
          onBack={
            selectedCampaignForHistory
              ? () => {
                  setSelectedCampaignForHistory(null);
                  setActiveTab('campaigns');
                }
              : null
          }
        />
      ) : loading ? (
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
          <span>Loading historical campaign logs...</span>
        </div>
      ) : campaigns.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onViewHistory={handleViewCampaignHistory}
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
          <div style={{ fontSize: '32px' }}>📁</div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No campaigns logged yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Set up your first influencer campaign to begin tracking AI recommendations and scoring lists here.
            </p>
          </div>
          <button
            onClick={() => navigate('/company/campaigns/create')}
            className="button-gradient"
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Create New Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
