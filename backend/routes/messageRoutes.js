const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleReaction } = require('../controllers/messageController');

// This route handles adding/removing a reaction from a message
router.route('/:id/react').patch(protect, toggleReaction);

module.exports = router;