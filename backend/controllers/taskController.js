const Task = require('../models/taskModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, projectId, columnId } = req.body;

    if (!title || !projectId || !columnId) {
        return res.status(400).json({ message: 'Missing required fields: title, projectId, columnId' });
    }

    try {
        const newTask = await Task.create({
            title,
            project: projectId,
            column: columnId,
        });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating task' });
    }
};

// @desc    Update a task (e.g., move between columns, change title)
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        // Only update fields that are provided in the request body
        const { title, description, column, priority, dueDate } = req.body;
        const task = await Task.findById(req.params.id);

        if (task) {
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (column !== undefined) task.column = column;
            if (priority !== undefined) task.priority = priority;
            if (dueDate !== undefined) task.dueDate = dueDate;

            const updatedTask = await task.save();
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single task by its ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignees', 'displayName');
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createTask,
    updateTask,
    getTaskById,
};