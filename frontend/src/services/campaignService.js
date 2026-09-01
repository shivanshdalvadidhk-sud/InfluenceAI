// InfluenceAI - Campaign Mock Service
import { mockCampaigns } from '../data/mockData';

const STORAGE_KEY = 'influenceai_campaigns';

const getCampaignsFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCampaigns));
    return mockCampaigns;
  }
  return JSON.parse(data);
};

export const campaignService = {
  getCampaigns: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getCampaignsFromStorage();
  },

  getCampaignById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const list = getCampaignsFromStorage();
    const cleanId = id.replace(/%20/g, ' ').replace(/\s+/g, '-').toLowerCase();
    return list.find((c) => {
      const cId = c.id.replace(/\s+/g, '-').toLowerCase();
      return cId === cleanId;
    }) || null;
  },

  createCampaign: async (campaignData) => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulating AI Matching Engine run
    const list = getCampaignsFromStorage();
    
    const newCampaign = {
      id: `camp-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      companyId: 'aura-lifestyle',
      companyName: 'Aura Lifestyle',
      budgetStr: `₹${Number(campaignData.budget).toLocaleString('en-IN')}`,
      topMatch: 'Rohan Mehta (95%)', // Placeholder matching status
      ...campaignData
    };
    
    list.unshift(newCampaign);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newCampaign;
  },

  duplicateCampaign: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = getCampaignsFromStorage();
    const original = list.find((c) => c.id === id);
    if (!original) throw new Error("Campaign not found");
    
    const duplicate = {
      ...original,
      id: `camp-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Draft'
    };
    
    list.unshift(duplicate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return duplicate;
  },

  deleteCampaign: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let list = getCampaignsFromStorage();
    list = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  }
};
