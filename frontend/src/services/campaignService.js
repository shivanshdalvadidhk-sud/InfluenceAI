import api from './api';
import { authService } from './authService';
import { cacheRecommendedChannels } from './recommendationService';

const getStorageKey = () => {
  const user = authService.getCurrentUser();
  return user?.userId ? `influenceai_campaigns_${user.userId}` : 'influenceai_campaigns_guest';
};

const getLocalCampaigns = () => {
  try {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : [];
  } catch (_) {
    return [];
  }
};

const formatCampaignRecord = (c) => {
  const recs = Array.isArray(c.recommendations) ? c.recommendations : [];
  if (recs.length > 0) {
    cacheRecommendedChannels(recs);
  }
  const topRec = recs[0];
  const computedTopMatch =
    c.top_match ||
    c.topMatch ||
    (topRec
      ? `${topRec.channel_name || topRec.name} (${Math.round((Number(topRec.recommendation_score || 0.85)) * 100)}%)`
      : 'No AI Match Run Yet');

  return {
    id: c.id,
    companyId: c.company_id || c.companyId || null,
    name: c.name,
    category: (c.category || 'fashion').toLowerCase(),
    budget: Number(c.budget || c.budget_inr || 100000),
    budget_inr: Number(c.budget_inr || c.budget || 100000),
    budgetStr: `₹${(Number(c.budget || c.budget_inr) || 0).toLocaleString('en-IN')}`,
    description: c.description || c.campaign_description || '',
    campaign_description: c.campaign_description || c.description || '',
    targetCountry: c.target_country !== undefined ? c.target_country : (c.targetCountry !== undefined ? c.targetCountry : 'India'),
    target_country: c.target_country !== undefined ? c.target_country : (c.targetCountry !== undefined ? c.targetCountry : 'India'),
    campaignGoal: c.campaign_goal || c.campaignGoal || 'awareness',
    campaign_goal: c.campaign_goal || c.campaignGoal || 'awareness',
    topN: Number(c.top_n || c.topN || 10),
    top_n: Number(c.top_n || c.topN || 10),
    strictCategory: c.strict_category !== undefined ? Boolean(c.strict_category) : (c.strictCategory !== undefined ? Boolean(c.strictCategory) : true),
    strict_category: c.strict_category !== undefined ? Boolean(c.strict_category) : (c.strictCategory !== undefined ? Boolean(c.strictCategory) : true),
    audienceGender: c.audience_gender || c.audienceGender || 'All',
    audienceLanguage: c.audience_language || c.audienceLanguage || 'English & Hindi',
    state: c.state_ut || c.state || 'India',
    status: c.status || 'Active',
    recommendations: recs,
    topMatch: computedTopMatch,
    createdDate: new Date(c.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  };
};

export const campaignService = {
  getCampaigns: async () => {
    const user = authService.getCurrentUser();
    if (!user?.userId) return [];

    try {
      const response = await api.get(`/campaigns?companyId=${encodeURIComponent(user.userId)}`);
      if (response.data && response.data.success && Array.isArray(response.data.campaigns)) {
        const formatted = response.data.campaigns.map(formatCampaignRecord);
        localStorage.setItem(getStorageKey(), JSON.stringify(formatted));
        return formatted;
      }
    } catch (err) {
      console.warn('Backend campaigns API unavailable, using user-scoped local cache:', err.message);
    }
    return getLocalCampaigns().map(formatCampaignRecord);
  },

  getCampaignById: async (id) => {
    if (!id) return null;
    try {
      const response = await api.get(`/campaigns/${id}`);
      if (response.data && response.data.success && response.data.campaign) {
        return formatCampaignRecord(response.data.campaign);
      }
    } catch (err) {
      console.warn('Backend campaign by id API unavailable, checking local cache:', err.message);
    }
    const list = getLocalCampaigns();
    const cleanId = (id || '').toString().replace(/%20/g, ' ').replace(/\s+/g, '-').toLowerCase();
    const found = list.find((c) => c.id.toString().toLowerCase() === cleanId);
    return found ? formatCampaignRecord(found) : null;
  },

  createCampaign: async (campaignData) => {
    const user = authService.getCurrentUser();
    const payload = {
      ...campaignData,
      companyId: campaignData.companyId || user?.userId || null
    };

    let created = null;
    try {
      const response = await api.post('/campaigns', payload);
      if (response.data && response.data.success && response.data.campaign) {
        created = formatCampaignRecord(response.data.campaign);
      }
    } catch (err) {
      console.warn('Backend create campaign API unavailable, fallback to local creation:', err.message);
    }

    if (!created) {
      const list = getLocalCampaigns();
      created = formatCampaignRecord({
        id: `camp-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'Active',
        ...payload
      });
      list.unshift(created);
      localStorage.setItem(getStorageKey(), JSON.stringify(list));
    }
    return created;
  },

  duplicateCampaign: async (id) => {
    try {
      const response = await api.post(`/campaigns/${id}/duplicate`);
      if (response.data && response.data.success && response.data.campaign) {
        return formatCampaignRecord(response.data.campaign);
      }
    } catch (err) {
      console.warn('Backend duplicate API unavailable, fallback to local duplicate:', err.message);
    }
    const list = getLocalCampaigns();
    const original = list.find((c) => c.id === id);
    if (!original) throw new Error('Campaign not found');
    const duplicate = formatCampaignRecord({
      ...original,
      id: `camp-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'Draft'
    });
    list.unshift(duplicate);
    localStorage.setItem(getStorageKey(), JSON.stringify(list));
    return duplicate;
  },

  deleteCampaign: async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
    } catch (err) {
      console.warn('Backend delete campaign API error:', err.message);
    }
    let list = getLocalCampaigns();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(getStorageKey(), JSON.stringify(list));
    return true;
  }
};
