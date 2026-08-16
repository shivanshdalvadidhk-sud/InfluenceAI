import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import InfluencerCard from '../../components/cards/InfluencerCard';
import { recommendationService } from '../../services/recommendationService';
import { campaignService } from '../../services/campaignService';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { Sparkles, Search, Filter, ArrowUpDown, X, Check, Mail } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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

  // Inquiry Modal States
  const [openInquiry, setOpenInquiry] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [inquiryDeliverables, setInquiryDeliverables] = useState([]);
  const [customInquiryBudget, setCustomInquiryBudget] = useState(0);
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    // Listen for custom event to open the inquiry modal from inside the card
    const handleOpenInquiry = (e) => {
      const creator = e.detail;
      setSelectedCreator(creator);
      setSelectedCampaignId(campaign?.id || campaigns[0]?.id || '');
      setInquiryDeliverables([creator.format] || []);
      setCustomInquiryBudget(creator.estimatedCost);
      setOpenInquiry(true);
    };

    window.addEventListener('influenceai_open_inquiry_modal', handleOpenInquiry);
    return () => window.removeEventListener('influenceai_open_inquiry_modal', handleOpenInquiry);
  }, [campaign, campaigns]);

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
    } else if (sortBy === 'Highest Graph Score') {
      result.sort((a, b) => b.graphScore - a.graphScore);
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

  const handleInquirySubmit = async () => {
    if (!selectedCampaignId) {
      showToast('Please select a campaign.', 'error');
      return;
    }
    
    setSendingInquiry(true);
    try {
      const camp = campaigns.find(c => c.id === selectedCampaignId);
      
      await influencerService.sendInquiry({
        influencerId: selectedCreator.id,
        influencerName: selectedCreator.name,
        companyId: 'aura-lifestyle',
        companyName: 'Aura Lifestyle',
        campaignId: selectedCampaignId,
        campaignName: camp.name,
        budget: customInquiryBudget,
        budgetStr: `₹${Number(customInquiryBudget).toLocaleString('en-IN')}`,
        deliverables: inquiryDeliverables
      });
      
      showToast(`Inquiry dispatched to ${selectedCreator.name}!`, 'success');
      setOpenInquiry(false);
    } catch (err) {
      showToast('Error sending inquiry.', 'error');
    } finally {
      setSendingInquiry(false);
    }
  };

  const toggleInquiryDeliverable = (d) => {
    if (inquiryDeliverables.includes(d)) {
      setInquiryDeliverables(inquiryDeliverables.filter(item => item !== d));
    } else {
      setInquiryDeliverables([...inquiryDeliverables, d]);
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
              <option value="Highest Graph Score">Highest Graph Score</option>
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

      {/* Inquiry Sponsor offer modal */}
      {selectedCreator && (
        <Dialog open={openInquiry} onClose={() => setOpenInquiry(false)} maxWidth="sm" fullWidth borderRadius={16}>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>
            ✨ Send Sponsorship Inquiry
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
            
            {/* Creator details summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <img src={selectedCreator.avatar} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{selectedCreator.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedCreator.handle} • Collab Rate: ₹{selectedCreator.estimatedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Campaign Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Active Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deliverables selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Deliverables for Creator</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Dedicated Video', 'Integrated Sponsor Segment', 'Short/Reel', 'Story', 'Product Review'].map((d) => {
                  const isChecked = inquiryDeliverables.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleInquiryDeliverable(d)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: isChecked ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--primary-purple)' : 'white',
                        color: isChecked ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget offer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Proposed Collaboration Budget (₹)</label>
              <input
                type="number"
                value={customInquiryBudget}
                onChange={(e) => setCustomInquiryBudget(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
            </div>

          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button onClick={() => setOpenInquiry(false)} style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              onClick={handleInquirySubmit}
              disabled={sendingInquiry}
              variant="contained"
              style={{
                backgroundColor: 'var(--primary-purple)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {sendingInquiry ? 'Sending...' : (
                <>
                  <Mail size={14} />
                  <span>Send Offer</span>
                </>
              )}
            </Button>
          </DialogActions>
        </Dialog>
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
