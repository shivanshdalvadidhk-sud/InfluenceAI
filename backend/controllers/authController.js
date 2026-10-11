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
    let detailsData = null;

    // 2. Verify registered record exists for the selected role
    if (targetAccountType === 'brand') {
      const { data: byIdRows } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', authUserId)
        .limit(1);

      if (byIdRows && byIdRows.length > 0) {
        detailsData = byIdRows[0];
      } else {
        const { data: byEmailRows } = await supabase
          .from('brands')
          .select('*')
          .ilike('email', cleanEmail)
          .limit(1);
        if (byEmailRows && byEmailRows.length > 0) {
          detailsData = byEmailRows[0];
        }
      }

      if (!detailsData) {
        return res.status(403).json({
          success: false,
          message: 'No registered Brand/Company account found for this email. Please sign up as a Brand first.'
        });
      }

      const responseUser = {
        email: cleanEmail,
        role: 'Company',
        name: detailsData.company_name || detailsData.brand_name,
        brandName: detailsData.brand_name || detailsData.company_name,
        industry: detailsData.industry_category || 'General',
        city: detailsData.headquarters_city || 'India',
        state: detailsData.state_ut || 'India',
        country: 'India',
        website: detailsData.brand_website || '',
        description: detailsData.description || '',
        established: detailsData.established || '2026',
        userId: detailsData.user_id || authUserId
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: responseUser
      });
    } else {
      const { data: byIdRows } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', authUserId)
        .limit(1);

      if (byIdRows && byIdRows.length > 0) {
        detailsData = byIdRows[0];
      } else {
        const { data: byEmailRows } = await supabase
          .from('influencers')
          .select('*')
          .ilike('email', cleanEmail)
          .limit(1);
        if (byEmailRows && byEmailRows.length > 0) {
          detailsData = byEmailRows[0];
        }
      }

      if (!detailsData) {
        return res.status(403).json({
          success: false,
          message: 'No registered Influencer/Creator account found for this email. Please sign up as an Influencer first.'
        });
      }

      const responseUser = {
        email: cleanEmail,
        role: 'Influencer',
        name: detailsData.full_name || detailsData.creator_name,
        creatorName: detailsData.creator_name || detailsData.full_name,
        handle: detailsData.youtube_handle || '@creator',
        category: detailsData.content_niche_category || 'General',
        state: detailsData.state_ut || 'India',
        country: 'India',
        bio: detailsData.bio || '',
        subscribers: Number(detailsData.subscribers || 0),
        avgViews: Number(detailsData.avg_views || 0),
        engagementRate: Number(detailsData.engagement_rate || 0),
        avatar: detailsData.avatar || '',
        userId: detailsData.user_id || authUserId
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