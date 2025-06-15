// --- IMPORTS ---
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');

// Import Controllers for specific GET routes
const { getDocumentsForProject } = require('./controllers/documentController');
const { getOrCreateFlowchart } = require('./controllers/flowchartController');
const { getMeetingsForProject } = require('./controllers/meetingController');
const { getChannelsForWorkspace } = require('./controllers/channelController');
const { getMessagesForChannel } = require('./controllers/messageController');

// Import Models
const Message = require('./models/messageModel');

// --- CONFIGURATION ---
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/channels', require('./routes/channelRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/flowcharts', require('./routes/flowchartRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes')); // This line was missing

// Specific GET routes
app.get('/api/workspaces/:workspaceId/channels', protect, getChannelsForWorkspace);
app.get('/api/channels/:channelId/messages', protect, getMessagesForChannel);
app.get('/api/projects/:projectId/documents', protect, getDocumentsForProject);
app.get('/api/projects/:projectId/flowchart', protect, getOrCreateFlowchart);
app.get('/api/projects/:projectId/meetings', protect, getMeetingsForProject);

// --- SOCKET.IO LOGIC ---
const userToSocketMap = {};
const socketToUserMap = {};

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Messaging & Reactions
    socket.on('joinChannel', (channelId) => { socket.join(channelId); });
    socket.on('sendMessage', async (data) => {
        const { channelId, message } = data;
        try {
            const newMessage = new Message({ content: message.content, sender: message.sender._id, channel: channelId });
            const savedMessage = await newMessage.save();
            const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'displayName avatar');
            io.to(channelId).emit('newMessage', populatedMessage);
        } catch (error) { console.error('Error saving message:', error); }
    });
    socket.on('message-updated', (updatedMessage) => {
      socket.to(updatedMessage.channel.toString()).emit('message-updated', updatedMessage);
    });

    // Document Collaboration
    socket.on('join-document', (documentId) => { socket.join(documentId); });
    socket.on('send-changes', (delta, documentId) => {
        socket.to(documentId).emit('receive-changes', delta);
    });
    
    // Flowchart Collaboration
    socket.on('join-flowchart', (flowchartId) => { socket.join(flowchartId); });
    socket.on('flow-changes', (flowchartId, nodes, edges) => {
        socket.to(flowchartId).emit('receive-flow-changes', nodes, edges);
    });
    
    // WebRTC Signaling
    socket.on('register-user', (userId) => {
        userToSocketMap[userId] = socket.id;
        socketToUserMap[socket.id] = userId;
    });
    socket.on('join-meeting', (roomId) => {
        socket.join(roomId);
        const usersInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
        socket.to(roomId).emit('user-joined', { socketId: socket.id, usersInRoom: Array.from(usersInRoom) });
    });
    socket.on('webrtc-offer', ({ sdp, offerTo }) => { socket.to(offerTo).emit('webrtc-offer', { sdp, offerFrom: socket.id }); });
    socket.on('webrtc-answer', ({ sdp, answerTo }) => { socket.to(answerTo).emit('webrtc-answer', { sdp, answerFrom: socket.id }); });
    socket.on('webrtc-ice-candidate', ({ candidate, sendTo }) => { socket.to(sendTo).emit('webrtc-ice-candidate', { candidate, sentFrom: socket.id }); });
  
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        const userId = socketToUserMap[socket.id];
        delete userToSocketMap[userId];
        delete socketToUserMap[socket.id];
    });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));