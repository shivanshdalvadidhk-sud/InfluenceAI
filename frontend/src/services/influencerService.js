import api from './api';
import { mockInfluencers, mockInquiries } from '../data/mockData';
import { authService } from './authService';

const SAVED_KEY = 'influenceai_saved';
const INQ_KEY = 'influenceai_inquiries';

const getSavedIdsFromStorage = () => {
  const data = localStorage.getItem(SAVED_KEY);
  if (!data) return ['rohan-mehta', 'vikramaditya-roy'];
  return JSON.parse(data);
};

const getInquiriesFromStorage = () => {
  const data = localStorage.getItem(INQ_KEY);
  if (!data) {
    localStorage.setItem(INQ_KEY, JSON.stringify(mockInquiries));
    return mockInquiries;
  }
  return JSON.parse(data);
};

export const influencerService = {
  getInfluencers: async () => {
    try {
      const response = await api.get('/influencers');
      if (response.data && response.data.success && response.data.influencers.length > 0) {
        return response.data.influencers.map((inf) => ({
          id: inf.id.toString(),
          name: inf.full_name,
          creatorName: inf.creator_name,
          handle: inf.youtube_handle,
          category: inf.content_niche_category,
          state: inf.state_ut,
          bio: inf.bio || 'Verified content creator.',
          platform: inf.primary_platform || 'YouTube',
          primaryPlatform: inf.primary_platform || 'YouTube',
          subscribers: inf.subscribers || 50000,
          avgViews: inf.avg_views || 15000,
          engagementRate: inf.engagement_rate || 4.8,
          graphScore: inf.graph_score || 85,
          estimatedCost: inf.estimated_cost || (inf.subscribers ? Math.round(inf.subscribers * 0.1) : 95000),
          avatar: inf.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
        }));
      }
    } catch (err) {
      console.warn("Backend getInfluencers API unavailable, fallback to local:", err.message);
    }
    return mockInfluencers;
  },

  getInfluencerById: async (id) => {
    try {
      const response = await api.get(`/influencers/${id}`);
      if (response.data && response.data.success && response.data.influencer) {
        const inf = response.data.influencer;
        return {
          id: inf.id.toString(),
          name: inf.full_name,
          creatorName: inf.creator_name,
          handle: inf.youtube_handle,
          category: inf.content_niche_category,
          state: inf.state_ut,
          bio: inf.bio || 'Verified content creator.',
          platform: inf.primary_platform || 'YouTube',
          primaryPlatform: inf.primary_platform || 'YouTube',
          subscribers: inf.subscribers || 50000,
          avgViews: inf.avg_views || 15000,
          engagementRate: inf.engagement_rate || 4.8,
          graphScore: inf.graph_score || 85,
          estimatedCost: inf.estimated_cost || (inf.subscribers ? Math.round(inf.subscribers * 0.1) : 95000),
          avatar: inf.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
        };
      }
    } catch (err) {
      console.warn("Backend getInfluencerById API unavailable, fallback to local:", err.message);
    }
    return mockInfluencers.find((i) => i.id === id) || null;
  },

  updateProfile: async (profileData) => {
    const user = authService.getCurrentUser();

    try {
      const response = await api.put('/influencers/profile', {
        userId: user?.userId || 'a0000000-0000-0000-0000-000000000002',
        fullName: profileData.name,
        creatorName: profileData.creatorName || profileData.name,
        bio: profileData.bio,
        state: profileData.state,
        handle: profileData.handle,
        subscribers: profileData.subscribers,
        avgViews: profileData.avgViews,
        engagementRate: profileData.engagementRate,
        category: profileData.category,
        estimatedCost: profileData.priceRates?.starting || 95000,
        avatar: profileData.avatar
      });

      if (response.data && response.data.success && response.data.influencer) {
        console.log("Influencer profile updated in Supabase:", response.data.influencer);
      }
    } catch (err) {
      console.warn("Backend updateProfile API error:", err.message);
    }

    const mergedUser = {
      ...user,
      ...profileData
    };

    authService.updateProfile(mergedUser);
    window.dispatchEvent(new Event('influenceai_profile_updated'));
    return mergedUser;
  },

  getSavedInfluencers: async () => {
    const user = authService.getCurrentUser();
    const userId = user?.userId || 'a0000000-0000-0000-0000-000000000001';
    try {
      const response = await api.get(`/influencers/saved/${userId}`);
      if (response.data && response.data.success && response.data.savedIds) {
        const savedIds = response.data.savedIds;
        const all = await influencerService.getInfluencers();
        return all.filter((i) => savedIds.includes(i.id.toString()));
      }
    } catch (err) {
      console.warn("Backend getSavedInfluencers error:", err.message);
    }
    const savedIds = getSavedIdsFromStorage();
    return mockInfluencers.filter((i) => savedIds.includes(i.id));
  },

  toggleSaveInfluencer: async (id) => {
    const user = authService.getCurrentUser();
    const userId = user?.userId || 'a0000000-0000-0000-0000-000000000001';
    let isSavedNow = false;

    try {
      const response = await api.post('/influencers/save', {
        userId: userId,
        influencerId: id
      });
      if (response.data && response.data.success) {
        isSavedNow = response.data.isSavedNow;
      }
    } catch (err) {
      console.warn("Backend toggleSaveInfluencer error:", err.message);
      let savedIds = getSavedIdsFromStorage();
      if (savedIds.includes(id)) {
        savedIds = savedIds.filter((sid) => sid !== id);
        isSavedNow = false;
      } else {
        savedIds.push(id);
        isSavedNow = true;
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    }

    window.dispatchEvent(new Event('influenceai_saved_changed'));
    return isSavedNow;
  },

  isInfluencerSaved: (id) => {
    const savedIds = getSavedIdsFromStorage();
    return savedIds.includes(id);
  },

  sendInquiry: async (inquiryData) => {
    const user = authService.getCurrentUser();
    let created = null;

    try {
      const response = await api.post('/influencers/inquiry', {
        companyId: user?.userId || null,
        influencerId: inquiryData.influencerId || null,
        campaignId: inquiryData.campaignId || null,
        message: inquiryData.message || inquiryData.proposal || '',
        bidAmount: inquiryData.budget || inquiryData.bidAmount || null
      });

      if (response.data && response.data.success && response.data.inquiry) {
        const inq = response.data.inquiry;
        created = {
          id: inq.id,
          campaignName: inquiryData.campaignName || 'Sponsorship Integration Proposal',
          companyName: inquiryData.companyName || user?.brandName || 'Brand Partner',
          deliverables: inquiryData.deliverables || ['60s Dedicated Video', 'Instagram Story Cross-post'],
          budgetStr: inq.bid_amount ? `₹${Number(inq.bid_amount).toLocaleString('en-IN')}` : '₹1,50,000',
          date: new Date(inq.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: inq.status || 'New',
          ...inquiryData
        };
      }
    } catch (err) {
      console.warn("Backend sendInquiry API error:", err.message);
    }

    if (!created) {
      const list = getInquiriesFromStorage();
      created = {
        id: `inq-${Date.now()}`,
        campaignName: inquiryData.campaignName || 'Festive Wear Product Review',
        companyName: inquiryData.companyName || user?.brandName || 'Aura Lifestyle',
        deliverables: inquiryData.deliverables || ['60s Video Integration', 'Instagram Story Cross-post'],
        budgetStr: inquiryData.budget ? `₹${Number(inquiryData.budget).toLocaleString('en-IN')}` : '₹1,50,000',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'New',
        ...inquiryData
      };
      list.unshift(created);
      localStorage.setItem(INQ_KEY, JSON.stringify(list));
    }

    window.dispatchEvent(new Event('influenceai_inquiries_changed'));
    return created;
  },

  getInquiries: async () => {
    try {
      const response = await api.get('/influencers/inquiries');
      if (response.data && response.data.success && response.data.inquiries.length > 0) {
        return response.data.inquiries.map((inq) => ({
          id: inq.id,
          companyId: inq.company_id,
          influencerId: inq.influencer_id,
          campaignId: inq.campaign_id || 'camp-1',
          campaignName: inq.campaign_name || 'Festive Wear Product Review',
          companyName: inq.company_name || 'Aura Lifestyle',
          deliverables: Array.isArray(inq.deliverables) ? inq.deliverables : ['60s Video Integration', 'Instagram Story Cross-post'],
          message: inq.message || '',
          budget: inq.bid_amount,
          budgetStr: inq.bid_amount ? `₹${Number(inq.bid_amount).toLocaleString('en-IN')}` : '₹1,50,000',
          status: inq.status || 'New',
          date: new Date(inq.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
      }
    } catch (err) {
      console.warn("Backend getInquiries API error:", err.message);
    }
    return getInquiriesFromStorage();
  },

  updateInquiryStatus: async (id, status) => {
    try {
      await api.patch(`/influencers/inquiry/${id}`, { status });
    } catch (err) {
      console.warn("Backend updateInquiryStatus error:", err.message);
    }
    const list = getInquiriesFromStorage();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(INQ_KEY, JSON.stringify(list));
    }
    window.dispatchEvent(new Event('influenceai_inquiries_changed'));
    return true;
  }
};
