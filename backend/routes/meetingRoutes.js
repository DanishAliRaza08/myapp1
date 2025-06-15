const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { scheduleMeeting } = require('../controllers/meetingController.js');

router.route('/').post(protect, scheduleMeeting);

module.exports = router;