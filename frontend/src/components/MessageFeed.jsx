import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // This will now be used
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageInput from './MessageInput';
import ReactionButtons from './ReactionButtons';

const MessageFeed = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // This useEffect fetches the message history when a channel is selected
  useEffect(() => {
    if (!channel || !user) return;

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // --- FIX for 'axios' is not used ---
            const { data } = await axios.get(`http://localhost:5000/api/channels/${channel._id}/messages`, config);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMessages();
  }, [channel, user]);

  // This useEffect handles all real-time socket events
  useEffect(() => {
    if (!socket || !channel) return;

    socket.emit('joinChannel', channel._id);

    const newMessageHandler = (newMessage) => {
        // --- FIX for 'newMessage' is not used ---
        // Only add the message if it belongs to the currently active channel
        if (newMessage.channel === channel._id) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }
    };

    const updatedMessageHandler = (updatedMessage) => {
        if (updatedMessage.channel === channel._id) {
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        }
    };

    socket.on('newMessage', newMessageHandler);
    socket.on('message-updated', updatedMessageHandler);

    return () => {
      socket.off('newMessage', newMessageHandler);
      socket.off('message-updated', updatedMessageHandler);
    };
  }, [socket, channel]);

  if (!channel) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-bold text-xl"># {channel.name}</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading && <p className="text-center text-gray-500">Loading history...</p>}
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2 p-2 rounded-md hover:bg-gray-100 group relative">
            <div className="flex items-start">
              <div className="mr-3 mt-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              </div>
              <div>
                <div className="flex items-center">
                  <strong className="mr-2">{msg.sender.displayName}</strong>
                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-800">{msg.content}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {msg.reactions.map(reaction => (
                    <div key={reaction.emoji} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1 cursor-pointer">
                      <span>{reaction.emoji}</span>
                      <span className="font-semibold">{reaction.users.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ReactionButtons message={msg} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput channelId={channel._id} />
    </div>
  );
};

export default MessageFeed;