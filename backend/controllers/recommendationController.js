const supabase = require('../config/supabase');

const calculateRecommendationMatches = async (req, res) => {
  try {
    const { category, budget, description, state } = req.body;

    // Fetch influencers from Supabase
    const { data: dbInfluencers, error } = await supabase
      .from('influencers')
      .select('*');

    if (error || !dbInfluencers || dbInfluencers.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    // Process AI scores for each influencer
    const recommendations = dbInfluencers.map((inf) => {
      let semanticMatch = 65;
      if (inf.content_niche_category && category && inf.content_niche_category.toLowerCase() === category.toLowerCase()) {
        semanticMatch += 25;
      }

      let budgetFit = 85;
      let engagementScore = 80;
      let graphScore = inf.graph_score || 88;

      let finalScore = Math.round(
        semanticMatch * 0.35 +
        budgetFit * 0.25 +
        engagementScore * 0.20 +
        graphScore * 0.20
      );

      return {
        id: inf.id,
        user_id: inf.user_id,
        name: inf.full_name,
        creatorName: inf.creator_name,
        handle: inf.youtube_handle,
        category: inf.content_niche_category,
        state: inf.state_ut,
        semanticMatch,
        budgetFit,
        engagementScore,
        graphScore,
        finalScore
      };
    });

    recommendations.sort((a, b) => b.finalScore - a.finalScore);

    return res.status(200).json({ success: true, recommendations });
  } catch (err) {
    console.error("recommendationController error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  calculateRecommendationMatches
};
