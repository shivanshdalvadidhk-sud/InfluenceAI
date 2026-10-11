import api from './api';
import { mockInfluencers } from '../data/mockData';
import { authService } from './authService';
import { getCachedRecommendedChannel } from './recommendationService';

const getSavedKey = () => {
  const user = authService.getCurrentUser();
  return user?.userId ? `influenceai_saved_${user.userId}` : 'influenceai_saved_guest';
};

const getInqKey = () => {
  const user = authService.getCurrentUser();
  return user?.userId ? `influenceai_inquiries_${user.userId}` : 'influenceai_inquiries_guest';
};

const getSavedIdsFromStorage = () => {
  try {
    const user = authService.getCurrentUser();
    if (!user?.userId) return [];
    const data = localStorage.getItem(getSavedKey());
    if (!data) return [];
    return JSON.parse(data);
  } catch (_) {
    return [];
  }
};

const getInquiriesFromStorage = () => {
  try {
    const user = authService.getCurrentUser();
    if (!user?.userId) return [];
    const data = localStorage.getItem(getInqKey());
    return data ? JSON.parse(data) : [];
  } catch (_) {
    return [];
  }
};

const normalizeInfluencer = (inf) => {
  if (!inf) return null;
  const id = (inf.channel_id || inf.id || '').toString();
  const cached = getCachedRecommendedChannel(id) || {};
  const merged = { ...cached, ...inf };

  const subscribers = Number(merged.subscriber_count ?? merged.subscribers ?? 50000);
  const viewCount = Number(merged.view_count ?? merged.avgViews ?? merged.avg_views ?? 15000);
  const rawEngRate = Number(merged.engagement_rate ?? merged.engagementRate ?? 0.045);
  const engRatePercent = rawEngRate <= 1 ? Number((rawEngRate * 100).toFixed(2)) : Number(rawEngRate.toFixed(2));
  const tier =
    merged.tier ||
    (subscribers < 10000 ? 'nano' : subscribers < 100000 ? 'micro' : subscribers <= 500000 ? 'mid' : 'macro');

  const name = merged.channel_name || merged.full_name || merged.creator_name || merged.name || 'YouTube Creator';
  const channelUrl =
    merged.channel_url ||
    merged.channelUrl ||
    (id.startsWith('UC') ? `https://www.youtube.com/channel/${id}` : `https://www.youtube.com/${merged.youtube_handle || merged.handle || ''}`);
  const thumbnailUrl =
    merged.thumbnail_url ||
    merged.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;

  const estimatedCost =
    merged.estimated_cost ||
    merged.estimatedCost ||
    (tier === 'nano' ? 8000 : tier === 'micro' ? 35000 : tier === 'mid' ? 80000 : 150000);

  return {
    ...merged,
    id,
    channel_id: id,
    name,
    channel_name: name,
    creatorName: merged.creator_name || name,
    handle: merged.youtube_handle || merged.handle || `@${name.replace(/\s+/g, '').toLowerCase()}`,
    channel_url: channelUrl,
    thumbnail_url: thumbnailUrl,
    avatar: thumbnailUrl,
    category: merged.category || merged.content_niche_category || 'lifestyle',
    country: merged.country || merged.state_ut || merged.state || 'IN',
    state: merged.state_ut || merged.state || merged.country || 'India',
    tier,
    bio: merged.description || merged.bio || 'Verified YouTube creator indexed in InfluenceAI.',
    platform: merged.primary_platform || merged.platform || 'YouTube',
    primaryPlatform: merged.primary_platform || merged.platform || 'YouTube',
    subscriber_count: subscribers,
    subscribers,
    view_count: viewCount,
    avgViews: merged.avg_views || merged.avgViews || Math.round(viewCount / 50),
    engagement_rate: rawEngRate <= 1 ? rawEngRate : Number((rawEngRate / 100).toFixed(6)),
    engagementRate: engRatePercent,
    engagement_score: merged.engagement_score ?? (merged.engagementScore ? merged.engagementScore / 100 : 0.78),
    recommendation_score: merged.recommendation_score ?? (merged.finalScore ? merged.finalScore / 100 : 0.82),
    reasons: Array.isArray(merged.reasons) && merged.reasons.length > 0
      ? merged.reasons
      : [
          `Matches campaign category: ${merged.category || merged.content_niche_category || 'lifestyle'}`,
          `Verified ${tier} tier YouTube channel (${subscribers.toLocaleString('en-IN')} subscribers)`
        ],
    audienceMatch: merged.audienceMatch || 88,
    engagementScore: merged.engagementScore || Math.round((merged.engagement_score || 0.78) * 100),
    graphScore: merged.graph_score || merged.graphScore || 85,
    finalScore: merged.finalScore || Math.round((merged.recommendation_score || 0.82) * 100),
    estimatedCost,
    priceRates: merged.priceRates || {
      starting: estimatedCost,
      dedicatedVideo: estimatedCost,
      shortIntegration: Math.round(estimatedCost * 0.6)
    },
    audienceGender: merged.audienceGender || { male: 54, female: 46 },
    audienceAge: merged.audienceAge || { '18-24': 38, '25-34': 42, '35-44': 14, '45+': 6 },
    topCities: merged.topCities || ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad'],
    language: merged.language || 'English & Hindi'
  };
};

export const influencerService = {
  getInfluencers: async () => {
    try {
      const response = await api.get('/influencers');
      if (response.data && response.data.success && Array.isArray(response.data.influencers) && response.data.influencers.length > 0) {
        return response.data.influencers.map(normalizeInfluencer);
      }
    } catch (err) {
      console.warn('Backend getInfluencers API unavailable, fallback to local:', err.message);
    }
    return mockInfluencers.map(normalizeInfluencer);
  },

  getInfluencerById: async (id) => {
    try {
      const response = await api.get(`/influencers/${id}`);
      if (response.data && response.data.success && response.data.influencer) {
        return normalizeInfluencer(response.data.influencer);
      }
    } catch (err) {
      console.warn('Backend getInfluencerById API unavailable, checking local cache:', err.message);
    }
    const cached = getCachedRecommendedChannel(id);
    if (cached) return normalizeInfluencer(cached);
    const localFound = mockInfluencers.find((i) => i.id === id);
    return localFound ? normalizeInfluencer(localFound) : null;
  },

  updateProfile: async (profileData) => {
    const user = authService.getCurrentUser();
    if (!user?.userId) throw new Error('User must be logged in to update profile');

    try {
      const response = await api.put('/influencers/profile', {
        userId: user.userId,
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
        console.log('Influencer profile updated in Supabase:', response.data.influencer);
      }
    } catch (err) {
      console.warn('Backend updateProfile API error:', err.message);
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
    if (!user?.userId) return [];
    const userId = user.userId;

    try {
      const response = await api.get(`/influencers/saved/${userId}`);
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.savedIds)) {
          localStorage.setItem(getSavedKey(), JSON.stringify(response.data.savedIds.map(String)));
        }
        if (Array.isArray(response.data.savedInfluencers) && response.data.savedInfluencers.length > 0) {
          return response.data.savedInfluencers.map(normalizeInfluencer);
        }
        if (Array.isArray(response.data.savedIds) && response.data.savedIds.length > 0) {
          const resolved = await Promise.all(
            response.data.savedIds.map((sid) => influencerService.getInfluencerById(sid.toString()))
          );
          return resolved.filter(Boolean);
        }
        return [];
      }
    } catch (err) {
      console.warn('Backend getSavedInfluencers error:', err.message);
    }
    const savedIds = getSavedIdsFromStorage();
    const resolved = await Promise.all(savedIds.map((sid) => influencerService.getInfluencerById(sid.toString())));
    return resolved.filter(Boolean);
  },

  toggleSaveInfluencer: async (id) => {
    const user = authService.getCurrentUser();
    if (!user?.userId) return false;
    const userId = user.userId;
    const strId = id.toString();
    let isSavedNow = false;

    try {
      const response = await api.post('/influencers/save', {
        userId: userId,
        influencerId: strId
      });
      if (response.data && response.data.success) {
        isSavedNow = response.data.isSavedNow;
        let savedIds = getSavedIdsFromStorage();
        if (isSavedNow && !savedIds.includes(strId)) {
          savedIds.push(strId);
        } else if (!isSavedNow) {
          savedIds = savedIds.filter((sid) => sid !== strId);
        }
        localStorage.setItem(getSavedKey(), JSON.stringify(savedIds));
      }
    } catch (err) {
      console.warn('Backend toggleSaveInfluencer error:', err.message);
      let savedIds = getSavedIdsFromStorage();
      if (savedIds.includes(strId)) {
        savedIds = savedIds.filter((sid) => sid !== strId);
        isSavedNow = false;
      } else {
        savedIds.push(strId);
        isSavedNow = true;
      }
      localStorage.setItem(getSavedKey(), JSON.stringify(savedIds));
    }

    window.dispatchEvent(new Event('influenceai_saved_changed'));
    return isSavedNow;
  },

  isInfluencerSaved: (id) => {
    const savedIds = getSavedIdsFromStorage();
    return savedIds.includes((id || '').toString());
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
          date: new Date(inq.created_at || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: inq.status || 'New',
          ...inquiryData
        };
      }
    } catch (err) {
      console.warn('Backend sendInquiry API error:', err.message);
    }

    if (!created) {
      const list = getInquiriesFromStorage();
      created = {
        id: `inq-${Date.now()}`,
        campaignName: inquiryData.campaignName || 'Campaign Collaboration Proposal',
        companyName: inquiryData.companyName || user?.brandName || user?.name || 'Brand Partner',
        deliverables: inquiryData.deliverables || ['60s Video Integration', 'Instagram Story Cross-post'],
        budgetStr: inquiryData.budget ? `₹${Number(inquiryData.budget).toLocaleString('en-IN')}` : '₹1,00,000',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'New',
        ...inquiryData
      };
      list.unshift(created);
      localStorage.setItem(getInqKey(), JSON.stringify(list));
    }

    window.dispatchEvent(new Event('influenceai_inquiries_changed'));
    return created;
  },

  getInquiries: async () => {
    const user = authService.getCurrentUser();
    if (!user?.userId) return [];

    try {
      const role = authService.getCurrentRole() || user.role;
      const queryParam = role === 'Company'
        ? `?companyId=${encodeURIComponent(user.userId)}`
        : `?influencerId=${encodeURIComponent(user.userId)}`;

      const response = await api.get(`/influencers/inquiries${queryParam}`);
      if (response.data && response.data.success && Array.isArray(response.data.inquiries)) {
        return response.data.inquiries.map((inq) => ({
          id: inq.id,
          companyId: inq.company_id,
          influencerId: inq.influencer_id,
          campaignId: inq.campaign_id || '',
          campaignName: inq.campaign_name || 'Collaboration Proposal',
          companyName: inq.company_name || 'Brand Partner',
          deliverables: Array.isArray(inq.deliverables) ? inq.deliverables : ['Video Integration'],
          message: inq.message || '',
          budget: inq.bid_amount,
          budgetStr: inq.bid_amount ? `₹${Number(inq.bid_amount).toLocaleString('en-IN')}` : '₹0',
          status: inq.status || 'New',
          date: new Date(inq.created_at || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }));
      }
    } catch (err) {
      console.warn('Backend getInquiries API error:', err.message);
    }
    return getInquiriesFromStorage();
  },

  updateInquiryStatus: async (id, status) => {
    try {
      await api.patch(`/influencers/inquiry/${id}`, { status });
    } catch (err) {
      console.warn('Backend updateInquiryStatus error:', err.message);
    }
    const list = getInquiriesFromStorage();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(getInqKey(), JSON.stringify(list));
    }
    window.dispatchEvent(new Event('influenceai_inquiries_changed'));
    return true;
  }
};
