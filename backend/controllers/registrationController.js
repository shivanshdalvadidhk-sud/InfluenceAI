const supabase = require("../config/supabase");
const { randomUUID } = require("crypto");

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

    if (!companyName || !headquartersCity || !stateUT) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required brand fields"
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Privacy Policy"
      });
    }

    // Step 1: Create Supabase Auth User
    let userId = randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: businessEmail,
      password: password,
      email_confirm: true
    });

    if (authData && authData.user && authData.user.id) {
      userId = authData.user.id;
    } else if (authError) {
      console.warn("Supabase Auth admin.createUser warning:", authError.message);
    }

    // Step 2: Insert into Profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        account_type: "brand"
      });

    if (profileError) {
      console.error("Brand Profile Insert Error:", profileError);
      return res.status(400).json({
        success: false,
        message: `Database profile error: ${profileError.message}`
      });
    }

    // Step 3: Insert into Brands table with email
    const { error: brandError } = await supabase
      .from("brands")
      .insert({
        user_id: userId,
        email: businessEmail,
        company_name: companyName,
        brand_name: brandName || companyName,
        industry_category: industryCategory || "General",
        brand_website: brandWebsite || null,
        headquarters_city: headquartersCity,
        state_ut: stateUT,
        terms_accepted: termsAccepted
      });

    if (brandError) {
      console.error("Brand Table Insert Error:", brandError);
      return res.status(400).json({
        success: false,
        message: `Database brand record error: ${brandError.message}`
      });
    }

    return res.status(201).json({
      success: true,
      message: "Brand registered successfully and saved in Supabase database!",
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

    if (!fullName || !creatorName || !youtubeHandle || !contentNicheCategory || !stateUT) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required creator fields"
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the Terms and Privacy Policy"
      });
    }

    // Step 1: Create Supabase Auth User
    let userId = randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: businessEmail,
      password: password,
      email_confirm: true
    });

    if (authData && authData.user && authData.user.id) {
      userId = authData.user.id;
    } else if (authError) {
      console.warn("Supabase Auth admin.createUser warning:", authError.message);
    }

    // Step 2: Insert into Profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        account_type: "influencer"
      });

    if (profileError) {
      console.error("Influencer Profile Insert Error:", profileError);
      return res.status(400).json({
        success: false,
        message: `Database profile error: ${profileError.message}`
      });
    }

    // Step 3: Insert into Influencers table with email
    const { error: influencerError } = await supabase
      .from("influencers")
      .insert({
        user_id: userId,
        email: businessEmail,
        full_name: fullName,
        creator_name: creatorName,
        youtube_handle: youtubeHandle,
        content_niche_category: contentNicheCategory,
        state_ut: stateUT,
        terms_accepted: termsAccepted
      });

    if (influencerError) {
      console.error("Influencer Table Insert Error:", influencerError);
      return res.status(400).json({
        success: false,
        message: `Database creator record error: ${influencerError.message}`
      });
    }

    return res.status(201).json({
      success: true,
      message: "Influencer registered successfully and saved in Supabase database!",
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