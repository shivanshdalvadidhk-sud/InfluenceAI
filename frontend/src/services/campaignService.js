import api from './api';
import { mockCampaigns } from '../data/mockData';

const STORAGE_KEY = 'influenceai_campaigns';

const getLocalCampaigns = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCampaigns));
    return mockCampaigns;
  }
  return JSON.parse(data);
};

export const campaignService = {
  getCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      if (response.data && response.data.success && response.data.campaigns.length > 0) {
        return response.data.campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          budget: c.budget,
          budgetStr: `₹${(Number(c.budget) || 0).toLocaleString('en-IN')}`,
          description: c.description,
          audienceGender: c.audience_gender,
          audienceLanguage: c.audience_language,
          state: c.state_ut,
          status: c.status || 'Active',
          createdDate: new Date(c.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
      }
    } catch (err) {
      console.warn("Backend campaigns API unavailable, using local data fallback:", err.message);
    }
    return getLocalCampaigns();
  },

  getCampaignById: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      if (response.data && response.data.success && response.data.campaign) {
        const c = response.data.campaign;
        return {
          id: c.id,
          name: c.name,
          category: c.category,
          budget: c.budget,
          budgetStr: `₹${(Number(c.budget) || 0).toLocaleString('en-IN')}`,
          description: c.description,
          audienceGender: c.audience_gender,
          audienceLanguage: c.audience_language,
          state: c.state_ut,
          status: c.status || 'Active',
          createdDate: new Date(c.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
    } catch (err) {
      console.warn("Backend campaign by id API unavailable, using local fallback:", err.message);
    }
    const list = getLocalCampaigns();
    const cleanId = (id || '').toString().replace(/%20/g, ' ').replace(/\s+/g, '-').toLowerCase();
    return list.find((c) => c.id.toString().toLowerCase() === cleanId) || null;
  },

  createCampaign: async (campaignData) => {
    let created = null;
    try {
      const response = await api.post('/campaigns', campaignData);
      if (response.data && response.data.success && response.data.campaign) {
        const c = response.data.campaign;
        created = {
          id: c.id,
          name: c.name,
          category: c.category,
          budget: c.budget,
          budgetStr: `₹${(Number(c.budget) || 0).toLocaleString('en-IN')}`,
          description: c.description,
          audienceGender: c.audience_gender,
          audienceLanguage: c.audience_language,
          state: c.state_ut,
          status: c.status || 'Active',
          createdDate: new Date(c.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
    } catch (err) {
      console.warn("Backend create campaign API unavailable, fallback to local creation:", err.message);
    }

    if (!created) {
      const list = getLocalCampaigns();
      created = {
        id: `camp-${Date.now()}`,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Active',
        budgetStr: `₹${(Number(campaignData.budget) || 0).toLocaleString('en-IN')}`,
        topMatch: 'High Recommendation (95%)',
        ...campaignData
      };
      list.unshift(created);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return created;
  },

  duplicateCampaign: async (id) => {
    try {
      const response = await api.post(`/campaigns/${id}/duplicate`);
      if (response.data && response.data.success && response.data.campaign) {
        const c = response.data.campaign;
        return {
          id: c.id,
          name: c.name,
          category: c.category,
          budget: c.budget,
          status: c.status || 'Draft'
        };
      }
    } catch (err) {
      console.warn("Backend duplicate API unavailable, fallback to local duplicate:", err.message);
    }
    const list = getLocalCampaigns();
    const original = list.find((c) => c.id === id);
    if (!original) throw new Error("Campaign not found");
    const duplicate = { ...original, id: `camp-${Date.now()}`, name: `${original.name} (Copy)`, status: 'Draft' };
    list.unshift(duplicate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return duplicate;
  },

  deleteCampaign: async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
    } catch (err) {
      console.warn("Backend delete campaign API error:", err.message);
    }
    let list = getLocalCampaigns();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
};
