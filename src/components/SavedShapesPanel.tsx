import React, { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { getCustomShapes, deleteCustomShape } from '../lib/db';
import { useDiagramStore } from '../store';

interface SavedShape {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderStyle: string;
  borderRadius: number;
}

export function SavedShapesPanel() {
  const [shapes, setShapes] = useState<SavedShape[]>([]);
  const addElement = useDiagramStore((state) => state.addElement);

  useEffect(() => {
    loadShapes();
  }, []);

  async function loadShapes() {
    try {
      const savedShapes = await getCustomShapes();
      setShapes(savedShapes as SavedShape[]);
    } catch (error) {
      console.error('Failed to load shapes:', error);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomShape(id);
      await loadShapes();
    } catch (error) {
      console.error('Failed to delete shape:', error);
    }
  };

  const handleAdd = (shape: SavedShape) => {
    const id = Math.random().toString(36).substr(2, 9);
    addElement({
      id,
      type: shape.type as 'rectangle' | 'circle',
      position: { x: 100, y: 100 },
      width: shape.width,
      height: shape.height,
      text: shape.name,
      style: {
        borderColor: shape.borderColor,
        backgroundColor: shape.backgroundColor,
        borderWidth: shape.borderWidth,
        borderStyle: shape.borderStyle,
        borderRadius: shape.type === 'circle' ? '50%' : `${shape.borderRadius}px`,
      },
    });
  };

  return (
    <div className="absolute right-4 top-[440px] w-64 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-700">Saved Shapes</h3>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {shapes.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No saved shapes yet
          </div>
        ) : (
          shapes.map((shape) => (
            <div
              key={shape.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 border-b"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 border-2 rounded"
                  style={{
                    borderColor: shape.borderColor,
                    backgroundColor: shape.backgroundColor,
                    borderWidth: shape.borderWidth,
                    borderStyle: shape.borderStyle,
                    borderRadius: shape.type === 'circle' ? '50%' : `${shape.borderRadius}px`,
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {shape.name}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleAdd(shape)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Add to canvas"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(shape.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Delete shape"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}