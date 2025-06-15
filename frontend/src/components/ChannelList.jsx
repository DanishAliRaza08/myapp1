import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChannelList = ({ workspace, onSelectChannel }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Don't fetch if no workspace is selected
    if (!workspace) {
      setChannels([]);
      return;
    }

    const fetchChannels = async () => {
      setLoading(true);
      setError('');
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        // Fetch channels for the currently selected workspace
        const { data } = await axios.get(
          `http://localhost:5000/api/workspaces/${workspace._id}/channels`,
          config
        );
        setChannels(data);
      } catch (err) {
        setError('Failed to fetch channels.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    // This effect should re-run whenever the selected workspace changes
  }, [workspace, user.token]);

  if (loading) return <p>Loading channels...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
        <h3 className="text-lg font-bold mb-2">Channels in {workspace.name}</h3>
        <ul>
        {channels.length > 0 ? (
            channels.map((ch) => (
            <li
                key={ch._id}
                onClick={() => onSelectChannel(ch)}
                className="p-2 hover:bg-gray-300 cursor-pointer rounded"
            >
                # {ch.name}
            </li>
            ))
        ) : (
            <p className="text-gray-500">No channels found.</p>
        )}
        </ul>
    </div>
  );
};

export default ChannelList;