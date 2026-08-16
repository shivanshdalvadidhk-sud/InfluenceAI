import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ScoreBreakdown from '../../components/common/ScoreBreakdown';
import MatchBadge from '../../components/common/MatchBadge';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';
import { Briefcase, ArrowLeft, Building2, CheckCircle2, DollarSign } from 'lucide-react';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const creator = authService.getCurrentUser();
  const inquiryId = searchParams.get('inquiryId');

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expressed, setExpressed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      const creatorUser = authService.getCurrentUser();
      const searchInquiryId = searchParams.get('inquiryId');
      
      const data = await campaignService.getCampaignById(id);
      if (data) {
        // Fallback default details
        let budgetStr = data.budgetStr;
        let deliverables = data.deliverables;

        try {
          // Fetch creator direct inquiries to override generic campaign details with brand proposed parameters
          const inqs = await influencerService.getInquiries();
          let matchedInq = null;
          if (searchInquiryId) {
            matchedInq = inqs.find(i => i.id === searchInquiryId);
          } else {
            matchedInq = inqs.find(i => i.campaignId === data.id);
          }

          if (matchedInq) {
            budgetStr = matchedInq.budgetStr;
            deliverables = matchedInq.deliverables;
          }
        } catch (err) {
          console.warn('Error loading custom inquiry overrides:', err);
        }

        // Calculate match score
        let score = 78;
        if (creatorUser && data.category.toLowerCase() === creatorUser.category.toLowerCase()) {
          score = 94;
        }

        setCampaign({
          ...data,
          budgetStr,
          deliverables,
          matchScore: score
        });

        // Check if saved
        const savedIds = JSON.parse(localStorage.getItem('influenceai_saved_campaign_ids') || '[]');
        setIsSaved(savedIds.includes(data.id));
      } else {
        showToast('Campaign opportunity not found.', 'error');
        navigate('/influencer/dashboard');
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [id, navigate]);

  const handleToggleSave = () => {
    if (!campaign) return;
    const savedIds = JSON.parse(localStorage.getItem('influenceai_saved_campaign_ids') || '[]');
    let updated;
    if (savedIds.includes(campaign.id)) {
      updated = savedIds.filter(cid => cid !== campaign.id);
      setIsSaved(false);
      showToast('Campaign removed from bookmarks.', 'info');
    } else {
      updated = [...savedIds, campaign.id];
      setIsSaved(true);
      showToast('Campaign bookmarked successfully.', 'success');
    }
    localStorage.setItem('influenceai_saved_campaign_ids', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('influenceai_saved_changed'));
  };

  const handleExpressInterest = () => {
    setExpressed(true);
    showToast(`Interest registered! ${campaign.companyName} has been notified.`, 'success');
  };

  if (loading || !campaign) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
        <span>Loading campaign specifications...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          background: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          width: 'fit-content'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <PageHeader
        title={campaign.name}
        subtitle={`Sponsorship offer from ${campaign.companyName}. Reranked by AI suitability.`}
        icon={<Briefcase size={22} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="opp-split">
        
        {/* Core Brief specifications */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Brand header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{campaign.companyName}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Brand Partner Profile Verified</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Campaign Description & Brief</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{campaign.description}</p>
          </div>

          {/* Key requirements parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>BUDGET COMPENSATION OFFERED</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.budgetStr}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>TARGET LOCATION</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.state}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>AUDIENCE TARGET GENDER</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.audienceGender}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>SPONSORSHIP GOAL</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{campaign.goal}</span>
            </div>
          </div>

          {/* Deliverables checklist */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Deliverables Requested</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {campaign.deliverables && campaign.deliverables.map((d, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: 'var(--accent-blue)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '16px',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleToggleSave}
              type="button"
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                backgroundColor: isSaved ? 'var(--primary-light)' : 'white',
                color: isSaved ? 'var(--primary-purple)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '170px'
              }}
            >
              <span>{isSaved ? '🔖 Saved Opportunity' : 'Bookmark Brief'}</span>
            </button>

            <button
              onClick={handleExpressInterest}
              disabled={expressed}
              type="button"
              className={expressed ? '' : 'button-gradient'}
              style={{
                flexGrow: 1,
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: expressed ? '1px solid var(--border-color)' : 'none',
                backgroundColor: expressed ? '#F1F5F9' : '',
                color: expressed ? 'var(--text-secondary)' : 'white',
                cursor: expressed ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {expressed ? (
                <>
                  <CheckCircle2 size={18} color="var(--accent-green)" />
                  <span>Interest Expressed</span>
                </>
              ) : (
                <>
                  <Briefcase size={18} />
                  <span>Express Sponsorship Interest</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI scoring explanation card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>YOUR AI SUITABILITY RATING</span>
            <MatchBadge score={campaign.matchScore} size="lg" />
          </div>

          <ScoreBreakdown
            semantic={campaign.matchScore - 2}
            audience={92}
            budget={90}
            engagement={94}
            graph={88}
            final={campaign.matchScore}
          />
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .opp-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OpportunityDetail;
