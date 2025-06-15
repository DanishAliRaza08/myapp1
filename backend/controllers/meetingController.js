const Meeting = require('../models/meetingModel.js');

// @desc    Schedule a new meeting
// @route   POST /api/meetings
const scheduleMeeting = async (req, res) => {
    try {
        const { title, projectId, scheduledTime } = req.body;
        if (!title || !projectId || !scheduledTime) {
            return res.status(400).json({ message: 'Title, project, and scheduled time are required.' });
        }

        const newMeeting = await Meeting.create({
            title,
            project: projectId,
            scheduledTime,
            host: req.user._id,
        });

        res.status(201).json(newMeeting);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all meetings for a project
// @route   GET /api/projects/:projectId/meetings
const getMeetingsForProject = async (req, res) => {
    try {
        const meetings = await Meeting.find({ project: req.params.projectId })
                                      .populate('host', 'displayName')
                                      .sort({ scheduledTime: 1 }); // Sort by upcoming
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    scheduleMeeting,
    getMeetingsForProject,
};