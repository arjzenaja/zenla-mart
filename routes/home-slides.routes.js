const express = require('express');
const router = express.Router();
const { getHomeSlides } = require('../controllers/home-slides.controller');

// Public route - returns only active slides for client
router.get('/', getHomeSlides);

module.exports = router;
