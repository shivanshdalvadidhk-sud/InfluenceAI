import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import CampaignCard from '../../components/cards/CampaignCard';
import RecommendationHistory from '../../components/RecommendationHistory';
import { campaignService } from '../../services/campaignService';
import { influencerService, buildSafeYoutubeUrl } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { History, PlusCircle, Sparkles, FolderKanban, Send, CheckCircle2, Clock, X, ExternalLink, Video } from 'lucide-react';

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'recommendations' | 'inquiries'
  const [selectedCampaignForHistory, setSelectedCampaignForHistory] = useState(null);

  // Inquiries sent
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await influencerService.getInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.warn('Error loading sent inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

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
    loadInquiries();
    window.addEventListener('influenceai_inquiries_changed', loadInquiries);
    return () => window.removeEventListener('influenceai_inquiries_changed', loadInquiries);
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

        <button
          type="button"
          onClick={() => {
            setSelectedCampaignForHistory(null);
            setActiveTab('inquiries');
          }}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'inquiries' ? 'var(--primary-purple)' : 'transparent',
            color: activeTab === 'inquiries' ? 'white' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={15} />
          <span>Proposals & Inquiries Sent ({inquiries.length})</span>
        </button>
      </div>

      {activeTab === 'inquiries' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loadingInquiries ? (
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
              <span>Loading dispatched sponsorship proposals...</span>
            </div>
          ) : inquiries.length > 0 ? (
            inquiries.map((inq) => {
              const isAccepted = inq.status === 'Accepted' || inq.status === 'Interested';
              const isPending = inq.status === 'Pending' || inq.status === 'New';
              const isDeclined = inq.status === 'Declined';
              const budgetDisplay = inq.budgetStr || (inq.budget ? `₹${Number(inq.budget).toLocaleString('en-IN')}` : '₹0');
              const creatorName = inq.influencerName || 'YouTube Creator';
              const creatorAvatar = inq.influencerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=7c3aed&color=fff`;
              const safeYtUrl = buildSafeYoutubeUrl(inq.influencerHandle, inq.youtubeChannelId);

              return (
                <div
                  key={inq.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border-color)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <img
                      src={creatorAvatar}
                      alt={creatorName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=7c3aed&color=fff`;
                      }}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--border-color)'
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {creatorName}
                        </span>
                        {safeYtUrl && (
                          <a
                            href={safeYtUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--accent-red)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <Video size={12} />
                            <span>YouTube</span>
                          </a>
                        )}
                      </div>

                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        Campaign: <strong>{inq.campaignName || 'Sponsorship Offer'}</strong> • Budget Offer: <strong style={{ color: 'var(--accent-green)' }}>{budgetDisplay}</strong>
                      </span>

                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.76rem', color: 'var(--text-light)', marginTop: '6px', flexWrap: 'wrap' }}>
                        {inq.deliverables && (
                          <span>Deliverables: {Array.isArray(inq.deliverables) ? inq.deliverables.join(', ') : inq.deliverables}</span>
                        )}
                        <span>Sent: {inq.date || 'Recent'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div>
                    {isAccepted ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#D1FAE5',
                          color: '#065F46',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          border: '1px solid #A7F3D0'
                        }}
                      >
                        <CheckCircle2 size={16} color="#059669" />
                        <span>Accepted by Creator</span>
                      </span>
                    ) : isPending ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          border: '1px solid #FDE68A'
                        }}
                      >
                        <Clock size={16} color="#D97706" />
                        <span>Pending Creator Response</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          border: '1px solid #FECACA'
                        }}
                      >
                        <X size={16} color="#DC2626" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
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
                maxWidth: '460px',
                margin: '40px auto 0 auto'
              }}
            >
              <Send size={32} style={{ color: 'var(--primary-purple)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>No proposals sent yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                When you browse recommended creators and click "Inquiry Sponsorship", dispatched proposals and their live creator acceptance status will show here.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'recommendations' ? (
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
