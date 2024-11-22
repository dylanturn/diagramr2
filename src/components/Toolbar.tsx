import React, { useState } from 'react';
import { Square, Circle, Type, Plus } from 'lucide-react';
import { useDiagramStore } from '../store';
import { ShapeDesignerModal } from './ShapeDesignerModal';

const tools = [
  { icon: Square, type: 'rectangle', label: 'Rectangle' },
  { icon: Circle, type: 'circle', label: 'Circle' },
  { icon: Type, type: 'text', label: 'Text' },
];

export function Toolbar() {
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const addElement = useDiagramStore((state) => state.addElement);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.setData('application/x-diagram-type', type);
    e.dataTransfer.effectAllowed = 'copy';
    
    const ghostElement = document.createElement('div');
    ghostElement.style.width = '100px';
    ghostElement.style.height = '100px';
    ghostElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    ghostElement.style.border = '2px dashed #666';
    ghostElement.style.borderRadius = type === 'circle' ? '50%' : '0';
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    document.body.appendChild(ghostElement);

    e.dataTransfer.setDragImage(ghostElement, 50, 50);

    requestAnimationFrame(() => {
      document.body.removeChild(ghostElement);
    });
  };

  return (
    <>
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        {tools.map(({ icon: Icon, type, label }) => (
          <div
            key={type}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, type)}
            className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
            title={`Drag ${label} to canvas`}
          >
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        ))}
        <button
          onClick={() => setIsDesignerOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 transition-colors"
          title="Create custom shape"
        >
          <Plus className="w-6 h-6 text-gray-700" />
        </button>
        <div className="px-2 py-1 text-xs text-gray-500 border-t">
          Hold 'C' to connect
        </div>
      </div>

      <ShapeDesignerModal
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
      />
    </>
  );
}