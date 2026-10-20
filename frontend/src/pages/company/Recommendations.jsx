import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InfluencerCard from '../../components/cards/InfluencerCard';
import RecommendationHistory from '../../components/RecommendationHistory';
import {
  recommendationService,
  AI_ENGINE_CATEGORIES,
  AI_CAMPAIGN_GOALS,
  AI_TARGET_COUNTRIES
} from '../../services/recommendationService';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { Sparkles, Search, ArrowUpDown, History, Sliders, Play, PlusCircle } from 'lucide-react';

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core States
  const [campaign, setCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showEngineForm, setShowEngineForm] = useState(false);

  // Live Input Controls (synced with selected campaign)
  const [engineCategory, setEngineCategory] = useState('fashion');
  const [engineDescription, setEngineDescription] = useState('');
  const [engineBudget, setEngineBudget] = useState(150000);
  const [engineCountry, setEngineCountry] = useState('India');
  const [engineGoal, setEngineGoal] = useState('awareness');
  const [engineTopN, setEngineTopN] = useState(10);
  const [engineStrict, setEngineStrict] = useState(true);

  // Client-side Filter & Sort Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [minSubs, setMinSubs] = useState('Any');
  const [sortBy, setSortBy] = useState('Highest AI Score');

  const syncEngineControlsFromCampaign = (camp) => {
    if (!camp) return;
    setEngineCategory((camp.category || 'fashion').toLowerCase());
    setEngineDescription(
      camp.campaign_description ||
        camp.description ||
        `Influencer marketing campaign for ${camp.name || camp.category} targeting YouTube audiences.`
    );
    setEngineBudget(Number(camp.budget_inr || camp.budget || 150000));
    setEngineCountry(camp.target_country !== undefined ? camp.target_country : 'India');
    setEngineGoal((camp.campaign_goal || camp.campaignGoal || 'awareness').toLowerCase());
    setEngineTopN(Number(camp.top_n || camp.topN || 10));
    setEngineStrict(camp.strict_category !== undefined ? Boolean(camp.strict_category) : true);
  };

  // Load user's campaigns and recommendations
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const campList = await campaignService.getCampaigns();
        setCampaigns(campList);

        const campId = searchParams.get('campaign');

        let activeCamp = null;
        if (campId) {
          activeCamp = campList.find((c) => String(c.id) === String(campId));
        }
        if (!activeCamp && campList.length > 0) {
          activeCamp = campList[0];
        }

        setCampaign(activeCamp);
        if (activeCamp) {
          syncEngineControlsFromCampaign(activeCamp);
          if (Array.isArray(activeCamp.recommendations) && activeCamp.recommendations.length > 0) {
            setInfluencers(activeCamp.recommendations);
            setFilteredInfluencers(activeCamp.recommendations);
          } else {
            const recs = await recommendationService.getRecommendations(activeCamp);
            setInfluencers(recs);
            setFilteredInfluencers(recs);
          }
        } else {
          // User has no campaigns yet; check if they have any saved recommendation history
          const pastHistory = await recommendationService.getAllRecommendationHistory();
          if (pastHistory.length > 0 && Array.isArray(pastHistory[0].recommendations) && pastHistory[0].recommendations.length > 0) {
            const latest = pastHistory[0];
            setEngineCategory((latest.category || 'fashion').toLowerCase());
            setEngineDescription(latest.campaign_description || '');
            setEngineBudget(Number(latest.budget_inr || 150000));
            setEngineCountry(latest.target_country !== undefined ? latest.target_country : 'India');
            setEngineGoal((latest.campaign_goal || 'awareness').toLowerCase());
            setEngineTopN(Number(latest.top_n || 10));
            setEngineStrict(latest.strict_category !== undefined ? Boolean(latest.strict_category) : true);
            setInfluencers(latest.recommendations);
            setFilteredInfluencers(latest.recommendations);
          } else {
            setInfluencers([]);
            setFilteredInfluencers([]);
          }
        }
      } catch (err) {
        showToast('Error loading AI recommendations.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Run AI Engine manually with current parameters
  const handleRunCustomEngine = async (e) => {
    if (e) e.preventDefault();
    if (!engineDescription || engineDescription.trim().length < 10) {
      showToast('Campaign description must be at least 10 characters.', 'error');
      return;
    }
    setLoading(true);
    try {
      const recs = await recommendationService.getRecommendations({
        id: campaign?.id || null,
        name: campaign?.name || `${engineCategory.toUpperCase()} Custom Match`,
        category: engineCategory,
        campaign_description: engineDescription.trim(),
        budget_inr: Number(engineBudget) || 100000,
        target_country: engineCountry,
        campaign_goal: engineGoal,
        top_n: Number(engineTopN) || 10,
        strict_category: Boolean(engineStrict)
      });
      setInfluencers(recs);
      setFilteredInfluencers(recs);
      showToast(`Generated ${recs.length} channel recommendations & saved to history!`, 'success');
    } catch (err) {
      showToast('Error running recommendation match.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply search, tier, subscriber filter, and sort (always enforces >= 5000 followers)
  useEffect(() => {
    let result = influencers.filter(
      (i) => Number(i.subscriber_count ?? i.subscribers ?? 0) >= 5000
    );

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((i) => {
        const name = (i.channel_name || i.name || '').toLowerCase();
        const cat = (i.category || '').toLowerCase();
        const reasons = Array.isArray(i.reasons) ? i.reasons.join(' ').toLowerCase() : '';
        return name.includes(q) || cat.includes(q) || reasons.includes(q);
      });
    }

    if (selectedTier !== 'All Tiers') {
      result = result.filter((i) => (i.tier || '').toLowerCase() === selectedTier.toLowerCase());
    }

    if (minSubs !== 'Any') {
      const min = Number(minSubs);
      result = result.filter((i) => Number(i.subscriber_count ?? i.subscribers ?? 0) >= min);
    }

    if (sortBy === 'Highest AI Score') {
      result.sort(
        (a, b) =>
          Number(b.recommendation_score ?? (b.finalScore || 0) / 100) -
          Number(a.recommendation_score ?? (a.finalScore || 0) / 100)
      );
    } else if (sortBy === 'Most Subscribers') {
      result.sort(
        (a, b) =>
          Number(b.subscriber_count ?? b.subscribers ?? 0) -
          Number(a.subscriber_count ?? a.subscribers ?? 0)
      );
    } else if (sortBy === 'Highest Engagement') {
      result.sort(
        (a, b) =>
          Number(b.engagement_rate ?? b.engagementRate ?? 0) -
          Number(a.engagement_rate ?? a.engagementRate ?? 0)
      );
    } else if (sortBy === 'Most Views') {
      result.sort(
        (a, b) =>
          Number(b.view_count ?? b.avgViews ?? 0) -
          Number(a.view_count ?? a.avgViews ?? 0)
      );
    }

    setFilteredInfluencers(result);
  }, [searchTerm, selectedTier, minSubs, sortBy, influencers]);

  const handleCampaignChange = (e) => {
    const campId = e.target.value;
    const selected = campaigns.find((c) => String(c.id) === String(campId));
    if (selected) {
      setCampaign(selected);
      syncEngineControlsFromCampaign(selected);
      navigate(`/company/recommendations?campaign=${campId}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      {/* Upper Campaign & Match Header Banner */}
      <div
        style={{
          background: 'var(--gradient-brand-light)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '22px 24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 8px 0' }}>
            {campaign ? `AI Matches for "${campaign.name}"` : 'AI Channel Recommendations'}
          </h2>

          {/* Category and Goal placed directly AFTER AI Matches heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              Category: {engineCategory}
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary-purple)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              Goal: {engineGoal}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>
              Budget: <strong>₹{Number(engineBudget || 0).toLocaleString('en-IN')}</strong>
            </span>
            <span>
              Country: <strong>{engineCountry || 'Global'}</strong>
            </span>
            <span>
              Top Results: <strong>{engineTopN}</strong>
            </span>
            <span>
              Mode: <strong>{engineStrict ? 'Strict Category' : 'Cross-Niche'}</strong>
            </span>
          </div>
        </div>

        {/* Right Controls: Active Campaign Selector + Toggle Match Params + Toggle History */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {campaigns.length > 0 && (
            <select
              value={campaign?.id || ''}
              onChange={handleCampaignChange}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
                backgroundColor: 'white',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setShowEngineForm(!showEngineForm)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: showEngineForm ? 'var(--primary-purple)' : 'white',
              color: showEngineForm ? 'white' : 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sliders size={14} />
            <span>Match Parameters</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryView(!showHistoryView)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: showHistoryView ? 'var(--primary-purple)' : 'white',
              color: showHistoryView ? 'white' : 'var(--primary-purple)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} />
            <span>{showHistoryView ? 'View Active Cards' : 'Recommendation History'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Match Parameters Form */}
      {showEngineForm && (
        <form
          onSubmit={handleRunCustomEngine}
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Customize Campaign Match Criteria
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Results are automatically saved to your Recommendation History
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CATEGORY
              </label>
              <select
                value={engineCategory}
                onChange={(e) => setEngineCategory(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', backgroundColor: 'white' }}
              >
                {AI_ENGINE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                BUDGET (INR)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={engineBudget}
                onChange={(e) => setEngineBudget(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CAMPAIGN GOAL
              </label>
              <select
                value={engineGoal}
                onChange={(e) => setEngineGoal(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', backgroundColor: 'white' }}
              >
                {AI_CAMPAIGN_GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.value.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                TARGET COUNTRY
              </label>
              <select
                value={engineCountry}
                onChange={(e) => setEngineCountry(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', backgroundColor: 'white' }}
              >
                {AI_TARGET_COUNTRIES.map((c) => (
                  <option key={c.label} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                TOP RESULTS
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={engineTopN}
                onChange={(e) => setEngineTopN(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CATEGORY MODE
              </label>
              <select
                value={engineStrict ? 'true' : 'false'}
                onChange={(e) => setEngineStrict(e.target.value === 'true')}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', backgroundColor: 'white' }}
              >
                <option value="true">Strict (Exact Category)</option>
                <option value="false">Broad (Cross-Niche)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CAMPAIGN DESCRIPTION
              </label>
              <input
                type="text"
                placeholder="Describe your product, target audience, and campaign goals (min 10 characters)..."
                value={engineDescription}
                onChange={(e) => setEngineDescription(e.target.value)}
                minLength={10}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.84rem' }}
              />
            </div>

            <button
              type="submit"
              className="button-gradient"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Play size={14} />
              <span>Find Matching Channels</span>
            </button>
          </div>
        </form>
      )}

      {/* Either Show Recommendation History View OR Active Recommended Channel Cards */}
      {showHistoryView ? (
        <RecommendationHistory
          campaignId={null}
          onBack={() => setShowHistoryView(false)}
        />
      ) : (
        <>
          {/* Filter and sorting controls */}
          {influencers.length > 0 && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} className="filters-search-row">
                {/* Search */}
                <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="Search recommended YouTube channels..."
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

                {/* Creator Tier dropdown */}
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '140px', backgroundColor: 'white' }}
                >
                  <option value="All Tiers">All Tiers</option>
                  <option value="nano">Nano (5K–10K)</option>
                  <option value="micro">Micro (10K–100K)</option>
                  <option value="mid">Mid (100K–500K)</option>
                  <option value="macro">Macro (500K+)</option>
                </select>

                {/* Min subscribers */}
                <select
                  value={minSubs}
                  onChange={(e) => setMinSubs(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', minWidth: '150px', backgroundColor: 'white' }}
                >
                  <option value="Any">Min Followers (5K+)</option>
                  <option value="10000">10K+ Subscribers</option>
                  <option value="50000">50K+ Subscribers</option>
                  <option value="100000">100K+ Subscribers</option>
                  <option value="500000">500K+ Subscribers</option>
                  <option value="1000000">1M+ Subscribers</option>
                </select>

                {/* Sort selection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="sort-box">
                  <ArrowUpDown size={16} style={{ color: 'var(--text-light)' }} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'white' }}
                  >
                    <option value="Highest AI Score">Highest AI Score</option>
                    <option value="Most Subscribers">Most Subscribers</option>
                    <option value="Highest Engagement">Highest Engagement</option>
                    <option value="Most Views">Most Total Views</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Finding the best matching YouTube channels for your campaign...
              </span>
            </div>
          ) : influencers.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '60px 24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <Sparkles size={38} style={{ color: 'var(--primary-purple)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                No AI Recommendations Generated Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: 0, lineHeight: 1.5 }}>
                You haven't created any campaigns or run any channel matches yet. Create your first campaign or open <strong>Match Parameters</strong> above to discover YouTube creators tailored to your brand.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/company/campaigns/create')}
                  className="button-gradient"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Create First Campaign</span>
                </button>
                <button
                  onClick={() => setShowEngineForm(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'white',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Open Match Parameters
                </button>
              </div>
            </div>
          ) : filteredInfluencers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Showing {filteredInfluencers.length} recommended YouTube channels
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '22px'
                }}
              >
                {filteredInfluencers.map((creator, idx) => (
                  <InfluencerCard
                    key={creator.channel_id || creator.id || idx}
                    influencer={creator}
                  />
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
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '32px' }}>🔍</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>No matching YouTube channels found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: 0 }}>
                Try increasing your budget (INR), switching Category Mode to Broad, or resetting your subscriber/tier filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTier('All Tiers');
                  setMinSubs('Any');
                }}
                className="button-gradient"
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '8px',
                  cursor: 'pointer'
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Recommendations;
