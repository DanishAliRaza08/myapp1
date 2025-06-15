import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from './AnimatedPage'; // Import the animation wrapper

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
];

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [quill, setQuill] = useState();
  const socket = useSocket();
  const { user } = useAuth();

  // Effect for handling incoming changes from other users
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on('receive-changes', handler);

    return () => {
      socket.off('receive-changes', handler);
    };
  }, [socket, quill]);

  // Effect for handling your own changes and emitting them via socket
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return; // Only emit changes made by the user
      socket.emit('send-changes', delta, documentId);
    };
    quill.on('text-change', handler);

    return () => {
      quill.off('text-change', handler);
    };
  }, [socket, quill, documentId]);
  
  // Effect for loading the document's initial content from the database
  useEffect(() => {
    if (quill == null || user == null) return;

    quill.disable();
    quill.setText('Loading document...');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    axios.get(`http://localhost:5000/api/documents/${documentId}`, config)
      .then(res => {
        quill.setContents(res.data.content);
        quill.enable();
      })
      .catch(err => {
          console.error("Failed to load document", err);
          quill.setText('Error: Could not load document.');
      });
  }, [quill, documentId, user]);
  
  // Effect for joining the specific document's socket room
  useEffect(() => {
      if (socket == null) return;
      socket.emit("join-document", documentId);
  }, [socket, documentId]);

  // This useCallback hook is used as a 'ref callback' to get access to the
  // div that will contain the editor, so we can manually instantiate Quill.
  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return;

    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new ReactQuill(editor, { 
        theme: 'snow',
        modules: { toolbar: TOOLBAR_OPTIONS }
    });
    setQuill(q);
  }, []);

  return (
    <AnimatedPage>
        <div className="h-screen bg-gray-100 p-4">
            <div className="container mx-auto bg-white h-full" ref={wrapperRef}></div>
        </div>
    </AnimatedPage>
  );
};

export default TextEditor;