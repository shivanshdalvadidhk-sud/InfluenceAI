const supabase = require('../config/supabase');
const { formatChannelRecommendation } = require('./recommendationController');

// Bulletproof YouTube URL formatter - prevents double prefixing
function formatYoutubeUrl(handleOrUrl, channelId = null) {
  const raw = String(handleOrUrl || '').trim();
  if (!raw && !channelId) return 'https://www.youtube.com';

  // If there's duplicate/nested http prefix (e.g. https://www.youtube.com/@https://...)
  if (raw.includes('http') && raw.indexOf('http') !== raw.lastIndexOf('http')) {
    const lastHttpIdx = raw.lastIndexOf('http');
    return raw.slice(lastHttpIdx).trim();
  }

  // If already an absolute http URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/youtube\.com\/@https?:\/\//i, 'youtube.com/@');
  }

  if (channelId && String(channelId).startsWith('UC')) {
    return `https://www.youtube.com/channel/${channelId}`;
  }

  if (raw.startsWith('UC') && raw.length >= 20) {
    return `https://www.youtube.com/channel/${raw}`;
  }

  if (raw.startsWith('@')) {
    return `https://www.youtube.com/${raw}`;
  }

  if (raw) {
    return `https://www.youtube.com/@${raw}`;
  }

  return channelId ? `https://www.youtube.com/channel/${channelId}` : 'https://www.youtube.com';
}

// Helper to map a row from public.ml_channels into a unified influencer object
function mapMlChannelToInfluencer(ch, aiRecOverride = null) {
  const rec = aiRecOverride || {
    rank: 1,
    channel_id: ch.channel_id,
    channel_name: ch.title || ch.channel_id,
    channel_url: formatYoutubeUrl(ch.channel_url, ch.channel_id),
    thumbnail_url: ch.thumbnail_url,
    category: ch.category,
    country: ch.country,
    tier: ch.tier || 'micro',
    subscriber_count: ch.subscriber_count,
    view_count: ch.view_count,
    engagement_rate: Number(ch.avg_engagement_rate || 0.045),
    semantic_similarity: 0.78,
    engagement_score: 0.75,
    recommendation_score: 0.77,
    budget_fit: 'not_verified - creator fee data unavailable',
    reasons: ['Strong campaign-content match', 'Strong relative engagement']
  };
  return formatChannelRecommendation(rec, ch);
}

// Get all influencers (combines top ml_channels and registered public.influencers)
const getInfluencers = async (req, res) => {
  try {
    const { category, limit = 60 } = req.query;

    let mlQuery = supabase
      .from('ml_channels')
      .select('channel_id, title, description, channel_url, thumbnail_url, category, country, tier, subscriber_count, view_count, avg_engagement_rate, video_count')
      .not('subscriber_count', 'is', null)
      .order('subscriber_count', { ascending: false })
      .limit(Number(limit) || 60);

    if (category && category !== 'All' && category !== 'All Niches') {
      mlQuery = mlQuery.ilike('category', String(category));
    }

    const [{ data: mlChannels }, { data: dbInfluencers }] = await Promise.all([
      mlQuery,
      supabase.from('influencers').select('*').order('created_at', { ascending: false })
    ]);

    const mappedMl = (mlChannels || []).map((ch) => mapMlChannelToInfluencer(ch));
    const mappedDb = (dbInfluencers || []).map((inf) => {
      const safeUrl = formatYoutubeUrl(inf.youtube_handle, inf.id);
      return {
        id: inf.id.toString(),
        channel_id: inf.id.toString(),
        name: inf.full_name,
        channel_name: inf.creator_name || inf.full_name,
        creatorName: inf.creator_name,
        handle: String(inf.youtube_handle || '').startsWith('@') ? inf.youtube_handle : `@${String(inf.youtube_handle || '').replace(/^https?:\/\/(?:www\.)?youtube\.com\/@?/i, '')}`,
        category: inf.content_niche_category,
        country: 'IN',
        state: inf.state_ut,
        tier: (inf.subscribers || 50000) >= 1000000 ? 'macro' : (inf.subscribers || 50000) >= 100000 ? 'mid' : (inf.subscribers || 50000) >= 10000 ? 'micro' : 'nano',
        bio: inf.bio || 'Verified content creator.',
        platform: inf.primary_platform || 'YouTube',
        primaryPlatform: inf.primary_platform || 'YouTube',
        subscribers: Number(inf.subscribers || 50000),
        subscriber_count: Number(inf.subscribers || 50000),
        avgViews: Number(inf.avg_views || 15000),
        view_count: Number(inf.avg_views || 15000),
        engagementRate: Number(inf.engagement_rate || 4.8),
        engagement_rate: Number(inf.engagement_rate || 4.8) / 100,
        graphScore: Number(inf.graph_score || 85),
        finalScore: Number(inf.graph_score || 85),
        recommendation_score: Number(inf.graph_score || 85) / 100,
        semantic_similarity: 0.85,
        engagement_score: 0.82,
        budget_fit: 'verified',
        reasons: ['Verified platform creator'],
        estimatedCost: Number(inf.estimated_cost || 95000),
        avatar: inf.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        thumbnail_url: inf.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        profileUrl: safeUrl,
        channel_url: safeUrl
      };
    });

    return res.status(200).json({
      success: true,
      influencers: [...mappedMl, ...mappedDb]
    });
  } catch (err) {
    console.error("getInfluencers catch error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single influencer by ID (supports both ml_data.channels channel_id and public.influencers id)
const getInfluencerById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check ml_channels by channel_id first
    const { data: mlChannel } = await supabase
      .from('ml_channels')
      .select('*')
      .eq('channel_id', id)
      .maybeSingle();

    if (mlChannel) {
      // Check if this channel appears in recent recommendation_history to preserve exact AI scores
      let matchedRec = null;
      const { data: recentHistory } = await supabase
        .from('recommendation_history')
        .select('recommendations')
        .order('created_at', { ascending: false })
        .limit(15);

      if (recentHistory) {
        for (const row of recentHistory) {
          const recs = typeof row.recommendations === 'string'
            ? JSON.parse(row.recommendations)
            : (row.recommendations || []);
          const found = recs.find((r) => (r.channel_id || r.id) === id);
          if (found) {
            matchedRec = found;
            break;
          }
        }
      }

      const formatted = mapMlChannelToInfluencer(mlChannel, matchedRec);
      return res.status(200).json({ success: true, influencer: formatted });
    }

    // 2. Otherwise check public.influencers if numeric ID
    if (/^\d+$/.test(String(id))) {
      const { data: influencer, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', Number(id))
        .maybeSingle();

      if (!error && influencer) {
        return res.status(200).json({
          success: true,
          influencer: {
            id: influencer.id.toString(),
            channel_id: influencer.id.toString(),
            name: influencer.full_name,
            channel_name: influencer.creator_name || influencer.full_name,
            creatorName: influencer.creator_name,
            handle: influencer.youtube_handle,
            category: influencer.content_niche_category,
            country: 'IN',
            state: influencer.state_ut,
            tier: (influencer.subscribers || 50000) >= 1000000 ? 'macro' : 'mid',
            bio: influencer.bio || 'Verified content creator.',
            platform: influencer.primary_platform || 'YouTube',
            primaryPlatform: influencer.primary_platform || 'YouTube',
            subscribers: Number(influencer.subscribers || 50000),
            subscriber_count: Number(influencer.subscribers || 50000),
            avgViews: Number(influencer.avg_views || 15000),
            view_count: Number(influencer.avg_views || 15000),
            engagementRate: Number(influencer.engagement_rate || 4.8),
            engagement_rate: Number(influencer.engagement_rate || 4.8) / 100,
            graphScore: Number(influencer.graph_score || 85),
            finalScore: Number(influencer.graph_score || 85),
            recommendation_score: Number(influencer.graph_score || 85) / 100,
            semantic_similarity: 0.85,
            engagement_score: 0.82,
            budget_fit: 'verified',
            reasons: ['Verified platform creator'],
            estimatedCost: Number(influencer.estimated_cost || 95000),
            avatar: influencer.avatar,
            thumbnail_url: influencer.avatar,
            profileUrl: formatYoutubeUrl(influencer.youtube_handle, influencer.id),
            channel_url: formatYoutubeUrl(influencer.youtube_handle, influencer.id)
          }
        });
      }
    }

    return res.status(404).json({ success: false, message: "Influencer not found" });
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

    await supabase.from('profiles').upsert({ id: targetUserId, account_type: 'influencer' });

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
        content_niche_category: category || 'fashion',
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
// Save inquiry / application to database
const sendInquiry = async (req, res) => {
  try {
    const {
      companyId,
      influencerId,
      campaignId,
      campaignName,
      companyName,
      brandEmail,
      deliverables,
      message,
      bidAmount,
      creatorId,
      influencerName,
      influencerHandle,
      influencerAvatar
    } = req.body;

    const rawTargetId = (influencerId || creatorId || 'rohan-mehta').toString();
    const targetCompanyId = (companyId && companyId.includes('-') && !companyId.startsWith('google-'))
      ? companyId
      : 'a0000000-0000-0000-0000-000000000001';
    const targetCampaignId = campaignId ? String(campaignId) : null;

    let targetInfluencerUserId = rawTargetId;
    let targetChannelId = rawTargetId.startsWith('UC') ? rawTargetId : null;
    let resolvedAvatar = influencerAvatar || null;
    let resolvedName = influencerName || null;
    let resolvedHandle = influencerHandle || null;

    // 1. Check if creator exists in public.influencers (by ID, user_id, or handle)
    try {
      const isNum = !isNaN(Number(rawTargetId));
      let infQuery = supabase.from('influencers').select('*');
      if (isNum) {
        infQuery = infQuery.eq('id', Number(rawTargetId));
      } else if (rawTargetId.includes('-')) {
        infQuery = infQuery.eq('user_id', rawTargetId);
      } else {
        infQuery = infQuery.or(`youtube_handle.ilike.%${rawTargetId}%,creator_name.ilike.%${rawTargetId}%`);
      }
      const { data: infRows } = await infQuery.limit(1);
      if (infRows && infRows.length > 0) {
        const inf = infRows[0];
        targetInfluencerUserId = inf.user_id || rawTargetId;
        resolvedName = resolvedName || inf.creator_name || inf.full_name;
        resolvedHandle = resolvedHandle || inf.youtube_handle;
        resolvedAvatar = resolvedAvatar || inf.avatar;
      }
    } catch (infErr) {
      console.warn('influencers lookup notice:', infErr.message);
    }

    // 2. Check if channel is registered in registered_channels table
    try {
      const { data: regRows } = await supabase
        .from('registered_channels')
        .select('user_id, youtube_channel_id, channel_title, thumbnail_url')
        .or(`youtube_channel_id.eq.${rawTargetId},user_id.eq.${rawTargetId.includes('-') ? rawTargetId : '00000000-0000-0000-0000-000000000000'}`)
        .limit(1);

      if (regRows && regRows.length > 0) {
        if (!targetInfluencerUserId || targetInfluencerUserId === rawTargetId) {
          targetInfluencerUserId = regRows[0].user_id;
        }
        targetChannelId = regRows[0].youtube_channel_id;
        resolvedAvatar = resolvedAvatar || regRows[0].thumbnail_url;
      }
    } catch (_) {}

    await supabase.from('profiles').upsert({ id: targetCompanyId, account_type: 'brand' });

    const insertPayload = {
      company_id: targetCompanyId,
      influencer_id: targetInfluencerUserId,
      campaign_id: targetCampaignId,
      campaign_name: campaignName || 'Sponsorship Campaign Proposal',
      company_name: companyName || 'Brand Partner',
      brand_email: brandEmail || null,
      influencer_name: resolvedName,
      influencer_handle: resolvedHandle,
      influencer_avatar: resolvedAvatar,
      youtube_channel_id: targetChannelId || rawTargetId,
      deliverables: Array.isArray(deliverables) ? deliverables.join(', ') : (deliverables || 'Dedicated Video'),
      message: message || '',
      bid_amount: bidAmount ? Number(bidAmount) : null,
      status: 'Pending'
    };

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert(insertPayload)
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

// Get inquiries scoped to user (brand or influencer)
const getInquiries = async (req, res) => {
  try {
    const { companyId, influencerId } = req.query;

    if (companyId && companyId !== 'undefined' && companyId !== 'null') {
      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('company_id', String(companyId))
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(200).json({ success: true, inquiries: [] });
      }
      return res.status(200).json({ success: true, inquiries: inquiries || [] });
    }

    if (influencerId && influencerId !== 'undefined' && influencerId !== 'null') {
      const targetId = String(influencerId);

      // Collect all identifiers that could belong to this creator
      const matchConditions = [`influencer_id.eq.${targetId}`];

      try {
        const { data: infRows } = await supabase
          .from('influencers')
          .select('id, user_id, youtube_handle, creator_name')
          .or(`user_id.eq.${targetId.includes('-') ? targetId : '00000000-0000-0000-0000-000000000000'},id.eq.${!isNaN(Number(targetId)) ? Number(targetId) : -1}`)
          .limit(1);

        if (infRows && infRows.length > 0) {
          const inf = infRows[0];
          if (inf.id) matchConditions.push(`influencer_id.eq.${inf.id}`);
          if (inf.user_id) matchConditions.push(`influencer_id.eq.${inf.user_id}`);
          if (inf.youtube_handle) matchConditions.push(`influencer_handle.ilike.${inf.youtube_handle}`);
        }
      } catch (_) {}

      try {
        const { data: regRows } = await supabase
          .from('registered_channels')
          .select('youtube_channel_id')
          .eq('user_id', targetId.includes('-') ? targetId : '00000000-0000-0000-0000-000000000000')
          .limit(5);

        if (regRows && regRows.length > 0) {
          regRows.forEach((r) => {
            if (r.youtube_channel_id) {
              matchConditions.push(`youtube_channel_id.eq.${r.youtube_channel_id}`);
            }
          });
        }
      } catch (_) {}

      const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .or(matchConditions.join(','))
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('getInquiries query notice:', error.message);
        return res.status(200).json({ success: true, inquiries: [] });
      }
      return res.status(200).json({ success: true, inquiries: inquiries || [] });
    }

    return res.status(200).json({ success: true, inquiries: [] });
  } catch (err) {
    console.error("getInquiries error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update inquiry status (influencer accepts or declines)
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = (status === 'Interested' || status === 'accept' || status === 'accepted' || status === 'Accept')
      ? 'Accepted'
      : (status === 'decline' || status === 'declined' || status === 'Decline')
      ? 'Declined'
      : status;

    const { data: updated, error } = await supabase
      .from('inquiries')
      .update({ status: normalizedStatus })
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

    if (!userId || !String(userId).includes('-') || String(userId).startsWith('google-')) {
      return res.status(401).json({ success: false, message: "Valid authenticated user ID required" });
    }
    const targetUserId = String(userId);
    const targetInfluencerId = (influencerId || '').toString();

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

// Get Saved Influencers (resolves both savedIds AND full channel objects from ml_channels + influencers)
const getSavedInfluencers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined' || userId === 'null' || !String(userId).includes('-')) {
      return res.status(200).json({ success: true, savedIds: [], savedInfluencers: [] });
    }
    const targetUserId = String(userId);

    const { data: saved, error } = await supabase
      .from('saved_influencers')
      .select('influencer_id, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error || !saved || saved.length === 0) {
      return res.status(200).json({ success: true, savedIds: [], savedInfluencers: [] });
    }

    const savedIds = saved.map((s) => s.influencer_id);

    // Resolve channel records from ml_channels
    const { data: mlMatches } = await supabase
      .from('ml_channels')
      .select('*')
      .in('channel_id', savedIds);

    const savedInfluencers = [];
    const foundIds = new Set();

    if (mlMatches) {
      mlMatches.forEach((ch) => {
        foundIds.add(ch.channel_id);
        savedInfluencers.push(mapMlChannelToInfluencer(ch));
      });
    }

    // Resolve any numeric IDs from public.influencers
    const numericIds = savedIds.filter((id) => !foundIds.has(id) && /^\d+$/.test(String(id))).map(Number);
    if (numericIds.length > 0) {
      const { data: dbMatches } = await supabase
        .from('influencers')
        .select('*')
        .in('id', numericIds);

      if (dbMatches) {
        dbMatches.forEach((inf) => {
          savedInfluencers.push({
            id: inf.id.toString(),
            channel_id: inf.id.toString(),
            name: inf.full_name,
            channel_name: inf.creator_name || inf.full_name,
            creatorName: inf.creator_name,
            handle: inf.youtube_handle,
            category: inf.content_niche_category,
            country: 'IN',
            state: inf.state_ut,
            tier: 'macro',
            bio: inf.bio || 'Verified content creator.',
            platform: inf.primary_platform || 'YouTube',
            subscribers: Number(inf.subscribers || 50000),
            subscriber_count: Number(inf.subscribers || 50000),
            avgViews: Number(inf.avg_views || 15000),
            view_count: Number(inf.avg_views || 15000),
            engagementRate: Number(inf.engagement_rate || 4.8),
            engagement_rate: Number(inf.engagement_rate || 4.8) / 100,
            graphScore: Number(inf.graph_score || 85),
            finalScore: Number(inf.graph_score || 85),
            recommendation_score: Number(inf.graph_score || 85) / 100,
            avatar: inf.avatar,
            thumbnail_url: inf.avatar,
            profileUrl: formatYoutubeUrl(inf.youtube_handle, inf.id),
            channel_url: formatYoutubeUrl(inf.youtube_handle, inf.id)
          });
        });
      }
    }

    return res.status(200).json({ success: true, savedIds, savedInfluencers });
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
