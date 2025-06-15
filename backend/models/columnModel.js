const mongoose = require('mongoose');

const columnSchema = mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  order: { type: Number, required: true }, // To maintain column order
}, { timestamps: true });

const Column = mongoose.model('Column', columnSchema);
module.exports = Column;