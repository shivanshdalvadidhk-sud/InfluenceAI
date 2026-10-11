const express = require('express');
const {
  calculateRecommendationMatches,
  getRecommendationHistory,
  deleteRecommendationHistory
} = require('../controllers/recommendationController');

const router = express.Router();

router.post('/match', calculateRecommendationMatches);
router.get('/history', getRecommendationHistory);
router.get('/history/:campaignId', getRecommendationHistory);
router.delete('/history/:id', deleteRecommendationHistory);

module.exports = router;
