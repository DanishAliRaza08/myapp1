import React, { useState } from 'react';
import axios from 'axios';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { useAuth } from '../context/AuthContext';

const KanbanColumn = ({ column, onAddTask, onOpenTaskModal }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column._id,
    data: { type: 'Column', column },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: newTask } = await axios.post('http://localhost:5000/api/tasks',
        { title: newTaskTitle, projectId: column.project, columnId: column._id }, config
      );
      onAddTask(newTask);
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add task", error);
      alert("Error: Could not add task.");
    }
  };

  return (
    <div ref={setNodeRef} style={style}
      className="w-80 bg-gray-100 rounded-lg shadow-md flex-shrink-0 flex flex-col h-full max-h-full">
      <h3 {...attributes} {...listeners} className="p-4 font-bold text-lg border-b cursor-grab">{column.name}</h3>
      <div className="p-4 flex-1 overflow-y-auto">
        <SortableContext items={column.tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onClick={() => onOpenTaskModal(task._id)}
            />
          ))}
        </SortableContext>
      </div>
      <div className="p-4 border-t">
        {isAdding ? (
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-2 border rounded-md shadow-inner"
              placeholder="Enter a title for this card..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add Card
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full text-left p-2 text-gray-500 hover:bg-gray-200 rounded-md">
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;