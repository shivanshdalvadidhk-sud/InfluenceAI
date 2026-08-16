// InfluenceAI - Authentication Mock Service

export const authService = {
  login: async (email, password, role) => {
    // Simulating API latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    let user = null;
    if (role === 'Company') {
      user = {
        email,
        role: 'Company',
        name: 'Aura Lifestyle',
        brandName: 'Aura Lifestyle',
        industry: 'Fashion',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        website: 'https://auralifestyle.io',
        description: 'D2C sustainable fashion brand specializing in organic streetwear and eco-friendly couture for modern urban youth.',
        socials: { instagram: '@auralifestyle', youtube: '@auralifestyle_yt', linkedin: 'Aura Lifestyle Inc.', x: '@auralifestyle' },
        established: '2023'
      };
    } else {
      user = {
        email,
        role: 'Influencer',
        name: 'Rohan Mehta',
        creatorName: 'Rohan Mehta',
        handle: '@techwithrohan',
        primaryPlatform: 'YouTube',
        category: 'Technology',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        language: 'Hindi/English',
        bio: 'Deep-dive smartphone reviews, AI gadgets & PC builds. High subscriber retention & dedicated video integration.',
        subscribers: 1850000,
        avgViews: 420000,
        engagementRate: 4.8,
        priceRates: { starting: 50000, dedicated: 184800, integrated: 95000, short: 40000 }
      };
    }

    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', role);
    return user;
  },

  registerCompany: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = {
      email: data.email,
      role: 'Company',
      name: data.companyName,
      brandName: data.brandName || data.companyName,
      industry: data.industry || 'Fashion',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100',
      city: data.city || 'Mumbai',
      state: data.state || 'Maharashtra',
      country: data.country || 'India',
      website: data.website || '',
      description: 'Newly registered Brand Partner.',
      socials: { instagram: '', youtube: '', linkedin: '', x: '' },
      established: '2026'
    };
    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', 'Company');
    return user;
  },

  registerInfluencer: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = {
      email: data.email,
      role: 'Influencer',
      name: data.fullName,
      creatorName: data.creatorName || data.fullName,
      handle: data.channelHandle || '@newcreator',
      primaryPlatform: data.primaryPlatform || 'YouTube',
      category: data.category || 'Technology',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      city: data.city || 'Bengaluru',
      state: data.state || 'Karnataka',
      country: 'India',
      language: data.language || 'Hindi/English',
      bio: 'Professional social media content creator.',
      subscribers: 50000,
      avgViews: 12000,
      engagementRate: 5.0,
      priceRates: { starting: 10000, dedicated: 25000, integrated: 15000, short: 8000 }
    };
    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', 'Influencer');
    return user;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('influenceai_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentRole: () => {
    return localStorage.getItem('influenceai_role');
  },

  updateProfile: (updatedUser) => {
    localStorage.setItem('influenceai_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: () => {
    localStorage.removeItem('influenceai_user');
    localStorage.removeItem('influenceai_role');
  },

  isAuthenticated: () => {
    return localStorage.getItem('influenceai_user') !== null;
  }
};
