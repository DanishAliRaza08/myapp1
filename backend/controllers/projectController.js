const Project = require('../models/projectModel');
const Column = require('../models/columnModel');
const Task = require('../models/taskModel');

// @desc    Create a new project
// @route   POST /api/projects
const createProject = async (req, res) => {
    const { name, workspaceId } = req.body;
    const project = await Project.create({
        name,
        workspace: workspaceId,
        owner: req.user._id,
        members: [req.user._id]
    });

    // Create default columns for the Kanban board
    await Column.create([
        { name: 'To-Do', project: project._id, order: 0 },
        { name: 'In Progress', project: project._id, order: 1 },
        { name: 'Done', project: project._id, order: 2 }
    ]);

    res.status(201).json(project);
};

// @desc    Get project details with columns and tasks
// @route   GET /api/projects/:id
const getProjectDetails = async (req, res) => {
    const project = await Project.findById(req.params.id).lean(); // .lean() for a plain object
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const columns = await Column.find({ project: project._id }).sort('order').lean();
    const tasks = await Task.find({ project: project._id }).populate('assignees', 'displayName');

    // Organize tasks under their respective columns
    const columnsWithTasks = columns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.column.toString() === column._id.toString())
    }));

    res.json({ project, columns: columnsWithTasks });
};

// Add this function to your projectController.js

// @desc    Get all projects for a workspace
// @route   GET /api/workspaces/:workspaceId/projects
const getProjectsForWorkspace = async (req, res) => {
    try {
        const projects = await Project.find({ workspace: req.params.workspaceId });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Make sure to export the new function
module.exports = { createProject, getProjectDetails, getProjectsForWorkspace };