const Channel = require('../models/channelModel');
const Workspace = require('../models/workspaceModel');

// @desc    Get channels for a specific workspace
// @route   GET /api/workspaces/:workspaceId/channels
// @access  Private
const getChannelsForWorkspace = async (req, res) => {
  try {
    // First, ensure the user is a member of the workspace to be able to see its channels
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace || !workspace.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    const channels = await Channel.find({ workspace: req.params.workspaceId });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// We can add more channel-related functions here later, like createChannel
module.exports = { getChannelsForWorkspace };