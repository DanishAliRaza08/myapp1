const mongoose = require('mongoose');

const flowchartSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true // Each project has only one flowchart
  },
  nodes: {
    type: Array,
    default: [
        { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } }
    ]
  },
  edges: {
    type: Array,
    default: []
  }
}, { timestamps: true });

const Flowchart = mongoose.model('Flowchart', flowchartSchema);

module.exports = Flowchart;