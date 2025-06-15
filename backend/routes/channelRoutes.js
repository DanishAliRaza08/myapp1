const express = require('express');
const router = express.Router();
const { getChannelsForWorkspace } = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

// Note: The full path will be defined in server.js
// This handles the part after /:workspaceId/channels
router.route('/').get(protect, getChannelsForWorkspace);

module.exports = router;