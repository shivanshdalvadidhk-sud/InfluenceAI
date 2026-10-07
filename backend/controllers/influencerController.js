const supabase = require('../config/supabase');

// Get all influencers
const getInfluencers = async (req, res) => {
  try {
    const { data: influencers, error } = await supabase
      .from('influencers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("getInfluencers error:", error.message);
      return res.status(200).json({ success: true, influencers: [] });
    }

    return res.status(200).json({ success: true, influencers: influencers || [] });
  } catch (err) {
    console.error("getInfluencers catch error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single influencer by ID
const getInfluencerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: influencer, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !influencer) {
      return res.status(404).json({ success: false, message: "Influencer not found" });
    }

    return res.status(200).json({ success: true, influencer });
  } catch (err) {
    console.error("getInfluencerById error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update or Create Influencer Profile in Supabase DB (Schema-Safe)
const updateInfluencerProfile = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      creatorName,
      bio,
      state,
      handle,
      subscribers,
      avgViews,
      engagementRate,
      category,
      avatar
    } = req.body;

    const targetUserId = (userId && userId.includes('-')) ? userId : 'a0000000-0000-0000-0000-000000000002';

    // Ensure profile exists in profiles table
    await supabase.from('profiles').upsert({ id: targetUserId, account_type: 'influencer' });

    // Check if influencer record exists for this user_id
    const { data: existing } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', targetUserId);

    let result = null;

    if (existing && existing.length > 0) {
      const updatePayload = {
        full_name: fullName || existing[0].full_name,
        creator_name: creatorName || existing[0].creator_name,
        bio: bio !== undefined ? bio : existing[0].bio,
        state_ut: state || existing[0].state_ut,
        youtube_handle: handle || existing[0].youtube_handle,
        subscribers: subscribers ? Number(subscribers) : existing[0].subscribers,
        avg_views: avgViews ? Number(avgViews) : existing[0].avg_views,
        engagement_rate: engagementRate ? Number(engagementRate) : existing[0].engagement_rate,
        content_niche_category: category || existing[0].content_niche_category
      };

      if (avatar) updatePayload.avatar = avatar;

      const { data: updated, error: upErr } = await supabase
        .from('influencers')
        .update(updatePayload)
        .eq('user_id', targetUserId)
        .select()
        .single();

      if (upErr) {
        console.error("updateInfluencerProfile update error:", upErr.message);
        return res.status(400).json({ success: false, message: upErr.message });
      }
      result = updated;
    } else {
      const insertPayload = {
        user_id: targetUserId,
        full_name: fullName || 'Creator Name',
        creator_name: creatorName || fullName || 'Creator Name',
        youtube_handle: handle || '@creator',
        content_niche_category: category || 'Technology',
        state_ut: state || 'Karnataka',
        bio: bio || '',
        subscribers: subscribers ? Number(subscribers) : 50000,
        avg_views: avgViews ? Number(avgViews) : 15000,
        engagement_rate: engagementRate ? Number(engagementRate) : 4.8
      };

      if (avatar) insertPayload.avatar = avatar;

      const { data: inserted, error: insErr } = await supabase
        .from('influencers')
        .insert(insertPayload)
        .select()
        .single();

      if (insErr) {
        console.error("updateInfluencerProfile insert error:", insErr.message);
        return res.status(400).json({ success: false, message: insErr.message });
      }
      result = inserted;
    }

    return res.status(200).json({
      success: true,
      message: 'Influencer profile updated and synced to Supabase database successfully!',
      influencer: result
    });
  } catch (err) {
    console.error("updateInfluencerProfile error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Save inquiry / application to database
const sendInquiry = async (req, res) => {
  try {
    const { companyId, influencerId, campaignId, message, bidAmount, creatorId } = req.body;

    const targetInfluencerId = (influencerId || creatorId || 'rohan-mehta').toString();
    const targetCompanyId = (companyId && companyId.includes('-')) ? companyId : 'a0000000-0000-0000-0000-000000000001';
    const targetCampaignId = (campaignId && campaignId.includes('-')) ? campaignId : null;

    // Ensure profile exists in profiles table
    await supabase.from('profiles').upsert({ id: targetCompanyId, account_type: 'brand' });

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        company_id: targetCompanyId,
        influencer_id: targetInfluencerId,
        campaign_id: targetCampaignId,
        message: message || '',
        bid_amount: bidAmount ? Number(bidAmount) : null,
        status: 'New'
      })
      .select()
      .single();

    if (error) {
      console.error("sendInquiry error:", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, inquiry });
  } catch (err) {
    console.error("sendInquiry catch error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get inquiries
const getInquiries = async (req, res) => {
  try {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(200).json({ success: true, inquiries: [] });
    }

    return res.status(200).json({ success: true, inquiries: inquiries || [] });
  } catch (err) {
    console.error("getInquiries error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update inquiry status
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: updated, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, inquiry: updated });
  } catch (err) {
    console.error("updateInquiryStatus error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Toggle Save / Bookmark Influencer in database
const toggleSaveInfluencer = async (req, res) => {
  try {
    const { userId, influencerId } = req.body;

    const targetUserId = (userId && userId.includes('-')) ? userId : 'a0000000-0000-0000-0000-000000000001';
    const targetInfluencerId = (influencerId || 'rohan-mehta').toString();

    // Ensure profile exists in profiles table
    await supabase.from('profiles').upsert({ id: targetUserId, account_type: 'brand' });

    const { data: existing } = await supabase
      .from('saved_influencers')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('influencer_id', targetInfluencerId);

    let isSavedNow = false;

    if (existing && existing.length > 0) {
      await supabase
        .from('saved_influencers')
        .delete()
        .eq('user_id', targetUserId)
        .eq('influencer_id', targetInfluencerId);
      isSavedNow = false;
    } else {
      const { error: insErr } = await supabase
        .from('saved_influencers')
        .insert({
          user_id: targetUserId,
          influencer_id: targetInfluencerId
        });

      if (insErr) {
        console.error("toggleSaveInfluencer insert error:", insErr.message);
        return res.status(400).json({ success: false, message: insErr.message });
      }
      isSavedNow = true;
    }

    return res.status(200).json({ success: true, isSavedNow });
  } catch (err) {
    console.error("toggleSaveInfluencer error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Saved Influencer IDs for User
const getSavedInfluencers = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = (userId && userId.includes('-')) ? userId : 'a0000000-0000-0000-0000-000000000001';

    const { data: saved, error } = await supabase
      .from('saved_influencers')
      .select('influencer_id')
      .eq('user_id', targetUserId);

    if (error || !saved) {
      return res.status(200).json({ success: true, savedIds: [] });
    }

    const savedIds = saved.map((s) => s.influencer_id);
    return res.status(200).json({ success: true, savedIds });
  } catch (err) {
    console.error("getSavedInfluencers error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getInfluencers,
  getInfluencerById,
  updateInfluencerProfile,
  sendInquiry,
  getInquiries,
  updateInquiryStatus,
  toggleSaveInfluencer,
  getSavedInfluencers
};
