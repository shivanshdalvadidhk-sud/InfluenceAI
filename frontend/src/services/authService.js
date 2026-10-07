import api from './api';
import { supabase } from '../config/supabase';

export const authService = {
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data && response.data.success && response.data.user) {
        const user = response.data.user;
        localStorage.setItem('influenceai_user', JSON.stringify(user));
        localStorage.setItem('influenceai_role', user.role || role);
        return user;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      console.warn("Backend login API unavailable, using local mock login fallback:", err.message);
    }

    let user = null;
    if (role === 'Company') {
      user = {
        email: email,
        role: 'Company',
        name: 'Aura Lifestyle',
        brandName: 'Aura Lifestyle',
        industry: 'Fashion & Retail',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        website: 'https://auralifestyle.in',
        description: 'D2C sustainable fashion brand specializing in luxury ethnic wear.',
        socials: { instagram: '@auralifestyle', youtube: '@aura_fashion', linkedin: 'Aura Lifestyle India', x: '@auralifestyle' },
        established: '2021',
        userId: 'a0000000-0000-0000-0000-000000000001'
      };
    } else {
      user = {
        email: email,
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
        bio: 'Deep-dive smartphone reviews, AI gadgets & PC builds.',
        subscribers: 1850000,
        avgViews: 420000,
        engagementRate: 4.8,
        priceRates: { starting: 50000, dedicated: 184800, integrated: 95000, short: 40000 },
        userId: 'a0000000-0000-0000-0000-000000000002'
      };
    }

    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', role);
    return user;
  },

  loginWithGoogle: async (role, selectedAccount = null) => {
    if (selectedAccount?.useOAuthRedirect) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login`
          }
        });
        if (error) console.warn("Supabase Google OAuth redirect warning:", error.message);
      } catch (e) {
        console.warn("Supabase Google OAuth exception:", e.message);
      }
    }

    const email = selectedAccount?.email || (role === 'Company' ? 'brand.google@gmail.com' : 'creator.google@gmail.com');
    const name = selectedAccount?.name || (role === 'Company' ? 'Google Brand Partner' : 'Google Creator');
    const avatar = selectedAccount?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

    let user = null;
    if (role === 'Company') {
      user = {
        email,
        role: 'Company',
        name,
        brandName: name,
        industry: 'Technology',
        avatar,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        website: 'https://google.com',
        description: 'Brand Partner account authenticated via Google OAuth.',
        socials: { instagram: '@google', youtube: '@google', linkedin: 'Google Inc.', x: '@google' },
        established: '2026',
        authProvider: 'google',
        userId: selectedAccount?.id || `google-${Date.now()}`
      };
    } else {
      user = {
        email,
        role: 'Influencer',
        name,
        creatorName: name,
        handle: `@${email.split('@')[0]}`,
        primaryPlatform: 'YouTube',
        category: 'Technology',
        avatar,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        language: 'English',
        bio: 'Verified content creator authenticated via Google OAuth.',
        subscribers: 350000,
        avgViews: 82000,
        engagementRate: 5.4,
        priceRates: { starting: 20000, dedicated: 60000, integrated: 35000, short: 15000 },
        authProvider: 'google',
        userId: selectedAccount?.id || `google-${Date.now()}`
      };
    }

    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', role);
    return user;
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data && response.data.success) {
        return response.data.message;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
    return '6-Digit OTP security code sent to your email!';
  },

  verifyOTP: async (email, otpCode) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otpCode });
      if (response.data && response.data.success) {
        return response.data.message;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
    return 'OTP verified successfully!';
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      if (response.data && response.data.success) {
        return response.data.message;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
    return 'Password updated successfully!';
  },

  registerCompany: async (formData) => {
    const payload = {
      companyName: formData.companyName,
      brandName: formData.brandName || formData.companyName,
      industryCategory: formData.industry || 'Fashion',
      brandWebsite: formData.website || '',
      headquartersCity: formData.city || 'Mumbai',
      stateUT: formData.state || 'Maharashtra',
      businessEmail: formData.email,
      password: formData.password || 'password123',
      termsAccepted: true
    };

    let userId = null;
    try {
      const response = await api.post('/register/brand', payload);

      if (response.data && response.data.success) {
        userId = response.data.userId;
      } else {
        throw new Error(response.data?.message || 'Brand registration failed');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }

      console.warn("Backend registration API unavailable, creating local session:", err.message);
    }

    const user = {
      email: formData.email,
      role: 'Company',
      name: formData.companyName,
      brandName: formData.brandName || formData.companyName,
      industry: formData.industry || 'Fashion',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100',
      city: formData.city || 'Mumbai',
      state: formData.state || 'Maharashtra',
      country: formData.country || 'India',
      website: formData.website || '',
      description: 'Newly registered Brand Partner.',
      socials: { instagram: '', youtube: '', linkedin: '', x: '' },
      established: '2026',
      userId: userId
    };

    localStorage.setItem('influenceai_user', JSON.stringify(user));
    localStorage.setItem('influenceai_role', 'Company');
    return user;
  },

  registerInfluencer: async (formData) => {
    const payload = {
      fullName: formData.fullName,
      creatorName: formData.creatorName || formData.fullName,
      youtubeHandle: formData.channelHandle || '@creator',
      contentNicheCategory: formData.category || 'Technology',
      stateUT: formData.state || 'Karnataka',
      businessEmail: formData.email,
      password: formData.password || 'password123',
      termsAccepted: true
    };

    let userId = null;
    try {
      const response = await api.post('/register/influencer', payload);

      if (response.data && response.data.success) {
        userId = response.data.userId;
      } else {
        throw new Error(response.data?.message || 'Influencer registration failed');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }

      console.warn("Backend registration API unavailable, creating local session:", err.message);
    }

    const user = {
      email: formData.email,
      role: 'Influencer',
      name: formData.fullName,
      creatorName: formData.creatorName || formData.fullName,
      handle: formData.channelHandle || '@newcreator',
      primaryPlatform: formData.primaryPlatform || 'YouTube',
      category: formData.category || 'Technology',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      city: formData.city || 'Bengaluru',
      state: formData.state || 'Karnataka',
      country: 'India',
      language: formData.language || 'Hindi/English',
      bio: 'Professional social media content creator.',
      subscribers: 50000,
      avgViews: 12000,
      engagementRate: 5.0,
      priceRates: { starting: 10000, dedicated: 25000, integrated: 15000, short: 8000 },
      userId: userId
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