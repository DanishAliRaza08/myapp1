import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { gsap } from 'gsap';

// The unused 'flowchartId' prop has been removed here.
const Flowchart = ({ projectId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowchart, setFlowchart] = useState(null);
  const { user } = useAuth();
  const socket = useSocket();
  const nodesRef = useRef([]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };
  
  const debouncedEmit = useCallback(debounce((id, newNodes, newEdges) => {
    socket.emit('flow-changes', id, newNodes, newEdges);
  }, 500), [socket]);

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    axios.get(`http://localhost:5000/api/projects/${projectId}/flowchart`, config)
      .then(res => {
        setFlowchart(res.data);
        setNodes(res.data.nodes || []);
        setEdges(res.data.edges || []);
        nodesRef.current = res.data.nodes || [];
      })
      .catch(err => console.error("Failed to load flowchart", err));
  }, [projectId, user.token, setNodes, setEdges]);

  useEffect(() => {
    if (!socket || !flowchart) return;
    socket.emit('join-flowchart', flowchart._id);
    const handler = (newNodes, newEdges) => {
      setNodes(newNodes);
      setEdges(newEdges);
    };
    socket.on('receive-flow-changes', handler);
    if (nodes.length > 0 || edges.length > 0) {
      debouncedEmit(flowchart._id, nodes, edges);
    }
    return () => {
      socket.off('receive-flow-changes', handler);
    };
  }, [socket, flowchart, nodes, edges, setNodes, setEdges, debouncedEmit]);

  useEffect(() => {
    const previousNodes = nodesRef.current;
    if (nodes.length > previousNodes.length) {
      const newNode = nodes.find(node => !previousNodes.some(pNode => pNode.id === node.id));
      if (newNode) {
        gsap.from(`[data-id="${newNode.id}"]`, {
          duration: 0.5,
          scale: 0.3,
          opacity: 0,
          ease: 'back.out(1.7)',
        });
      }
    }
    nodesRef.current = nodes;
  }, [nodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      data: { label: 'New Node' },
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={addNode} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600">
            Add Node
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default Flowchart;