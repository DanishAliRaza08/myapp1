import React from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ReactionButtons = ({ message }) => {
    const { user } = useAuth();

    const handleReaction = async (emoji) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`http://localhost:5000/api/messages/${message._id}/react`, { emoji }, config);
        } catch (error) {
            console.error("Failed to react:", error);
        }
    };

    return (
        <div className="absolute -bottom-4 right-2 bg-white border rounded-full shadow-md p-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {commonEmojis.map(emoji => (
                <button key={emoji} onClick={() => handleReaction(emoji)} className="text-lg px-1 hover:scale-125 transition-transform">
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionButtons;