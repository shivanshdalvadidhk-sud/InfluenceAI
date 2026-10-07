const express = require('express');
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  duplicateCampaign,
  deleteCampaign
} = require('../controllers/campaignController');

const router = express.Router();

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.post('/:id/duplicate', duplicateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;
