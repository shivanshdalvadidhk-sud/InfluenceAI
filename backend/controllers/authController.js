const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const { sendOTPEmail } = require('../services/emailService');

// In-memory OTP storage: email.toLowerCase() -> { code: '123456', expiresAt: timestamp }
const otpStore = new Map();

// Create a stateless auth client so signInWithPassword never mutates the shared service-role client
const createStatelessAuthClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

// ======================================================
// LOGIN USER (STRICT AUTHORIZATION FOR REGISTERED USERS ONLY)
// ======================================================
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const targetAccountType = role === 'Company' || role === 'brand' ? 'brand' : 'influencer';

    // 1. Verify email & password with Supabase Auth
    const authClient = createStatelessAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });

    if (authError || !authData || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Only registered users can sign in. Please sign up first.'
      });
    }

    const authUserId = authData.user.id;
    const metadataRole = authData.user.user_metadata?.role; // 'brand' or 'influencer'

    // 2. Automatically detect account type (Brand or Influencer)
    let detectedAccountType = null;
    if (metadataRole === 'brand' || role === 'Company' || role === 'brand') {
      detectedAccountType = 'brand';
    } else if (metadataRole === 'influencer' || role === 'Influencer' || role === 'influencer') {
      detectedAccountType = 'influencer';
    }

    // Check profiles table if still unknown
    if (!detectedAccountType) {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', authUserId)
        .maybeSingle();

      if (profileRow?.account_type) {
        detectedAccountType = profileRow.account_type;
      }
    }

    // Check brands table
    let brandData = null;
    if (detectedAccountType === 'brand' || !detectedAccountType) {
      const { data: bRows } = await supabase
        .from('brands')
        .select('*')
        .or(`user_id.eq.${authUserId},email.ilike.${cleanEmail}`)
        .limit(1);
      if (bRows && bRows.length > 0) {
        brandData = bRows[0];
        detectedAccountType = 'brand';
      }
    }

    // Check influencers / registered_channels table
    let influencerData = null;
    if (detectedAccountType === 'influencer' || !detectedAccountType) {
      const { data: iRows } = await supabase
        .from('influencers')
        .select('*')
        .or(`user_id.eq.${authUserId},email.ilike.${cleanEmail}`)
        .limit(1);
      if (iRows && iRows.length > 0) {
        influencerData = iRows[0];
        detectedAccountType = 'influencer';
      } else {
        const { data: regRows } = await supabase
          .from('registered_channels')
          .select('*')
          .eq('user_id', authUserId)
          .limit(1);
        if (regRows && regRows.length > 0) {
          detectedAccountType = 'influencer';
        }
      }
    }

    if (detectedAccountType === 'brand') {
      const responseUser = {
        email: cleanEmail,
        role: 'Company',
        name: brandData?.company_name || brandData?.brand_name || authData.user.user_metadata?.brandName || 'Brand Partner',
        brandName: brandData?.brand_name || brandData?.company_name || authData.user.user_metadata?.brandName || 'Brand Partner',
        industry: brandData?.industry_category || 'General',
        city: brandData?.headquarters_city || 'India',
        state: brandData?.state_ut || 'India',
        country: 'India',
        website: brandData?.brand_website || '',
        description: brandData?.description || '',
        established: brandData?.established || '2026',
        userId: brandData?.user_id || authUserId
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: responseUser
      });
    } else {
      // Default to Influencer
      const responseUser = {
        email: cleanEmail,
        role: 'Influencer',
        name: influencerData?.full_name || influencerData?.creator_name || authData.user.user_metadata?.fullName || 'Creator',
        creatorName: influencerData?.creator_name || influencerData?.full_name || authData.user.user_metadata?.creatorName || 'Creator',
        handle: influencerData?.youtube_handle || '@creator',
        category: influencerData?.content_niche_category || 'General',
        state: influencerData?.state_ut || 'India',
        country: 'India',
        bio: influencerData?.bio || '',
        subscribers: Number(influencerData?.subscribers || 0),
        avgViews: Number(influencerData?.avg_views || 0),
        engagementRate: Number(influencerData?.engagement_rate || 0),
        avatar: influencerData?.avatar || '',
        userId: influencerData?.user_id || authUserId
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: responseUser
      });
    }
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// ======================================================
// FORGOT PASSWORD - DISPATCH 6-DIGIT OTP
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Verify user is registered before sending OTP
    const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = usersData?.users?.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address.'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    const emailResult = await sendOTPEmail(cleanEmail, otpCode);

    return res.status(200).json({
      success: true,
      message: `A 6-digit OTP code has been dispatched to ${cleanEmail}. Please check your inbox.`,
      emailResult
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while dispatching OTP code'
    });
  }
};

// ======================================================
// VERIFY 6-DIGIT OTP CODE
// ======================================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email address and 6-digit OTP code are required'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(otpCode).trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must contain exactly 6 digits'
      });
    }

    let isVerified = false;
    const storedRecord = otpStore.get(cleanEmail);
    if (storedRecord) {
      if (Date.now() > storedRecord.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message: 'OTP code has expired. Please request a new code.'
        });
      }

      if (storedRecord.code === cleanCode) {
        isVerified = true;
        otpStore.delete(cleanEmail);
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit OTP code. Please check your email and try again.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP Code verified successfully!',
      email: cleanEmail
    });
  } catch (error) {
    console.error('verifyOTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during OTP verification'
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to reset password'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const targetUser = usersData?.users?.find((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email'
      });
    }

    const { error: adminErr } = await supabase.auth.admin.updateUserById(targetUser.id, {
      password: newPassword
    });

    if (adminErr) {
      return res.status(400).json({
        success: false,
        message: adminErr.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while resetting password'
    });
  }
};

module.exports = {
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword
};