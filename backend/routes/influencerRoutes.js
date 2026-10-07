const express = require('express');
const {
  getInfluencers,
  getInfluencerById,
  updateInfluencerProfile,
  sendInquiry,
  getInquiries,
  updateInquiryStatus,
  toggleSaveInfluencer,
  getSavedInfluencers
} = require('../controllers/influencerController');

const router = express.Router();

router.get('/', getInfluencers);
router.get('/inquiries', getInquiries);
router.get('/saved/:userId', getSavedInfluencers);
router.get('/:id', getInfluencerById);
router.put('/profile', updateInfluencerProfile);
router.post('/inquiry', sendInquiry);
router.post('/save', toggleSaveInfluencer);
router.patch('/inquiry/:id', updateInquiryStatus);

module.exports = router;
