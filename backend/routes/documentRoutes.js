const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createDocument, 
    getDocumentById,
    updateDocument
} = require('../controllers/documentController');

// Route for creating a new document
router.route('/').post(protect, createDocument);

// Routes for a specific document
router.route('/:id')
    .get(protect, getDocumentById)
    .put(protect, updateDocument);

module.exports = router;