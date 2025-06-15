const mongoose = require('mongoose');

const reactionSchema = mongoose.Schema({
  emoji: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const messageSchema = mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  // NEW: Add a field for reactions
  reactions: [reactionSchema] 
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;