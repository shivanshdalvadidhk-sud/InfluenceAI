const supabase = require('../config/supabase');

// Get all campaigns for the authenticated user
const getCampaigns = async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId || companyId === 'undefined' || companyId === 'null') {
      return res.status(200).json({ success: true, campaigns: [] });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('company_id', String(companyId))
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase campaigns query error:", error.message);
      return res.status(200).json({ success: true, campaigns: [] });
    }

    return res.status(200).json({ success: true, campaigns: campaigns || [] });
  } catch (err) {
    console.error("getCampaigns error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single campaign
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    return res.status(200).json({ success: true, campaign });
  } catch (err) {
    console.error("getCampaignById error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const {
      name,
      category,
      budget,
      budget_inr,
      description,
      campaign_description,
      audienceGender,
      audienceLanguage,
      state,
      target_country,
      targetCountry,
      campaign_goal,
      goal,
      top_n,
      topN,
      strict_category,
      strictCategory,
      companyId
    } = req.body;

    const finalBudget = Number(budget_inr ?? budget ?? 50000);
    const finalDescription = campaign_description || description || '';
    const finalCountry = target_country !== undefined ? target_country : (targetCountry || 'India');
    const finalGoal = campaign_goal || goal || 'awareness';
    const finalTopN = Number(top_n ?? topN ?? 10);
    const finalStrict = strict_category !== undefined ? Boolean(strict_category) : (strictCategory !== undefined ? Boolean(strictCategory) : true);

    if (!name || !category || !finalBudget) {
      return res.status(400).json({ success: false, message: "Name, category, and budget are required" });
    }

    const insertData = {
      company_id: (companyId && String(companyId).includes('-') && !String(companyId).startsWith('google-')) ? companyId : null,
      name,
      category: String(category).toLowerCase(),
      budget: finalBudget,
      description: finalDescription,
      audience_gender: audienceGender || 'All',
      audience_language: audienceLanguage || 'English',
      state_ut: state || finalCountry || 'India',
      target_country: finalCountry || 'India',
      campaign_goal: finalGoal,
      top_n: finalTopN,
      strict_category: finalStrict,
      status: 'Active'
    };

    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("createCampaign insert error:", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, campaign: newCampaign });
  } catch (err) {
    console.error("createCampaign error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Duplicate campaign
const duplicateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: original, error: fetchErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !original) {
      return res.status(404).json({ success: false, message: "Original campaign not found" });
    }

    const { data: duplicate, error: dupErr } = await supabase
      .from('campaigns')
      .insert({
        company_id: original.company_id,
        name: original.name + " (Copy)",
        category: original.category || 'fashion',
        budget: original.budget,
        description: original.description,
        audience_gender: original.audience_gender,
        audience_language: original.audience_language,
        state_ut: original.state_ut,
        target_country: original.target_country || 'India',
        campaign_goal: original.campaign_goal || 'awareness',
        top_n: original.top_n || 10,
        strict_category: original.strict_category ?? true,
        recommendations: original.recommendations || [],
        top_match: original.top_match || null,
        status: 'Draft'
      })
      .select()
      .single();

    if (dupErr) {
      return res.status(400).json({ success: false, message: dupErr.message });
    }

    return res.status(201).json({ success: true, campaign: duplicate });
  } catch (err) {
    console.error("duplicateCampaign error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("deleteCampaign error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  duplicateCampaign,
  deleteCampaign
};
