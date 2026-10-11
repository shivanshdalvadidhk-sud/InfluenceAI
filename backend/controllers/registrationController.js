const supabase = require("../config/supabase");

// Helper to find existing Supabase Auth user by email
const findAuthUserByEmail = async (email) => {
  try {
    const clean = String(email).trim().toLowerCase();
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (data && Array.isArray(data.users)) {
      return data.users.find((u) => (u.email || "").toLowerCase() === clean) || null;
    }
  } catch (err) {
    console.warn("findAuthUserByEmail error:", err.message);
  }
  return null;
};

// Check if an email is already registered as a Brand, Influencer, or Auth User
const checkEmailAlreadyRegistered = async (cleanEmail) => {
  const { data: existingBrands } = await supabase
    .from("brands")
    .select("id, user_id, email")
    .ilike("email", cleanEmail)
    .limit(1);

  if (existingBrands && existingBrands.length > 0) {
    return true;
  }

  const { data: existingInfluencers } = await supabase
    .from("influencers")
    .select("id, user_id, email")
    .ilike("email", cleanEmail)
    .limit(1);

  if (existingInfluencers && existingInfluencers.length > 0) {
    return true;
  }

  const existingAuthUser = await findAuthUserByEmail(cleanEmail);
  if (existingAuthUser) {
    return true;
  }

  return false;
};

// BRAND REGISTRATION
const registerBrand = async (req, res) => {
  try {
    const {
      companyName,
      brandName,
      industryCategory,
      brandWebsite,
      headquartersCity,
      stateUT,
      businessEmail,
      password,
      termsAccepted
    } = req.body;

    if (!businessEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Business email and password are required"
      });
    }

    const cleanEmail = String(businessEmail).trim().toLowerCase();

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const resolvedCompanyName = String(companyName || "").trim();
    const resolvedCity = String(headquartersCity || "Bengaluru").trim();
    const resolvedState = String(stateUT || "Karnataka").trim();

    if (!resolvedCompanyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required"
      });
    }

    if (termsAccepted === false) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Privacy Policy"
      });
    }

    // Strictly deny if email is already registered (in brands, influencers, or auth)
    const alreadyRegistered = await checkEmailAlreadyRegistered(cleanEmail);
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Signup denied — please sign in with your existing account or use a different email."
      });
    }

    // Step 1: Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true
    });

    if (authError || !authData?.user?.id) {
      return res.status(400).json({
        success: false,
        message: authError?.message || "Failed to create authentication account"
      });
    }

    const userId = authData.user.id;

    // Step 2: Upsert into Profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        account_type: "brand"
      });

    if (profileError) {
      console.error("Brand Profile Insert Error:", profileError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        message: `Database profile error: ${profileError.message}`
      });
    }

    // Step 3: Insert into Brands table
    const cleanWebsite = brandWebsite ? String(brandWebsite).trim() : null;
    const { error: brandError } = await supabase
      .from("brands")
      .insert({
        user_id: userId,
        email: cleanEmail,
        company_name: resolvedCompanyName,
        brand_name: String(brandName || resolvedCompanyName).trim(),
        industry_category: industryCategory || "Fashion",
        brand_website: cleanWebsite || null,
        headquarters_city: resolvedCity,
        state_ut: resolvedState,
        terms_accepted: true
      });

    if (brandError) {
      console.error("Brand Table Insert Error:", brandError);
      await supabase.from("profiles").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        message: `Database brand record error: ${brandError.message}`
      });
    }

    return res.status(201).json({
      success: true,
      message: "Brand registered successfully!",
      userId: userId
    });
  } catch (error) {
    console.error("Brand Registration Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during brand registration"
    });
  }
};

// INFLUENCER REGISTRATION
const registerInfluencer = async (req, res) => {
  try {
    const {
      fullName,
      creatorName,
      youtubeHandle,
      contentNicheCategory,
      stateUT,
      businessEmail,
      password,
      termsAccepted
    } = req.body;

    if (!businessEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Business email and password are required"
      });
    }

    const cleanEmail = String(businessEmail).trim().toLowerCase();

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    if (!fullName || !creatorName || !youtubeHandle || !contentNicheCategory || !stateUT) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required creator fields"
      });
    }

    if (termsAccepted === false) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Privacy Policy"
      });
    }

    // Strictly deny if email is already registered (in brands, influencers, or auth)
    const alreadyRegistered = await checkEmailAlreadyRegistered(cleanEmail);
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Signup denied — please sign in with your existing account or use a different email."
      });
    }

    // Step 1: Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true
    });

    if (authError || !authData?.user?.id) {
      return res.status(400).json({
        success: false,
        message: authError?.message || "Failed to create authentication account"
      });
    }

    const userId = authData.user.id;

    // Step 2: Upsert into Profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        account_type: "influencer"
      });

    if (profileError) {
      console.error("Influencer Profile Insert Error:", profileError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        message: `Database profile error: ${profileError.message}`
      });
    }

    // Step 3: Insert into Influencers table
    const { error: influencerError } = await supabase
      .from("influencers")
      .insert({
        user_id: userId,
        email: cleanEmail,
        full_name: String(fullName).trim(),
        creator_name: String(creatorName).trim(),
        youtube_handle: String(youtubeHandle).trim(),
        content_niche_category: contentNicheCategory,
        state_ut: stateUT,
        terms_accepted: true
      });

    if (influencerError) {
      console.error("Influencer Table Insert Error:", influencerError);
      await supabase.from("profiles").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        message: `Database creator record error: ${influencerError.message}`
      });
    }

    return res.status(201).json({
      success: true,
      message: "Influencer registered successfully!",
      userId: userId
    });
  } catch (error) {
    console.error("Influencer Registration Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during influencer registration"
    });
  }
};

module.exports = {
  registerBrand,
  registerInfluencer
};