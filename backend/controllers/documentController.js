const Document = require('../models/documentModel.js');

// @desc    Get all documents for a project
// @route   GET /api/projects/:projectId/documents
const getDocumentsForProject = async (req, res) => {
    try {
        const documents = await Document.find({ project: req.params.projectId })
                                        .select('title createdAt') // Only select needed fields for the list
                                        .sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Create a new document
// @route   POST /api/documents
const createDocument = async (req, res) => {
    try {
        const { title, projectId } = req.body;
        const newDocument = await Document.create({
            title: title || 'Untitled Document',
            project: projectId,
            createdBy: req.user._id,
            content: { ops: [{ insert: '\n' }] } // Start with a blank slate
        });
        res.status(201).json(newDocument);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get a single document's content
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (document) {
            res.json(document);
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a document's content
// @route   PUT /api/documents/:id
const updateDocument = async (req, res) => {
    try {
        const { content } = req.body;
        const document = await Document.findByIdAndUpdate(req.params.id, { content }, { new: true });
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = {
    getDocumentsForProject,
    createDocument,
    getDocumentById,
    updateDocument
};