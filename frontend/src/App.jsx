import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ChatView from './pages/ChatView';
import ProjectPage from './pages/ProjectPage';
import TextEditor from './components/TextEditor';
import MeetingRoom from './pages/MeetingRoom';

function App() {
  const location = useLocation(); // This hook is needed for AnimatePresence to work with React Router

  return (
    <>
      <Navbar />
      <main>
        {/* AnimatePresence enables the exit animations */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="chat" element={<ChatView />} />
                <Route path="projects" element={<ProjectPage />} />
            </Route>

            <Route path="/documents/:id" element={<ProtectedRoute><TextEditor /></ProtectedRoute>} />
            <Route path="/meetings/:meetingId" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

// Note: We remove BrowserRouter from here because it's now in main.jsx
export default App;