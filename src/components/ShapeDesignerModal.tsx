import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDiagramStore } from '../store';
import { saveCustomShape } from '../lib/db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShapeDesignerModal({ isOpen, onClose }: Props) {
  const addElement = useDiagramStore((state) => state.addElement);
  const [shapeName, setShapeName] = useState('');
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle'>('rectangle');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [borderColor, setBorderColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [borderRadius, setBorderRadius] = useState(0);

  const resetForm = () => {
    setShapeName('');
    setShapeType('rectangle');
    setWidth(100);
    setHeight(100);
    setBorderColor('#000000');
    setBackgroundColor('#ffffff');
    setBorderWidth(2);
    setBorderStyle('solid');
    setBorderRadius(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = Math.random().toString(36).substr(2, 9);
    const element = {
      id,
      type: shapeType,
      position: { x: 100, y: 100 },
      width,
      height,
      text: shapeName || undefined,
      style: {
        borderColor,
        backgroundColor,
        borderWidth,
        borderStyle,
        borderRadius: shapeType === 'circle' ? '50%' : `${borderRadius}px`,
      },
    };

    // Add to canvas
    addElement(element);

    // Save to database
    try {
      await saveCustomShape({
        name: shapeName || 'Untitled Shape',
        type: shapeType,
        width,
        height,
        borderColor,
        backgroundColor,
        borderWidth,
        borderStyle,
        borderRadius,
      });
    } catch (error) {
      console.error('Failed to save shape:', error);
    }

    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Design New Shape</h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Shape Name</label>
            <input
              type="text"
              value={shapeName}
              onChange={(e) => setShapeName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="My Custom Shape"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Shape Type</label>
            <select
              value={shapeType}
              onChange={(e) => setShapeType(e.target.value as 'rectangle' | 'circle')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="10"
                max="500"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="10"
                max="500"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Color</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Color</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Width</label>
              <input
                type="number"
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                min="0"
                max="10"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Style</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value as 'solid' | 'dashed' | 'dotted')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>

          {shapeType === 'rectangle' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Radius</label>
              <input
                type="number"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                min="0"
                max="50"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <div
                style={{
                  width: Math.min(width, 200),
                  height: Math.min(height, 200),
                  borderColor,
                  backgroundColor,
                  borderWidth,
                  borderStyle,
                  borderRadius: shapeType === 'circle' ? '50%' : `${borderRadius}px`,
                }}
                className="border"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Shape
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}