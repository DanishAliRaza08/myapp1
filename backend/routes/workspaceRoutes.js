// In backend/routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const channelRouter = require('./channelRoutes');
const { getProjectsForWorkspace } = require('../controllers/projectController'); // Import the new controller

// Add this line to handle GET requests for projects within a workspace
router.route('/:workspaceId/projects').get(protect, getProjectsForWorkspace);

// Existing routes...
router.use('/:workspaceId/channels', channelRouter);
router.route('/').post(protect, createWorkspace).get(protect, getWorkspaces);

module.exports = router;