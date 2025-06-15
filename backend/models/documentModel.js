const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Document'
  },
  content: {
    type: Object, // Using a flexible Object type to store rich text data (e.g., Quill's Delta format)
    default: { ops: [{ insert: '\n' }] } // Default to an empty document
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;