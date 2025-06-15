const mongoose = require('mongoose');

const channelSchema = mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;