import React, { useState } from 'react';
import { Trash2, Eye, EyeOff, Group, Ungroup, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { useDiagramStore } from '../store';
import { DiagramElement } from '../types';

interface LayerItemProps {
  element: DiagramElement;
  selectedElements: string[];
  draggedItem: string | null;
  dragOverItem: string | null;
  level?: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
  toggleVisibility: (element: DiagramElement) => void;
  removeElement: (id: string) => void;
}

function LayerItem({
  element,
  selectedElements,
  draggedItem,
  dragOverItem,
  level = 0,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
  toggleVisibility,
  removeElement,
}: LayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { elements } = useDiagramStore();
  const childElements = elements.filter(el => el.groupId === element.id)
    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const hasChildren = element.type === 'group' && childElements.length > 0;

  // Check if any children are visible (for mixed state)
  const hasVisibleChildren = hasChildren && childElements.some(child => !child.isHidden);
  const hasHiddenChildren = hasChildren && childElements.some(child => child.isHidden);
  const isMixedState = hasVisibleChildren && hasHiddenChildren;

  return (
    <div className="select-none">
      <div
        className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ${
          selectedElements.includes(element.id) ? 'bg-blue-50' : ''
        } ${dragOverItem === element.id ? 'border-t-2 border-blue-500' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        draggable
        onDragStart={(e) => onDragStart(e, element.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver(e, element.id)}
        onDrop={(e) => onDrop(e, element.id)}
        onClick={(e) => onClick(e, element.id)}
      >
        {hasChildren ? (
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6" /> // Spacer for alignment
        )}

        <div 
          className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <button
          className={`p-1 hover:bg-gray-200 rounded ${isMixedState ? 'opacity-50' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(element);
          }}
          title={element.isHidden ? 'Show' : 'Hide'}
        >
          {element.isHidden || (hasChildren && !hasVisibleChildren) ? (
            <EyeOff className="w-4 h-4 text-gray-500" />
          ) : (
            <Eye className="w-4 h-4 text-gray-700" />
          )}
        </button>

        <span className="flex-1 text-sm truncate">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          {element.text ? `: ${element.text}` : ''}
          <span className="text-gray-400 text-xs ml-1">({element.zIndex})</span>
        </span>

        <button
          className="p-1 hover:bg-gray-200 rounded text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            removeElement(element.id);
          }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l-2 border-gray-200 ml-6">
          {childElements.map((child) => (
            <LayerItem
              key={child.id}
              element={child}
              selectedElements={selectedElements}
              draggedItem={draggedItem}
              dragOverItem={dragOverItem}
              level={level + 1}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={onClick}
              toggleVisibility={toggleVisibility}
              removeElement={removeElement}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LayersPanel() {
  const { elements, selectedElements, updateElement, removeElement, setSelectedElements, toggleSelectedElement } = useDiagramStore();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedItem) {
      setDragOverItem(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedElement = elements.find(el => el.id === draggedItem);
    const targetElement = elements.find(el => el.id === targetId);
    
    if (!draggedElement || !targetElement) return;

    // Update z-index of dragged element and all elements between
    const oldIndex = draggedElement.zIndex || 0;
    const newIndex = targetElement.zIndex || 0;
    
    elements.forEach(el => {
      if (oldIndex < newIndex) {
        // Moving up
        if ((el.zIndex || 0) <= newIndex && (el.zIndex || 0) > oldIndex) {
          updateElement(el.id, { zIndex: (el.zIndex || 0) - 1 });
        }
      } else {
        // Moving down
        if ((el.zIndex || 0) >= newIndex && (el.zIndex || 0) < oldIndex) {
          updateElement(el.id, { zIndex: (el.zIndex || 0) + 1 });
        }
      }
    });

    updateElement(draggedItem, { zIndex: newIndex });
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleSelectedElement(id);
    } else {
      setSelectedElements([id]);
    }
  };

  const toggleVisibility = (element: DiagramElement) => {
    updateElement(element.id, { isHidden: !element.isHidden });
  };

  const sortedElements = [...elements]
    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
    .filter(el => !el.groupId); // Only show top-level elements

  return (
    <div className="absolute right-4 top-20 w-64 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Layers</h3>
        <div className="flex space-x-1">
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => {
              if (selectedElements.length >= 2) {
                useDiagramStore.getState().groupElements(selectedElements);
              }
            }}
            title="Group selected"
          >
            <Group className="w-4 h-4 text-gray-700" />
          </button>
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => {
              const selectedGroups = selectedElements
                .map(id => elements.find(el => el.id === id))
                .filter(el => el?.type === 'group');
              selectedGroups.forEach(group => {
                if (group) {
                  useDiagramStore.getState().ungroupElements(group.id);
                }
              });
            }}
            title="Ungroup selected"
          >
            <Ungroup className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sortedElements.map((element) => (
          <LayerItem
            key={element.id}
            element={element}
            selectedElements={selectedElements}
            draggedItem={draggedItem}
            dragOverItem={dragOverItem}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            toggleVisibility={toggleVisibility}
            removeElement={removeElement}
          />
        ))}
      </div>
    </div>
  );
}