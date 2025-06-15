const Message = require('../models/messageModel');

// @desc    Get messages for a channel
// @route   GET /api/channels/:channelId/messages
const getMessagesForChannel = async (req, res) => {
    try {
        const messages = await Message.find({ channel: req.params.channelId })
            .populate('sender', 'displayName avatar')
            .populate('reactions.users', 'displayName') // Populate users who reacted
            .sort({ createdAt: 'asc' });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add/remove a reaction from a message
// @route   PATCH /api/messages/:id/react
const toggleReaction = async (req, res) => {
    try {
        const { emoji } = req.body;
        const userId = req.user._id;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex > -1) {
            // Reaction emoji exists, check if user has already reacted
            const userIndex = message.reactions[reactionIndex].users.indexOf(userId);
            if (userIndex > -1) {
                // User has reacted, so remove them
                message.reactions[reactionIndex].users.splice(userIndex, 1);
                // If no users are left for this reaction, remove the reaction object itself
                if (message.reactions[reactionIndex].users.length === 0) {
                    message.reactions.splice(reactionIndex, 1);
                }
            } else {
                // User has not reacted, so add them
                message.reactions[reactionIndex].users.push(userId);
            }
        } else {
            // Reaction emoji does not exist, so create it
            message.reactions.push({ emoji, users: [userId] });
        }

        await message.save();

        const updatedMessage = await Message.findById(message._id)
            .populate('sender', 'displayName avatar')
            .populate('reactions.users', 'displayName');
        
        // Emit the update to the room
        req.io.to(message.channel.toString()).emit('message-updated', updatedMessage);
        
        res.json(updatedMessage);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getMessagesForChannel,
    toggleReaction,
};