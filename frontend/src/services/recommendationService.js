// InfluenceAI - AI Recommendation and Match Engine Service
import api from './api';
import { mockInfluencers } from '../data/mockData';
import { authService } from './authService';

const CHANNEL_CACHE_KEY = 'influenceai_rec_channels_cache';

const getHistoryStorageKey = (userId) => {
  const uid = userId || authService.getCurrentUser()?.userId;
  return uid ? `influenceai_rec_history_${uid}` : 'influenceai_rec_history_guest';
};

const getLocalHistory = (userId = null) => {
  try {
    const raw = localStorage.getItem(getHistoryStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

const saveLocalHistoryEntry = (entry) => {
  try {
    const uid = entry.user_id || authService.getCurrentUser()?.userId;
    if (!uid) return;
    const list = getLocalHistory(uid);
    const filtered = list.filter((item) => item.id !== entry.id);
    filtered.unshift(entry);
    localStorage.setItem(getHistoryStorageKey(uid), JSON.stringify(filtered.slice(0, 50)));
  } catch (_) {
    // ignore storage errors
  }
};

export const cacheRecommendedChannels = (recommendations = []) => {
  try {
    const raw = localStorage.getItem(CHANNEL_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    recommendations.forEach((rec) => {
      const key = (rec.channel_id || rec.id || '').toString();
      if (key) {
        cache[key] = rec;
      }
    });
    localStorage.setItem(CHANNEL_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {
    // ignore cache errors
  }
};

export const getCachedRecommendedChannel = (id) => {
  try {
    const raw = localStorage.getItem(CHANNEL_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    return cache[id] || null;
  } catch (_) {
    return null;
  }
};

// Basic list of keywords to compute fallback mock similarity
const keywordMapping = {
  fashion: ['fashion', 'couture', 'wedding', 'wear', 'design', 'style', 'dress', 'apparel', 'beauty', 'traditional', 'saree', 'makeup', 'model'],
  beauty: ['beauty', 'skincare', 'makeup', 'cosmetics', 'glow', 'serum', 'hair', 'lipstick', 'grooming', 'routine'],
  fitness: ['fit', 'workout', 'diet', 'nutrition', 'wellness', 'supplement', 'training', 'healthy', 'gym', 'activewear', 'exercise', 'yoga'],
  health: ['health', 'medical', 'wellness', 'mental', 'holistic', 'ayurveda', 'care', 'nutrition', 'doctor', 'lifestyle'],
  food: ['food', 'cook', 'recipe', 'street food', 'dessert', 'restaurant', 'stall', 'cafe', 'chef', 'kitchen', 'baking'],
  travel: ['travel', 'trek', 'backpack', 'himalayan', 'trip', 'explore', 'waterfall', 'heritage', 'tourism', 'vlog', 'hotel'],
  finance: ['finance', 'invest', 'stock', 'tax', 'crypto', 'wealth', 'money', 'saving', 'equity', 'ipo', 'budget', 'mutual fund'],
  gaming: ['game', 'gaming', 'esports', 'play', 'shooter', 'stream', 'console', 'rig', 'hardware', 'roleplay', 'rpg', 'minecraft', 'gta'],
  lifestyle: ['lifestyle', 'vlog', 'decor', 'routine', 'morning', 'aesthetic', 'campus', 'study', 'book', 'productivity', 'daily'],
  parenting: ['parenting', 'mom', 'dad', 'baby', 'kids', 'family', 'toddler', 'childcare', 'pregnancy', 'motherhood'],
  automobile: ['car', 'bike', 'automobile', 'ev', 'scooter', 'suv', 'motor', 'test drive', 'review', 'vehicle', 'sedan']
};

export const AI_ENGINE_CATEGORIES = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'fitness', label: 'Fitness & Workout' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'food', label: 'Food & Culinary' },
  { value: 'travel', label: 'Travel & Adventure' },
  { value: 'lifestyle', label: 'Lifestyle & Vlogs' },
  { value: 'finance', label: 'Finance & Investing' },
  { value: 'gaming', label: 'Gaming & Esports' },
  { value: 'parenting', label: 'Parenting & Family' },
  { value: 'automobile', label: 'Automobile & EVs' }
];

export const AI_CAMPAIGN_GOALS = [
  { value: 'awareness', label: 'Awareness (Maximize Reach & Subscribers)' },
  { value: 'engagement', label: 'Engagement (Maximize Likes, Comments & Community)' },
  { value: 'conversions', label: 'Conversions (Balanced Content Fit & Engagement)' }
];

export const AI_TARGET_COUNTRIES = [
  { value: 'India', label: 'India (IN)' },
  { value: '', label: 'Global (All Countries)' },
  { value: 'US', label: 'United States (US)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'AU', label: 'Australia (AU)' }
];

export const recommendationService = {
  getRecommendations: async (campaignData = {}) => {
    const user = authService.getCurrentUser();
    const payload = {
      category: (campaignData.category || 'fashion').toString().trim().toLowerCase(),
      campaign_description:
        campaignData.campaign_description ||
        campaignData.description ||
        `Influencer marketing campaign for ${campaignData.name || campaignData.category || 'brand'} targeting high engagement audiences.`,
      budget_inr: Number(campaignData.budget_inr || campaignData.budget || 100000),
      target_country:
        campaignData.target_country !== undefined
          ? campaignData.target_country
          : campaignData.targetCountry !== undefined
          ? campaignData.targetCountry
          : 'India',
      campaign_goal: (campaignData.campaign_goal || campaignData.campaignGoal || 'awareness').toLowerCase(),
      top_n: Number(campaignData.top_n || campaignData.topN || 10),
      strict_category:
        campaignData.strict_category !== undefined
          ? Boolean(campaignData.strict_category)
          : campaignData.strictCategory !== undefined
          ? Boolean(campaignData.strictCategory)
          : true,
      campaignId: campaignData.id || campaignData.campaignId || null,
      campaignName: campaignData.name || campaignData.campaignName || null,
      userId: campaignData.user_id || campaignData.userId || user?.userId || null
    };

    try {
      const response = await api.post('/recommendations/match', payload);

      if (response.data && response.data.success && Array.isArray(response.data.recommendations)) {
        const recs = response.data.recommendations;
        cacheRecommendedChannels(recs);

        saveLocalHistoryEntry({
          id: response.data.history_id || `hist-${Date.now()}`,
          user_id: payload.userId,
          campaign_id: payload.campaignId,
          campaign_name: payload.campaignName || `${payload.category.toUpperCase()} Campaign`,
          category: payload.category,
          campaign_description: payload.campaign_description,
          budget_inr: payload.budget_inr,
          target_country: payload.target_country,
          campaign_goal: payload.campaign_goal,
          top_n: payload.top_n,
          strict_category: payload.strict_category,
          recommendations: recs,
          created_at: new Date().toISOString()
        });

        window.dispatchEvent(new Event('influenceai_recommendations_updated'));
        return recs;
      }

      return [];
    } catch (err) {
      console.error('Error fetching AI recommendations from backend:', err);
      return recommendationService.getRecommendationsFallback(payload);
    }
  },

  getRecommendationsFallback: async (campaignData = {}) => {
    const category = (campaignData.category || 'fashion').toLowerCase();
    const budget = Number(campaignData.budget_inr || campaignData.budget || 100000);
    const description = (campaignData.campaign_description || campaignData.description || '').toLowerCase();
    const keywords = keywordMapping[category] || [];

    const results = mockInfluencers.map((creator, idx) => {
      let semSim = 0.62;
      if ((creator.category || '').toLowerCase() === category) {
        semSim += 0.18;
      }
      keywords.forEach((kw) => {
        if (description.includes(kw) || (creator.bio || '').toLowerCase().includes(kw)) {
          semSim += 0.04;
        }
      });
      semSim = Math.min(0.96, Number(semSim.toFixed(4)));
      const engScore = Math.min(0.95, Number(((creator.engagementRate || 4.5) / 10).toFixed(4)));
      const recScore = Number((semSim * 0.6 + engScore * 0.4).toFixed(4));
      const subscribers = Number(creator.subscribers || 50000);
      const tier = subscribers < 10000 ? 'nano' : subscribers < 100000 ? 'micro' : subscribers <= 500000 ? 'mid' : 'macro';

      return {
        ...creator,
        rank: idx + 1,
        channel_id: creator.id,
        channel_name: creator.name,
        channel_url: creator.channel_url || `https://www.youtube.com/${creator.handle || '@youtube'}`,
        thumbnail_url: creator.avatar,
        category: creator.category.toLowerCase(),
        country: 'IN',
        tier,
        subscriber_count: subscribers,
        view_count: (creator.avgViews || 25000) * 45,
        engagement_rate: Number(((creator.engagementRate || 4.5) / 100).toFixed(6)),
        semantic_similarity: semSim,
        engagement_score: engScore,
        recommendation_score: recScore,
        reasons: [
          `Matches campaign category: ${category}`,
          `Within budget (₹${budget.toLocaleString('en-IN')}) — ${tier} tier`
        ],
        engagementScore: Math.round(engScore * 100),
        finalScore: Math.round(recScore * 100)
      };
    });

    const sorted = results.sort((a, b) => b.recommendation_score - a.recommendation_score);
    cacheRecommendedChannels(sorted);
    return sorted;
  },

  getAllRecommendationHistory: async (userId = null) => {
    const uid = userId || authService.getCurrentUser()?.userId;
    if (!uid) return [];
    try {
      const response = await api.get(`/recommendations/history?userId=${encodeURIComponent(uid)}`);
      if (response.data && response.data.success && Array.isArray(response.data.history)) {
        response.data.history.forEach((h) => {
          if (Array.isArray(h.recommendations)) {
            cacheRecommendedChannels(h.recommendations);
          }
        });
        localStorage.setItem(getHistoryStorageKey(uid), JSON.stringify(response.data.history));
        return response.data.history;
      }
    } catch (err) {
      console.warn('Error fetching recommendation history from API, using user local cache:', err.message);
    }
    return getLocalHistory(uid);
  },

  getRecommendationHistory: async (campaignId) => {
    const uid = authService.getCurrentUser()?.userId;
    if (!campaignId) return recommendationService.getAllRecommendationHistory(uid);
    try {
      const query = uid ? `?userId=${encodeURIComponent(uid)}` : '';
      const response = await api.get(`/recommendations/history/${campaignId}${query}`);
      if (response.data && response.data.success && Array.isArray(response.data.history)) {
        response.data.history.forEach((h) => {
          if (Array.isArray(h.recommendations)) {
            cacheRecommendedChannels(h.recommendations);
          }
        });
        return response.data.history;
      }
    } catch (err) {
      console.warn('Error fetching campaign recommendation history:', err.message);
    }
    return getLocalHistory(uid).filter((item) => item.campaign_id === campaignId);
  },

  deleteRecommendationHistory: async (historyId) => {
    const uid = authService.getCurrentUser()?.userId;
    try {
      await api.delete(`/recommendations/history/${historyId}`);
    } catch (err) {
      console.warn('Error deleting recommendation history on backend:', err.message);
    }
    if (uid) {
      const list = getLocalHistory(uid).filter((item) => item.id !== historyId);
      localStorage.setItem(getHistoryStorageKey(uid), JSON.stringify(list));
    }
    return true;
  }
};
