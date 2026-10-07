const express = require("express");

const {
    registerBrand,
    registerInfluencer
} = require("../controllers/registrationController");

const router = express.Router();


// Brand registration
router.post("/brand", registerBrand);


// Influencer registration
router.post("/influencer", registerInfluencer);


module.exports = router;