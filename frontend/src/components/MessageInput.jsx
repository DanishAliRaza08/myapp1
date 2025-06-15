import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const MessageInput = ({ channelId }) => {
  const [content, setContent] = useState('');
  const socket = useSocket();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Don't send empty messages or if socket is not available
    if (!content.trim() || !socket) return;

    const messageData = {
      content,
      sender: {
        _id: user._id,
        displayName: user.displayName,
      },
      // Note: The backend will set the final timestamp and save to DB
    };
    
    // Emit the message to the server
    socket.emit('sendMessage', { channelId, message: messageData });
    
    // Clear the input field after sending
    setContent('');
  };

  return (
    <div className="p-4 bg-gray-100 border-t">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message #${channelId ? 'channel...' : ''}`}
          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          disabled={!channelId} // Disable input if no channel is selected
        />
      </form>
    </div>
  );
};

export default MessageInput;