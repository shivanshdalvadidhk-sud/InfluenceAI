import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import CampaignCard from '../../components/cards/CampaignCard';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { History, PlusCircle } from 'lucide-react';

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

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
      loadCampaigns(); // reload
    } catch (err) {
      showToast('Error duplicating campaign.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.deleteCampaign(id);
        showToast('Campaign deleted successfully.', 'success');
        loadCampaigns(); // reload
      } catch (err) {
        showToast('Error deleting campaign.', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      <PageHeader
        title="YouTube Campaign History"
        subtitle="Permanent archive of generated campaigns, target criteria, and recommended creators."
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
            }}
          >
            <PlusCircle size={16} />
            <span>New YouTube Campaign</span>
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <span>Loading historical campaign logs...</span>
        </div>
      ) : campaigns.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
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
          <div style={{ fontSize: '32px' }}>📁</div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No campaigns logged yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Setup your first influencer campaign to begin tracking recomendations and scoring lists here.
            </p>
          </div>
          <button
            onClick={() => navigate('/company/campaigns/create')}
            className="button-gradient"
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
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
