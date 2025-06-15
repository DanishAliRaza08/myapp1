const Flowchart = require('../models/flowchartModel.js');

// @desc    Get or create a flowchart for a project
// @route   GET /api/projects/:projectId/flowchart
const getOrCreateFlowchart = async (req, res) => {
    try {
        let flowchart = await Flowchart.findOne({ project: req.params.projectId });
        if (!flowchart) {
            // If no flowchart exists for this project, create one
            flowchart = await Flowchart.create({ project: req.params.projectId });
        }
        res.json(flowchart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a flowchart
// @route   PUT /api/flowcharts/:id
const updateFlowchart = async (req, res) => {
    try {
        const { nodes, edges } = req.body;
        const flowchart = await Flowchart.findByIdAndUpdate(
            req.params.id, 
            { nodes, edges }, 
            { new: true }
        );
        res.json(flowchart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getOrCreateFlowchart,
    updateFlowchart
};