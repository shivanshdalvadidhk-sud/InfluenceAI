import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { campaignService } from '../../services/campaignService';
import {
  recommendationService,
  AI_ENGINE_CATEGORIES,
  AI_CAMPAIGN_GOALS,
  AI_TARGET_COUNTRIES
} from '../../services/recommendationService';
import { showToast } from '../../components/common/Toast';
import { Sparkles, ArrowRight, Layout, CheckCircle2, Info } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('fashion');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [budgetInr, setBudgetInr] = useState(150000);
  const [targetCountry, setTargetCountry] = useState('India');
  const [campaignGoal, setCampaignGoal] = useState('awareness');
  const [topN, setTopN] = useState(10);
  const [strictCategory, setStrictCategory] = useState(true);
  const [deliverables, setDeliverables] = useState(['Dedicated Video', 'Integrated Sponsor Segment']);

  // Loading animation states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Analyzing campaign brief and target criteria...',
    'Filtering verified YouTube channels by category, country & budget tier...',
    'Evaluating content relevance and channel compatibility...',
    'Scoring audience engagement metrics for your campaign goal...',
    'Ranking top creator matches & saving results to history...'
  ];

  const getBudgetTierLabel = (val) => {
    const b = Number(val) || 0;
    if (b < 10000) return 'Eligible Tier: Nano (< 10K subscribers)';
    if (b < 50000) return 'Eligible Tiers: Nano & Micro (< 100K subscribers)';
    if (b < 100000) return 'Eligible Tiers: Nano, Micro & Mid (≤ 500K subscribers)';
    return 'Eligible Tiers: All Tiers — Nano, Micro, Mid & Macro (500K+ subscribers)';
  };

  const handleDeliverableToggle = (d) => {
    if (deliverables.includes(d)) {
      setDeliverables(deliverables.filter((item) => item !== d));
    } else {
      setDeliverables([...deliverables, d]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !campaignDescription || campaignDescription.trim().length < 10) {
      showToast('Please provide a campaign name and a description of at least 10 characters.', 'error');
      return;
    }
    if (!budgetInr || Number(budgetInr) <= 0) {
      showToast('Budget (INR) must be greater than 0.', 'error');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const stepTimer = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const payload = {
        name: name.trim(),
        category: category.toLowerCase(),
        budget: Number(budgetInr),
        budget_inr: Number(budgetInr),
        description: campaignDescription.trim(),
        campaign_description: campaignDescription.trim(),
        target_country: targetCountry,
        targetCountry,
        state: targetCountry || 'India',
        campaign_goal: campaignGoal,
        campaignGoal,
        goal: campaignGoal,
        top_n: Number(topN) || 10,
        topN: Number(topN) || 10,
        strict_category: Boolean(strictCategory),
        strictCategory: Boolean(strictCategory),
        deliverables,
        platform: 'YouTube'
      };

      const newCamp = await campaignService.createCampaign(payload);

      // Immediately generate and store recommendations in history for this campaign
      await recommendationService.getRecommendations({
        ...payload,
        id: newCamp.id,
        campaignId: newCamp.id,
        campaignName: newCamp.name
      });

      clearInterval(stepTimer);
      setLoadingStep(loadingSteps.length - 1);
      showToast('AI Recommendations generated and saved to history!', 'success');
      setLoading(false);

      navigate(`/company/recommendations?campaign=${newCamp.id}&autoload=true`);
    } catch (err) {
      clearInterval(stepTimer);
      showToast('Error generating campaign recommendations.', 'error');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      <PageHeader
        title="Create AI YouTube Campaign"
        subtitle="Configure your campaign brief, target region, and budget to discover top matching YouTube channels."
        icon={<Layout size={22} />}
      />

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px' }} className="form-split">
          {/* Left Card: Campaign Core & Description */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)' }} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Campaign Brief & Budget
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Campaign Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Festive Fashion & Lifestyle Launch 2026"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Campaign Description *
              </label>
              <textarea
                rows={4}
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                required
                minLength={10}
                placeholder="Describe your product, target audience, and content style (minimum 10 characters)..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Campaign Budget in INR *
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--primary-purple)',
                  fontWeight: 600,
                  backgroundColor: 'rgba(124, 58, 237, 0.06)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginTop: '2px'
                }}
              >
                <Info size={14} />
                <span>{getBudgetTierLabel(budgetInr)}</span>
              </div>
            </div>

            {/* Deliverables checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Sponsorship Deliverables
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Dedicated Video', 'Integrated Sponsor Segment', 'YouTube Shorts', 'Product Review', 'Unboxing'].map((d) => {
                  const isChecked = deliverables.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDeliverableToggle(d)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isChecked ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--primary-light)' : 'white',
                        color: isChecked ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Card: Category, Goal & Ranking Parameters */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Category, Goal & Match Preferences
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Channel Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {AI_ENGINE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Campaign Goal *
              </label>
              <select
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {AI_CAMPAIGN_GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Target Country
              </label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {AI_TARGET_COUNTRIES.map((c) => (
                  <option key={c.label} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Number of Matches
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>1 to 50 channels</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Category Mode
                </label>
                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                  {[
                    { label: 'Strict', val: true },
                    { label: 'Broad', val: false }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setStrictCategory(opt.val)}
                      style={{
                        flex: 1,
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        backgroundColor: strictCategory === opt.val ? 'white' : 'transparent',
                        color: strictCategory === opt.val ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        boxShadow: strictCategory === opt.val ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                  {strictCategory ? 'Exact category match only' : 'Include related categories'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="button-gradient"
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={18} />
            <span>Find AI Channel Matches</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      {/* AI Recommendation Processing Modal */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            fontFamily: 'var(--font-body)'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              padding: '40px 32px',
              maxWidth: '480px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px'
            }}
          >
            <div style={{ position: 'relative', width: '76px', height: '76px' }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '6px solid var(--primary-light)',
                  borderTopColor: 'var(--primary-purple)',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px'
                }}
              >
                ✨
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Finding Matching YouTube Channels
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
                Matching your campaign brief with verified YouTube creators and saving results to your history.
              </p>
            </div>

            <div
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              {loadingSteps.map((step, idx) => {
                const isCompleted = loadingStep > idx;
                const isCurrent = loadingStep === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isCurrent || isCompleted ? 600 : 500,
                      color: isCompleted
                        ? 'var(--accent-green)'
                        : isCurrent
                        ? 'var(--primary-purple)'
                        : 'var(--text-light)'
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={14} />
                    ) : isCurrent ? (
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid var(--primary-purple)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}
                      />
                    ) : (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--text-light)' }} />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .form-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;
