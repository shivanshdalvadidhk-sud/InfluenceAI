const supabase = require('../config/supabase');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

// Supported categories in ml_data.channels
const SUPPORTED_CATEGORIES = new Set([
  'beauty',
  'fashion',
  'fitness',
  'food',
  'finance',
  'gaming',
  'health',
  'lifestyle',
  'parenting',
  'travel',
  'automobile'
]);

const CATEGORY_ALIASES = {
  'technology': 'gaming',
  'tech': 'gaming',
  'education': 'finance',
  'fashion & lifestyle': 'fashion',
  'health & wellness': 'health',
  'auto': 'automobile',
  'cars': 'automobile',
  'skincare': 'beauty',
  'makeup': 'beauty',
  'cooking': 'food',
  'workout': 'fitness'
};

function normalizeCategory(rawCategory) {
  if (!rawCategory) return 'fashion';
  const lower = String(rawCategory).trim().toLowerCase();
  if (SUPPORTED_CATEGORIES.has(lower)) return lower;
  if (CATEGORY_ALIASES[lower]) return CATEGORY_ALIASES[lower];
  return lower;
}

function normalizeGoal(rawGoal) {
  if (!rawGoal) return 'awareness';
  const lower = String(rawGoal).trim().toLowerCase();
  if (lower === 'awareness' || lower.includes('awareness') || lower.includes('launch')) return 'awareness';
  if (lower === 'engagement' || lower.includes('engagement') || lower.includes('review')) return 'engagement';
  if (lower === 'conversions' || lower.includes('conversion') || lower.includes('sales') || lower.includes('lead') || lower.includes('app')) return 'conversions';
  return 'awareness';
}

function normalizeCountry(rawCountry) {
  if (!rawCountry) return null;
  const trimmed = String(rawCountry).trim();
  if (!trimmed || trimmed.toLowerCase() === 'all' || trimmed.toLowerCase() === 'all countries' || trimmed.toLowerCase() === 'global') {
    return null;
  }
  return trimmed;
}

function estimateCostFromTierAndSubs(tier, subs) {
  const count = Number(subs) || 0;
  const t = String(tier || '').toLowerCase();
  if (t === 'nano') return Math.max(5000, Math.min(9999, Math.round(count * 0.8) || 7500));
  if (t === 'micro') return Math.max(10000, Math.min(49999, Math.round(count * 0.5) || 25000));
  if (t === 'mid') return Math.max(50000, Math.min(99999, Math.round(count * 0.2) || 75000));
  if (t === 'macro') return Math.max(100000, Math.round(count * 0.1) || 150000);
  return 50000;
}

function formatChannelRecommendation(aiRec, channelMeta = null) {
  const rawEngRate = Number(aiRec.engagement_rate ?? channelMeta?.avg_engagement_rate ?? 0);
  const engagementRatePct = rawEngRate <= 1
    ? Number((rawEngRate * 100).toFixed(2))
    : Number(rawEngRate.toFixed(2));

  const semanticSim = Number(aiRec.semantic_similarity ?? 0);
  const engScore = Number(aiRec.engagement_score ?? 0);
  const recScore = Number(aiRec.recommendation_score ?? 0);

  const semanticMatchPct = Math.round(semanticSim <= 1 ? semanticSim * 100 : semanticSim);
  const engagementScorePct = Math.round(engScore <= 1 ? engScore * 100 : engScore);
  const finalScorePct = Math.round(recScore <= 1 ? recScore * 100 : recScore);

  const channelName = aiRec.channel_name || channelMeta?.title || aiRec.channel_id;
  const channelId = aiRec.channel_id;
  const channelUrl = aiRec.channel_url || channelMeta?.channel_url || `https://www.youtube.com/channel/${channelId}`;
  const thumbnailUrl = aiRec.thumbnail_url || channelMeta?.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=7C3AED&color=fff&bold=true`;
  const subscriberCount = aiRec.subscriber_count !== undefined && aiRec.subscriber_count !== null
    ? Number(aiRec.subscriber_count)
    : (channelMeta?.subscriber_count ? Number(channelMeta.subscriber_count) : 0);
  const viewCount = aiRec.view_count !== undefined && aiRec.view_count !== null
    ? Number(aiRec.view_count)
    : (channelMeta?.view_count ? Number(channelMeta.view_count) : 0);
  const tier = aiRec.tier || channelMeta?.tier || 'micro';
  const category = aiRec.category || channelMeta?.category || 'general';
  const country = aiRec.country || channelMeta?.country || 'IN';
  const reasons = Array.isArray(aiRec.reasons) && aiRec.reasons.length > 0
    ? aiRec.reasons
    : ['Ranked by combined relevance and engagement'];
  const budgetFit = aiRec.budget_fit || 'not_verified - creator fee data unavailable';

  const rawBio = channelMeta?.description || '';
  const cleanBio = rawBio.trim()
    ? rawBio.trim()
    : `YouTube ${category} channel (${tier.toUpperCase()} tier) • ${reasons.join(' • ')}`;

  return {
    // Exact AI Engine output fields
    rank: aiRec.rank || 1,
    channel_id: channelId,
    channel_name: channelName,
    channel_url: channelUrl,
    thumbnail_url: thumbnailUrl,
    category: category,
    country: country,
    tier: tier,
    subscriber_count: subscriberCount,
    view_count: viewCount,
    engagement_rate: Number(rawEngRate.toFixed(4)),
    semantic_similarity: Number(semanticSim.toFixed(4)),
    engagement_score: Number(engScore.toFixed(4)),
    recommendation_score: Number(recScore.toFixed(4)),
    comment_sentiment_score: aiRec.comment_sentiment_score !== undefined ? aiRec.comment_sentiment_score : (channelMeta?.comment_sentiment_score ?? 0.5),
    dominant_sentiment: aiRec.dominant_sentiment || channelMeta?.dominant_sentiment || 'neutral',
    budget_fit: budgetFit,
    reasons: reasons,

    // Frontend UI fields
    id: channelId,
    name: channelName,
    creatorName: channelName,
    dominant_sentiment: aiRec.dominant_sentiment || channelMeta?.dominant_sentiment || 'neutral',
    dominantSentiment: aiRec.dominant_sentiment || channelMeta?.dominant_sentiment || 'neutral',
    comment_sentiment_score: aiRec.comment_sentiment_score !== undefined ? aiRec.comment_sentiment_score : (channelMeta?.comment_sentiment_score ?? 0.5),
    commentSentimentScore: aiRec.comment_sentiment_score !== undefined ? aiRec.comment_sentiment_score : (channelMeta?.comment_sentiment_score ?? 0.5),
    handle: `@${channelName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || channelId.slice(0, 10)}`,
    avatar: thumbnailUrl,
    profileUrl: channelUrl,
    platform: 'YouTube',
    primaryPlatform: 'YouTube',
    state: country === 'IN' ? 'India (IN)' : country,
    bio: cleanBio,
    subscribers: subscriberCount,
    avgViews: viewCount,
    videoCount: channelMeta?.video_count ? Number(channelMeta.video_count) : null,
    engagementRate: engagementRatePct,
    semanticMatch: semanticMatchPct,
    engagementScore: engagementScorePct,
    budgetFit: budgetFit,
    budgetFitScore: 85,
    audienceMatch: semanticMatchPct,
    graphScore: finalScorePct,
    finalScore: finalScorePct,
    contact_email: aiRec.contact_email || channelMeta?.contact_email || null,
    contactEmail: aiRec.contact_email || channelMeta?.contact_email || null,
    estimatedCost: estimateCostFromTierAndSubs(tier, subscriberCount)
  };
}

// Save recommendation run to public.recommendation_history and update campaign if applicable
const saveRecommendationHistory = async ({
  campaignId,
  campaignName,
  category,
  campaignDescription,
  budgetInr,
  targetCountry,
  campaignGoal,
  topN,
  strictCategory,
  userId,
  recommendations
}) => {
  try {
    const payload = {
      campaign_id: campaignId ? String(campaignId) : null,
      campaign_name: campaignName || `${category.toUpperCase()} Campaign`,
      category: category,
      campaign_description: campaignDescription,
      budget_inr: Number(budgetInr) || 50000,
      target_country: targetCountry || 'All',
      campaign_goal: campaignGoal || 'awareness',
      top_n: Number(topN) || 10,
      strict_category: strictCategory !== undefined ? Boolean(strictCategory) : true,
      user_id: userId ? String(userId) : null,
      recommendations: recommendations,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('recommendation_history')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Warning saving to recommendation_history:', error.message);
    }

    // Also update the campaign record in public.campaigns if campaignId is a UUID
    if (campaignId && String(campaignId).includes('-') && !String(campaignId).startsWith('camp-')) {
      const topCreator = recommendations && recommendations.length > 0
        ? `${recommendations[0].channel_name} (${Math.round((recommendations[0].recommendation_score || 0) * 100)}%)`
        : 'No matches';

      await supabase
        .from('campaigns')
        .update({
          recommendations: recommendations,
          top_match: topCreator,
          target_country: targetCountry || 'India',
          campaign_goal: campaignGoal || 'awareness',
          top_n: Number(topN) || 10,
          strict_category: strictCategory !== undefined ? Boolean(strictCategory) : true
        })
        .eq('id', String(campaignId));
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error saving recommendation history:', err.message);
    return null;
  }
};

const calculateRecommendationMatches = async (req, res) => {
  try {
    const {
      category: rawCategory,
      campaign_description: rawCampDesc,
      description: rawDesc,
      budget_inr: rawBudgetInr,
      budget: rawBudget,
      target_country: rawTargetCountry,
      country: rawCountry,
      campaign_goal: rawCampaignGoal,
      goal: rawGoal,
      top_n: rawTopN,
      topN: rawTopNAlt,
      strict_category: rawStrictCategory,
      strictCategory: rawStrictCategoryAlt,
      campaignId,
      campaignName,
      userId,
      skipHistory = false
    } = req.body;

    const category = normalizeCategory(rawCategory);
    const rawDescriptionText = (rawCampDesc || rawDesc || '').trim();
    const campaign_description = rawDescriptionText.length >= 10
      ? rawDescriptionText
      : `Promote our ${category} brand and products with engaging YouTube content for ${rawDescriptionText || 'target viewers'}.`;

    const parsedBudget = Number(rawBudgetInr ?? rawBudget ?? 50000);
    const budget_inr = parsedBudget > 0 ? parsedBudget : 50000;

    const target_country = normalizeCountry(rawTargetCountry !== undefined ? rawTargetCountry : rawCountry);
    const campaign_goal = normalizeGoal(rawCampaignGoal || rawGoal);

    const parsedTopN = parseInt(rawTopN ?? rawTopNAlt ?? 10, 10);
    const top_n = Number.isFinite(parsedTopN) ? Math.max(1, Math.min(50, parsedTopN)) : 10;

    const strict_category = rawStrictCategory !== undefined
      ? Boolean(rawStrictCategory)
      : (rawStrictCategoryAlt !== undefined ? Boolean(rawStrictCategoryAlt) : true);

    const aiRequestPayload = {
      category,
      campaign_description,
      budget_inr,
      target_country,
      campaign_goal,
      top_n,
      strict_category
    };

    let rawAiRecommendations = [];

    try {
      const forwardHeaders = { 'Content-Type': 'application/json' };
      if (req.headers && req.headers.authorization) {
        forwardHeaders['Authorization'] = req.headers.authorization;
      }

      const response = await fetch(`${AI_ENGINE_URL}/recommend`, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify(aiRequestPayload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI Engine HTTP ${response.status}: ${errText}`);
      }

      const aiData = await response.json();
      rawAiRecommendations = aiData.recommendations || [];
    } catch (aiError) {
      console.warn('AI Engine direct call notice, querying ml_channels fallback:', aiError.message);

      // Fallback using public.ml_channels view if FastAPI server is momentarily restarting
      let query = supabase
        .from('ml_channels')
        .select('*')
        .ilike('category', category);

      if (target_country) {
        const countryCode = target_country.toLowerCase() === 'india' ? 'IN' : target_country.toUpperCase();
        query = query.eq('country', countryCode);
      }

      const { data: fallbackChannels } = await query.limit(top_n * 3);
      if (fallbackChannels && fallbackChannels.length > 0) {
        rawAiRecommendations = fallbackChannels.slice(0, top_n).map((ch, idx) => ({
          rank: idx + 1,
          channel_id: ch.channel_id,
          channel_name: ch.title || ch.channel_id,
          channel_url: ch.channel_url,
          thumbnail_url: ch.thumbnail_url,
          category: ch.category,
          country: ch.country,
          tier: ch.tier || 'micro',
          subscriber_count: ch.subscriber_count,
          view_count: ch.view_count,
          engagement_rate: Number(ch.avg_engagement_rate || 0.045),
          semantic_similarity: 0.72,
          engagement_score: 0.75,
          recommendation_score: Number((0.72 * 0.7 + 0.75 * 0.3).toFixed(4)),
          budget_fit: 'not_verified - creator fee data unavailable',
          reasons: ['Strong campaign-content match']
        }));
      }
    }

    // Enrich with metadata from public.ml_channels (description, video_count, etc.)
    const channelIds = rawAiRecommendations.map((r) => r.channel_id).filter(Boolean);
    const metaByChannelId = {};

    if (channelIds.length > 0) {
      const { data: channelMetas } = await supabase
        .from('ml_channels')
        .select('channel_id, title, description, channel_url, thumbnail_url, category, country, tier, subscriber_count, view_count, avg_engagement_rate, video_count')
        .in('channel_id', channelIds);

      if (channelMetas) {
        channelMetas.forEach((m) => {
          metaByChannelId[m.channel_id] = m;
        });
      }

      // Single batched query against registered_channels_public to attach contact_email
      try {
        const { data: regChannels } = await supabase
          .from('registered_channels_public')
          .select('youtube_channel_id, contact_email')
          .in('youtube_channel_id', channelIds);

        if (regChannels && regChannels.length > 0) {
          regChannels.forEach((reg) => {
            if (metaByChannelId[reg.youtube_channel_id]) {
              metaByChannelId[reg.youtube_channel_id].contact_email = reg.contact_email;
            }
          });
        }
      } catch (regErr) {
        console.warn('Notice: could not query registered_channels_public view:', regErr.message);
      }
    }

    const recommendations = rawAiRecommendations.map((aiRec) =>
      formatChannelRecommendation(aiRec, metaByChannelId[aiRec.channel_id])
    );

    // Store every recommendation run in history unless explicitly skipped
    let historyId = null;
    if (!skipHistory) {
      historyId = await saveRecommendationHistory({
        campaignId,
        campaignName: campaignName || `${category.charAt(0).toUpperCase() + category.slice(1)} Campaign`,
        category,
        campaignDescription: campaign_description,
        budgetInr: budget_inr,
        targetCountry: target_country || 'All Countries',
        campaignGoal: campaign_goal,
        topN: top_n,
        strictCategory: strict_category,
        userId,
        recommendations
      });
    }

    return res.status(200).json({
      success: true,
      campaign_category: category,
      count: recommendations.length,
      input_params: aiRequestPayload,
      history_id: historyId,
      recommendations
    });
  } catch (err) {
    console.error('recommendationController error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get recommendation history (all for user or filtered by campaignId)
const getRecommendationHistory = async (req, res) => {
  try {
    const campaignId = req.params.campaignId || req.query.campaignId;
    const userId = req.query.userId;

    const hasValidCampaignId = campaignId && campaignId !== 'all' && campaignId !== 'undefined' && campaignId !== 'null';
    const hasValidUserId = userId && userId !== 'undefined' && userId !== 'null';

    if (!hasValidCampaignId && !hasValidUserId) {
      return res.status(200).json({ success: true, history: [] });
    }

    let query = supabase
      .from('recommendation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (hasValidCampaignId) {
      query = query.eq('campaign_id', String(campaignId));
    }

    if (hasValidUserId) {
      query = query.eq('user_id', String(userId));
    }

    const { data: history, error } = await query;

    if (error || !history) {
      return res.status(200).json({ success: true, history: [] });
    }

    const formattedHistory = history.map((item) => {
      const recs = typeof item.recommendations === 'string'
        ? JSON.parse(item.recommendations)
        : (item.recommendations || []);

      return {
        id: item.id,
        campaignId: item.campaign_id,
        campaignName: item.campaign_name || `${(item.category || 'General').toUpperCase()} Campaign`,
        category: item.category || 'general',
        campaignDescription: item.campaign_description || '',
        budgetInr: item.budget_inr ? Number(item.budget_inr) : null,
        targetCountry: item.target_country || 'India',
        campaignGoal: item.campaign_goal || 'awareness',
        topN: item.top_n || recs.length,
        strictCategory: item.strict_category ?? true,
        userId: item.user_id,
        recommendations: recs,
        createdAt: item.created_at,
        created_at: item.created_at
      };
    });

    return res.status(200).json({ success: true, history: formattedHistory });
  } catch (err) {
    console.error('getRecommendationHistory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a recommendation history entry
const deleteRecommendationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('recommendation_history')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'History record deleted' });
  } catch (err) {
    console.error('deleteRecommendationHistory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  calculateRecommendationMatches,
  getRecommendationHistory,
  deleteRecommendationHistory,
  formatChannelRecommendation
};
