import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MeetingsPage = ({ projectId }) => {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/projects/${projectId}/meetings`, config);
      setMeetings(data);
    };
    fetchMeetings();
  }, [projectId, user.token]);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.post(`http://localhost:5000/api/meetings`, 
      { title, projectId, scheduledTime }, config
    );
    setMeetings([...meetings, data]);
    setTitle('');
    setScheduledTime('');
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Schedule a New Meeting</h2>
        <form onSubmit={handleScheduleMeeting} className="bg-white p-4 rounded-lg shadow">
          <input type="text" placeholder="Meeting Title" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2" required />
          <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
            className="w-full p-2 border rounded mb-4" required />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Schedule
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Meetings</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <ul>
            {meetings.map(meeting => (
              <li key={meeting._id} className="p-2 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(meeting.scheduledTime).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => navigate(`/meetings/${meeting._id}`)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                  Join
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;