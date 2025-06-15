const express = require('express');
const router = express.Router();
const { createProject, getProjectDetails } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createProject);
router.route('/:id').get(protect, getProjectDetails);

module.exports = router;