// InfluenceAI - AI Recommendation and Match Engine Service
import { mockInfluencers } from '../data/mockData';

// Basic list of keywords to compute mock semantic similarity
const keywordMapping = {
  Technology: ['tech', 'gadget', 'smartphone', 'review', 'pc', 'build', 'coding', 'software', 'assistant', 'device', 'keyboard', 'electronic', 'ai'],
  Fitness: ['fit', 'workout', 'diet', 'nutrition', 'wellness', 'supplement', 'training', 'healthy', 'gym', 'activewear', 'exercise', 'yoga'],
  Fashion: ['fashion', 'couture', 'wedding', 'wear', 'design', 'style', 'dress', 'apparel', 'beauty', 'traditional', 'saree', 'makeup', 'model'],
  Gaming: ['game', 'gaming', 'esports', 'play', 'shooter', 'stream', 'console', 'rig', 'hardware', 'roleplay', 'rpg', 'minecraft', 'gta'],
  Finance: ['finance', 'invest', 'stock', 'tax', 'crypto', 'wealth', 'money', 'saving', 'equity', 'ipo', 'budget', 'mutual fund'],
  Travel: ['travel', 'trek', 'backpack', 'himalayan', 'trip', 'explore', 'waterfall', 'heritage', 'shrine', 'somnath', 'budget travel', 'vlog'],
  Education: ['code', 'system design', 'masterclass', 'career', 'study', 'learn', 'structures', 'beginners', 'science', 'engineering'],
  Lifestyle: ['lifestyle', 'vlog', 'decor', 'routine', 'morning', 'aesthetic', 'campus', 'study', 'book', 'productivity'],
  Food: ['food', 'cook', 'recipe', 'street food', 'dessert', 'restaurant', 'stall', 'cafe', 'misal pav', 'kachori', 'chef']
};

const calculateSemanticScore = (description = '', category = '', creator) => {
  const descLower = description.toLowerCase();
  const creatorBioLower = (creator.bio || '').toLowerCase();
  const creatorNameLower = creator.name.toLowerCase();
  const creatorHandleLower = creator.handle.toLowerCase();
  
  let score = 50; // base score
  
  // Category relevance boost
  if (creator.category.toLowerCase() === category.toLowerCase()) {
    score += 20;
  } else {
    // Check for adjacent categories
    const adjacencies = {
      Technology: ['Gaming', 'Education'],
      Gaming: ['Technology'],
      Fashion: ['Lifestyle', 'Travel'],
      Travel: ['Food', 'Lifestyle'],
      Food: ['Travel', 'Lifestyle'],
      Lifestyle: ['Fashion', 'Travel', 'Food'],
      Fitness: ['Lifestyle', 'Food']
    };
    if (adjacencies[category] && adjacencies[category].includes(creator.category)) {
      score += 10;
    }
  }

  // Keyword scans (SBERT simulation)
  let keywordHits = 0;
  const keywords = keywordMapping[category] || [];
  keywords.forEach((keyword) => {
    if (descLower.includes(keyword) || creatorBioLower.includes(keyword)) {
      keywordHits += 1;
    }
  });

  score += Math.min(25, keywordHits * 5);

  // Random minor fluctuation for realistic numbers
  const hash = (creator.id.charCodeAt(0) + creator.id.charCodeAt(1)) % 5;
  score += hash;

  return Math.min(98, Math.max(40, score));
};

const calculateAudienceScore = (campaignData, creator) => {
  let score = 70; // base score

  // Gender Overlap
  if (campaignData.audienceGender) {
    const gender = campaignData.audienceGender.toLowerCase();
    if (gender === 'male') {
      score += (creator.audienceGender.male - 50) * 0.4;
    } else if (gender === 'female') {
      score += (creator.audienceGender.female - 50) * 0.4;
    } else {
      score += 15; // neutral full audience compatibility
    }
  }

  // Language check
  if (campaignData.audienceLanguage && creator.language) {
    const langLower = campaignData.audienceLanguage.toLowerCase();
    const creatorLangLower = creator.language.toLowerCase();
    if (creatorLangLower.includes(langLower) || langLower.includes(creatorLangLower)) {
      score += 10;
    }
  }

  return Math.min(97, Math.max(50, Math.round(score)));
};

const calculateBudgetScore = (budget, creatorCost) => {
  const cost = Number(creatorCost);
  const campBudget = Number(budget);
  
  if (cost <= campBudget) {
    // If it's within budget, high score.
    const savingsRatio = (campBudget - cost) / campBudget;
    return Math.min(98, Math.round(90 + savingsRatio * 8));
  } else {
    // If it exceeds budget, decrease score proportionally
    const overflowRatio = (cost - campBudget) / campBudget;
    return Math.max(30, Math.round(90 - overflowRatio * 80));
  }
};

const calculateEngagementScore = (engagementRate) => {
  // engagement rates are between 3% and 9%
  // Scale 3% -> 70, 8% -> 98
  const base = 70;
  const multiplier = (engagementRate - 3) * 5.6;
  return Math.min(98, Math.round(base + Math.max(0, multiplier)));
};

export const recommendationService = {
  getRecommendations: async (campaignData) => {
    // Simulating deep recommendation model calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { category, budget, description, state } = campaignData;
    
    const results = mockInfluencers.map((creator) => {
      // 1. Semantic Match
      const semanticMatch = calculateSemanticScore(description, category, creator);
      
      // 2. Audience Match
      const audienceMatch = calculateAudienceScore(campaignData, creator);
      
      // 3. Budget Fit
      const budgetFit = calculateBudgetScore(budget, creator.estimatedCost);
      
      // 4. Engagement Score
      const engagementScore = calculateEngagementScore(creator.engagementRate);
      
      // 5. Graph Score
      const graphInfluence = creator.graphScore;

      // 6. Overall Suitability
      // SBERT (30%), Audience (25%), Budget (20%), Engagement (15%), Graph (10%)
      const finalScore = Math.round(
        semanticMatch * 0.3 +
        audienceMatch * 0.25 +
        budgetFit * 0.2 +
        engagementScore * 0.15 +
        graphInfluence * 0.1
      );

      // Flag checks (like state/location compatibility)
      let matchesLocation = false;
      if (state && creator.state) {
        matchesLocation = creator.state.toLowerCase() === state.toLowerCase();
      }

      return {
        ...creator,
        semanticMatch,
        audienceMatch,
        budgetFit,
        engagementScore,
        finalScore,
        matchesLocation
      };
    });

    // Sort by overall suitability score descending
    return results.sort((a, b) => b.finalScore - a.finalScore);
  }
};
