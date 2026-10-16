import api from './api';
import { supabase } from '../lib/supabaseClient';

export const authService = {
  login: async (email, password, role = null) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    try {
      // 1. Authenticate with Supabase Auth (establishes client JWT and session)
      const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (supaErr) {
        throw new Error(supaErr.message);
      }

      if (supaAuth.session) {
        localStorage.setItem('influenceai_token', supaAuth.session.access_token);
      }

      // 2. Clear any legacy unscoped mock caches on fresh login
      localStorage.removeItem('influenceai_campaigns');
      localStorage.removeItem('influenceai_rec_history');
      localStorage.removeItem('influenceai_saved');
      localStorage.removeItem('influenceai_inquiries');

      // 3. Fetch profile record from backend
      let user = null;
      try {
        const response = await api.post('/auth/login', { email: cleanEmail, password, role });
        if (response.data && response.data.success && response.data.user) {
          user = response.data.user;
        }
      } catch (backendErr) {
        console.warn('Backend profile sync notice:', backendErr.message);
      }

      if (!user) {
        const supaUser = supaAuth.user;
        const metaRole = supaUser.user_metadata?.role;
        const normalizedRole = (metaRole === 'influencer' || role === 'Influencer') ? 'Influencer' : 'Company';
        user = {
          email: supaUser.email,
          role: normalizedRole,
          name: supaUser.user_metadata?.brandName || supaUser.user_metadata?.fullName || (normalizedRole === 'Company' ? 'Brand Partner' : 'Creator'),
          userId: supaUser.id,
          id: supaUser.id,
        };
      }

      // Ensure userId matches Supabase UID
      if (supaAuth.user?.id) {
        user.userId = supaAuth.user.id;
      }

      localStorage.setItem('influenceai_user', JSON.stringify(user));
      localStorage.setItem('influenceai_role', user.role || role);
      return user;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Unable to sign in. Please verify your credentials or register an account.');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data && response.data.success) {
        return response.data.message;
      }
      throw new Error(response.data?.message || 'Failed to send OTP.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  },

  verifyOTP: async (email, otpCode) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otpCode });
      if (response.data && response.data.success) {
        return response.data.message;
      }
      throw new Error(response.data?.message || 'OTP verification failed.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      if (response.data && response.data.success) {
        return response.data.message;
      }
      throw new Error(response.data?.message || 'Password reset failed.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  },

  registerCompany: async (formData) => {
    const cleanEmail = String(formData.email || '').trim().toLowerCase();
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email && currentUser.email.trim().toLowerCase() === cleanEmail) {
      throw new Error('This email is already logged in and registered. Signup denied — please use a different email address.');
    }

    // 1. Sign up in Supabase Auth with metadata
    try {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            role: 'brand',
            brandName: formData.brandName || formData.companyName,
            display_role: 'Company'
          }
        }
      });
      if (supaErr && !supaErr.message.includes('already registered')) {
        console.warn('Supabase Auth signUp notice:', supaErr.message);
      }
      if (supaAuth?.session?.access_token) {
        localStorage.setItem('influenceai_token', supaAuth.session.access_token);
      }
    } catch (authErr) {
      console.warn('Supabase auth signup notice:', authErr.message);
    }

    const payload = {
      companyName: formData.companyName,
      brandName: formData.brandName || formData.companyName,
      industryCategory: formData.industry || 'Fashion',
      brandWebsite: formData.website || '',
      headquartersCity: formData.city || 'Bengaluru',
      stateUT: formData.state || 'Karnataka',
      businessEmail: cleanEmail,
      password: formData.password,
      termsAccepted: true
    };

    try {
      const response = await api.post('/register/brand', payload);
      if (!response.data || !response.data.success || !response.data.userId) {
        throw new Error(response.data?.message || 'Brand registration failed.');
      }

      const userId = response.data.userId;
      const user = {
        email: cleanEmail,
        role: 'Company',
        name: formData.companyName,
        brandName: formData.brandName || formData.companyName,
        industry: formData.industry || 'Fashion',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.brandName || formData.companyName)}&background=6366f1&color=fff&size=200`,
        city: formData.city || 'Bengaluru',
        state: formData.state || 'Karnataka',
        country: formData.country || 'India',
        website: formData.website || '',
        description: `${formData.brandName || formData.companyName} (${formData.industry || 'Brand'})`,
        socials: { instagram: '', youtube: '', linkedin: '', x: '' },
        established: new Date().getFullYear().toString(),
        userId
      };

      localStorage.removeItem('influenceai_campaigns');
      localStorage.removeItem('influenceai_rec_history');
      localStorage.removeItem('influenceai_saved');
      localStorage.removeItem('influenceai_inquiries');

      localStorage.setItem('influenceai_user', JSON.stringify(user));
      localStorage.setItem('influenceai_role', 'Company');
      return user;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Registration failed. Please try again.');
    }
  },

  registerInfluencer: async (formData) => {
    const cleanEmail = String(formData.email || '').trim().toLowerCase();
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email && currentUser.email.trim().toLowerCase() === cleanEmail) {
      throw new Error('This email is already logged in and registered. Signup denied — please use a different email address.');
    }

    // 1. Sign up in Supabase Auth with metadata
    try {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            role: 'influencer',
            fullName: formData.fullName,
            display_role: 'Influencer',
            avatar: formData.avatar || ''
          }
        }
      });
      if (supaErr && !supaErr.message.includes('already registered')) {
        console.warn('Supabase Auth signUp notice:', supaErr.message);
      }
      if (supaAuth?.session?.access_token) {
        localStorage.setItem('influenceai_token', supaAuth.session.access_token);
      }
    } catch (authErr) {
      console.warn('Supabase auth signup notice:', authErr.message);
    }

    const payload = {
      fullName: formData.fullName,
      creatorName: formData.creatorName || formData.fullName,
      youtubeHandle: formData.channelHandle || '@creator',
      contentNicheCategory: formData.category || 'Technology',
      stateUT: formData.state || 'Karnataka',
      businessEmail: cleanEmail,
      password: formData.password,
      termsAccepted: true,
      avatar: formData.avatar || null,
      subscribers: formData.subscribers || 0,
      avgViews: formData.avgViews || 0
    };

    try {
      const response = await api.post('/register/influencer', payload);
      if (!response.data || !response.data.success || !response.data.userId) {
        throw new Error(response.data?.message || 'Influencer registration failed.');
      }

      const userId = response.data.userId;
      const avatarUrl = formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.creatorName || formData.fullName)}&background=6366f1&color=fff&size=200`;
      const user = {
        email: cleanEmail,
        role: 'Influencer',
        name: formData.fullName,
        creatorName: formData.creatorName || formData.fullName,
        handle: formData.channelHandle || '@creator',
        primaryPlatform: formData.primaryPlatform || 'YouTube',
        category: formData.category || 'Technology',
        avatar: avatarUrl,
        thumbnail_url: avatarUrl,
        city: formData.city || '',
        state: formData.state || 'Karnataka',
        country: 'India',
        language: formData.language || 'English & Hindi',
        bio: formData.description || '',
        subscribers: Number(formData.subscribers || 0),
        avgViews: Number(formData.avgViews || 0),
        engagementRate: 0,
        priceRates: { starting: 0, dedicated: 0, integrated: 0, short: 0 },
        userId
      };

      localStorage.removeItem('influenceai_campaigns');
      localStorage.removeItem('influenceai_rec_history');
      localStorage.removeItem('influenceai_saved');
      localStorage.removeItem('influenceai_inquiries');

      localStorage.setItem('influenceai_user', JSON.stringify(user));
      localStorage.setItem('influenceai_role', 'Influencer');
      return user;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Registration failed. Please try again.');
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('influenceai_user');
      if (!userStr) return null;
      const parsed = JSON.parse(userStr);
      if (
        !parsed.userId ||
        parsed.userId === 'a0000000-0000-0000-0000-000000000001' ||
        parsed.userId === 'a0000000-0000-0000-0000-000000000002' ||
        String(parsed.userId).startsWith('google-')
      ) {
        localStorage.removeItem('influenceai_user');
        localStorage.removeItem('influenceai_role');
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  },

  getCurrentRole: () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    return localStorage.getItem('influenceai_role') || user.role;
  },

  updateProfile: (updatedUser) => {
    localStorage.setItem('influenceai_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e.message);
    }
    localStorage.removeItem('influenceai_user');
    localStorage.removeItem('influenceai_role');
    localStorage.removeItem('influenceai_token');
    localStorage.removeItem('influenceai_campaigns');
    localStorage.removeItem('influenceai_rec_history');
    localStorage.removeItem('influenceai_saved');
    localStorage.removeItem('influenceai_inquiries');
  },

  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  }
};

export { buildSafeYoutubeUrl } from './influencerService';