const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateFlowchart } = require('../controllers/flowchartController.js');

router.route('/:id').put(protect, updateFlowchart);

module.exports = router;