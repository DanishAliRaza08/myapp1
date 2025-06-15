const express = require('express');
const router = express.Router();
const { updateTask, createTask, getTaskById } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Route for creating a new task
router.route('/').post(protect, createTask);

// Route for getting, updating, and eventually deleting a single task
router.route('/:id')
  .get(protect, getTaskById)
  .patch(protect, updateTask);

module.exports = router;