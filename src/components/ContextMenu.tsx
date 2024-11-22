import React from 'react';
import { useDiagramStore } from '../store';

interface Props {
  x: number;
  y: number;
  elementId: string;
  onClose: () => void;
}

export function ContextMenu({ x, y, elementId, onClose }: Props) {
  const { elements, setParent } = useDiagramStore();
  const currentElement = elements.find(el => el.id === elementId);
  
  // Filter out invalid parent candidates:
  // - The element itself
  // - Current children of the element
  // - The current element's parent (to avoid circular relationships)
  const potentialParents = elements.filter(el => {
    if (el.id === elementId) return false;
    if (el.parentId === elementId) return false;
    if (el.id === currentElement?.parentId) return false;
    if (el.type === 'connection') return false;
    return true;
  });

  const handleSetParent = (parentId?: string) => {
    setParent(elementId, parentId);
    onClose();
  };

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      <div className="text-sm text-gray-700 px-3 py-1 font-medium border-b">
        Set Parent
      </div>
      <div className="max-h-48 overflow-y-auto">
        <button
          className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 text-gray-600"
          onClick={() => handleSetParent(undefined)}
        >
          None (Remove Parent)
        </button>
        {potentialParents.map(parent => (
          <button
            key={parent.id}
            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 text-gray-600"
            onClick={() => handleSetParent(parent.id)}
          >
            {parent.text || `${parent.type} ${parent.id.slice(0, 4)}`}
          </button>
        ))}
      </div>
    </div>
  );
}