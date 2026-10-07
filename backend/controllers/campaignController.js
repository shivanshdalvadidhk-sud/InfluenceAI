const supabase = require('../config/supabase');

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
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
    const { name, category, budget, description, audienceGender, audienceLanguage, state, companyId, companyName } = req.body;

    if (!name || !category || !budget) {
      return res.status(400).json({ success: false, message: "Name, category, and budget are required" });
    }

    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert({
        company_id: companyId || null,
        name,
        category,
        budget: Number(budget),
        description: description || '',
        audience_gender: audienceGender || 'All',
        audience_language: audienceLanguage || 'English',
        state_ut: state || 'Karnataka',
        status: 'Active'
      })
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
        budget: original.budget,
        description: original.description,
        audience_gender: original.audience_gender,
        audience_language: original.audience_language,
        state_ut: original.state_ut,
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
