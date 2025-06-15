import React, { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import Flowchart from '../components/Flowchart';
import MeetingsPage from './MeetingsPage';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('board');
  const [documents, setDocuments] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const a_workspace_id = 'YOUR_WORKSPACE_ID'; // Remember to replace this

  // 2. Wrap the fetchProjects function in useCallback
  const fetchProjects = useCallback(async () => {
    if (!user) return; // Guard clause
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/workspaces/${a_workspace_id}/projects`, config
      );
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  }, [user, a_workspace_id]); // Dependencies for useCallback

  useEffect(() => {
    if (user && !selectedProject) {
      fetchProjects(); // 3. Now it's safe to use fetchProjects here
    }
  }, [user, selectedProject, fetchProjects]); // and add it to the dependency array

  useEffect(() => {
    if (selectedProject && user) {
      const fetchDocuments = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`http://localhost:5000/api/projects/${selectedProject._id}/documents`, config);
          setDocuments(data);
        } catch (error) {
          console.error("Failed to fetch documents", error);
        }
      };
      fetchDocuments();
    }
  }, [selectedProject, user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/projects', { name: newProjectName, workspaceId: a_workspace_id }, config);
      setNewProjectName('');
      fetchProjects();
    } catch (error) {
      alert("Failed to create project."(error));
    }
  };

  const handleCreateDocument = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: newDoc } = await axios.post(`http://localhost:5000/api/documents`, { projectId: selectedProject._id }, config);
      navigate(`/documents/${newDoc._id}`);
    } catch (error) {
      alert("Failed to create document."(error));
    }
  };

  // The rest of the file remains the same...
  if (!selectedProject) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <form onSubmit={handleCreateProject} className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Create New Project</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter new project name..." value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-grow p-2 border rounded-md"
            />
            <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
              Create
            </button>
          </div>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map(p => (
            <div key={p._id} onClick={() => setSelectedProject(p)}
              className="p-6 bg-white rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all">
              <h2 className="font-bold text-xl text-gray-800">{p.name}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
        <button onClick={() => setSelectedProject(null)} className="text-blue-600 hover:underline font-semibold">
          &larr; Back to All Projects
        </button>
      </div>
      <div className="border-b border-gray-300 mb-4 flex-shrink-0">
        <nav className="flex gap-4">
          <button onClick={() => setView('board')} className={`py-2 px-4 text-sm font-semibold ${view === 'board' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Kanban Board</button>
          <button onClick={() => setView('documents')} className={`py-2 px-4 text-sm font-semibold ${view === 'documents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Documents</button>
          <button onClick={() => setView('flowchart')} className={`py-2 px-4 text-sm font-semibold ${view === 'flowchart' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Flowchart</button>
          <button onClick={() => setView('meetings')} className={`py-2 px-4 text-sm font-semibold ${view === 'meetings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Meetings</button>
        </nav>
      </div>
      <div className="flex-grow h-0 bg-gray-50 rounded-lg overflow-y-auto">
        {view === 'board' && <KanbanBoard projectId={selectedProject._id} />}
        {view === 'documents' && (
          <div className="p-4">
            <button onClick={handleCreateDocument} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold">
              + New Document
            </button>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <ul>
                {documents.length > 0 ? documents.map(doc => (
                  <li key={doc._id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <Link to={`/documents/${doc._id}`} className="text-blue-700 font-semibold text-lg">{doc.title}</Link>
                  </li>
                )) : <p className="text-gray-500">No documents yet. Create one!</p>}
              </ul>
            </div>
          </div>
        )}
        {view === 'flowchart' && <Flowchart projectId={selectedProject._id} />}
        {view === 'meetings' && <MeetingsPage projectId={selectedProject._id} />}
      </div>
    </div>
  );
};

export default ProjectPage;