const Workspace = require('../models/workspaceModel');

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Please provide a workspace name' });
  }

  const workspace = new Workspace({
    name,
    owner: req.user._id,
    members: [req.user._id], // The creator is automatically a member
  });

  const createdWorkspace = await workspace.save();
  res.status(201).json(createdWorkspace);
};

// @desc    Get user's workspaces
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({ members: req.user._id });
  res.json(workspaces);
};

module.exports = { createWorkspace, getWorkspaces };