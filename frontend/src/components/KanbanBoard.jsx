import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useAuth } from '../context/AuthContext';
import KanbanColumn from './KanbanColumn';
import TaskDetailModal from './TaskDetailModal';

const KanbanBoard = ({ projectId }) => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!projectId) return;
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const { data } = await axios.get(`http://localhost:5000/api/projects/${projectId}`, config);
        setColumns(data.columns);
      } catch (error) {
        console.error("Failed to fetch board data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardData();
  }, [projectId, user.token]);

  const handleAddTask = (newTask) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column._id === newTask.column) {
          return { ...column, tasks: [...column.tasks, newTask] };
        }
        return column;
      });
    });
  };

  const handleTaskUpdate = (updatedTask) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        const newTasks = column.tasks.map(task => 
          task._id === updatedTask._id ? { ...task, ...updatedTask } : task
        );
        return { ...column, tasks: newTasks };
      });
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const oldColumnId = active.data.current.sortable.containerId;
    const newColumnId = over.data.current?.sortable.containerId || over.id;
    if (oldColumnId === newColumnId) return;

    setColumns(prevColumns => {
      let taskToMove;
      const tempColumns = prevColumns.map(col => {
        if (col._id === oldColumnId) {
          taskToMove = col.tasks.find(task => task._id === taskId);
          return { ...col, tasks: col.tasks.filter(task => task._id !== taskId) };
        }
        return col;
      });
      return tempColumns.map(col => {
        if (col._id === newColumnId && taskToMove) {
          return { ...col, tasks: [...col.tasks, taskToMove] };
        }
        return col;
      });
    });

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    axios.patch(
      `http://localhost:5000/api/tasks/${taskId}`, { column: newColumnId }, config
    ).catch(err => {
      console.error("Failed to update task column:", err);
      alert("Failed to move task. Please refresh the page.");
      // In a real app, you would revert the state change here
    });
  };

  if (loading) return <p className="p-4">Loading board...</p>;

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-4 h-full overflow-x-auto">
          <SortableContext items={columns.map(c => c._id)} strategy={horizontalListSortingStrategy}>
            {columns.map(column => (
              <KanbanColumn
                key={column._id}
                column={column}
                onAddTask={handleAddTask}
                onOpenTaskModal={id => setSelectedTaskId(id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      {selectedTaskId && (
        <TaskDetailModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};

export default KanbanBoard;