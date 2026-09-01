// InfluenceAI - Influencer Mock Service
import { mockInfluencers, mockInquiries } from '../data/mockData';

const SAVED_KEY = 'influenceai_saved';
const INQ_KEY = 'influenceai_inquiries';

const getSavedIdsFromStorage = () => {
  const data = localStorage.getItem(SAVED_KEY);
  if (!data) return ['rohan-mehta', 'vikramaditya-roy']; // default saved ones
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
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockInfluencers;
  },

  getInfluencerById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockInfluencers.find((i) => i.id === id) || null;
  },

  getSavedInfluencers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const savedIds = getSavedIdsFromStorage();
    return mockInfluencers.filter((i) => savedIds.includes(i.id));
  },

  toggleSaveInfluencer: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    let savedIds = getSavedIdsFromStorage();
    let isSavedNow = false;
    
    if (savedIds.includes(id)) {
      savedIds = savedIds.filter((sid) => sid !== id);
    } else {
      savedIds.push(id);
      isSavedNow = true;
    }
    
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    
    // Trigger custom event so sidebar/nav indicators sync
    window.dispatchEvent(new Event('influenceai_saved_changed'));
    return isSavedNow;
  },

  isInfluencerSaved: (id) => {
    const savedIds = getSavedIdsFromStorage();
    return savedIds.includes(id);
  },

  sendInquiry: async (inquiryData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const list = getInquiriesFromStorage();
    
    const newInq = {
      id: `inq-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'New',
      ...inquiryData
    };
    
    list.unshift(newInq);
    localStorage.setItem(INQ_KEY, JSON.stringify(list));
    
    // Trigger custom event
    window.dispatchEvent(new Event('influenceai_inquiries_changed'));
    return newInq;
  },

  getInquiries: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getInquiriesFromStorage();
  },

  updateInquiryStatus: async (id, status) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const list = getInquiriesFromStorage();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(INQ_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('influenceai_inquiries_changed'));
      return true;
    }
    return false;
  }
};
