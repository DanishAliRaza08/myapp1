import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WorkspaceList = ({ onSelectWorkspace }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/workspaces', config);
        setWorkspaces(data);
      } catch (error) {
        console.error('Failed to fetch workspaces', error);
      }
    };
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/workspaces',
        { name: newWorkspaceName },
        config
      );
      setWorkspaces(prevWorkspaces => [...prevWorkspaces, data]);
      setNewWorkspaceName('');
    } catch (error) {
      console.error('Failed to create workspace', error);
      alert('Error: Could not create workspace.');
    }
  };

  return (
    <div>
      <ul>
        {workspaces.map((ws) => (
          <li
            key={ws._id}
            onClick={() => onSelectWorkspace(ws)}
            className="p-2 hover:bg-gray-300 cursor-pointer rounded"
          >
            {ws.name}
          </li>
        ))}
      </ul>

      {/* --- This is the form at the bottom of the sidebar --- */}
      <div className="mt-6">
        <form onSubmit={handleCreateWorkspace}>
          <h3 className="text-sm font-semibold mb-2">Create New Workspace</h3>
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace name..."
            className="w-full p-2 border rounded mb-2 text-black"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceList;