import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({ taskId, onClose, onTaskUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // State for editable fields, initialized as empty strings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/tasks/${taskId}`, config);
        setTask(data);
        // Set state for form fields after data is fetched
        setTitle(data.title);
        setDescription(data.description || ''); // Use empty string if description is null/undefined
      } catch (error) {
        setError('Failed to load task details.');
        console.log(error)
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, user.token]);

  const handleSave = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { title, description };
      const { data: updatedTask } = await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}`,
        payload,
        config
      );
      // Notify the parent component (KanbanBoard) of the update
      onTaskUpdate(updatedTask);
      // Close the modal
      onClose();
    } catch (error) {
        console.log(error)
      alert('Failed to save changes.');
    }
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      {/* Modal content container */}
      <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-3xl font-light">&times;</button>
        
        {loading && <p>Loading task...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {task && (
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="font-bold text-2xl w-full p-2 bg-transparent border-2 border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md outline-none"
            />
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="text-gray-800 w-full mt-1 p-2 h-32 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 outline-none"
              />
            </div>
            <div className="mt-6">
              <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;