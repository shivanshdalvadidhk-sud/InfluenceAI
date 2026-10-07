const express = require('express');
const { calculateRecommendationMatches } = require('../controllers/recommendationController');

const router = express.Router();

router.post('/match', calculateRecommendationMatches);

module.exports = router;
