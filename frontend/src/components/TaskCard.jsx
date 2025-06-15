import React, { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { gsap } from 'gsap';

const TaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const cardRef = useRef(null);

  // This useEffect will run once when the component is first mounted
  useEffect(() => {
    // Animate the card into view using GSAP
    gsap.from(cardRef.current, {
      duration: 0.5,
      y: 50, // Start 50px below its final position
      opacity: 0, // Start fully transparent
      ease: 'power3.out', // A smooth easing function
    });
  }, []); // The empty dependency array ensures this runs only once

  return (
    <div 
      ref={(node) => {
          setNodeRef(node);
          cardRef.current = node;
      }} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onClick}
      className="p-3 mb-3 bg-white rounded-md shadow-sm border cursor-pointer hover:bg-gray-50"
    >
      <p>{task.title}</p>
    </div>
  );
};

export default TaskCard;