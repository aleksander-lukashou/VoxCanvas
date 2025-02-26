import React, { useState } from 'react';
import './SortableList.css';

interface SortableItem {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (itemIds: string[]) => void;
}

export const SortableList: React.FC<SortableListProps> = ({ items, onReorder }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    // Set drag image if needed
    // e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverItem) {
      setDragOverItem(id);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (!draggedItem || !dragOverItem || draggedItem === dragOverItem) {
      return;
    }
    
    const itemsCopy = [...items];
    const draggedItemIndex = itemsCopy.findIndex(item => item.id === draggedItem);
    const dragOverItemIndex = itemsCopy.findIndex(item => item.id === dragOverItem);
    
    // Reorder the items
    const [movedItem] = itemsCopy.splice(draggedItemIndex, 1);
    itemsCopy.splice(dragOverItemIndex, 0, movedItem);
    
    // Call the onReorder callback with the new order of IDs
    onReorder(itemsCopy.map(item => item.id));
    
    // Reset state
    setDraggedItem(null);
    setDragOverItem(null);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };
  
  return (
    <ul className="sortable-list">
      {items.map(item => (
        <li
          key={item.id}
          className={`sortable-item ${draggedItem === item.id ? 'dragging' : ''} ${dragOverItem === item.id ? 'drag-over' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        >
          <div className="drag-handle">
            &#8942;&#8942;
          </div>
          <div className="sortable-content">
            {item.content}
          </div>
        </li>
      ))}
    </ul>
  );
}; 