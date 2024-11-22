import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDiagramStore } from '../store';
import { DiagramElement, Position } from '../types';
import { DraggableElement } from './DraggableElement';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { 
    elements, 
    selectedElement, 
    connectingFrom,
    setSelectedElement,
    setConnectingFrom,
    addElement,
    removeElement 
  } = useDiagramStore();

  // Global keyboard event listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && !e.repeat) {
        e.preventDefault();
        setIsConnectMode(true);
        // Clear connecting state when entering connect mode
        setConnectingFrom(null);
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        removeElement(selectedElement);
        setSelectedElement(null);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsConnectMode(false);
        setConnectingFrom(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [selectedElement, removeElement, setSelectedElement, setConnectingFrom]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const type = e.dataTransfer.getData('application/x-diagram-type') || 
                e.dataTransfer.getData('text/plain');
    
    if (!type) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const id = Math.random().toString(36).substr(2, 9);
    const element = {
      id,
      type: type as 'rectangle' | 'circle' | 'text',
      position: {
        x: e.clientX - rect.left - 50,
        y: e.clientY - rect.top - 50,
      },
      width: type === 'text' ? undefined : 100,
      height: type === 'text' ? undefined : 100,
      text: type === 'text' ? 'Double click to edit' : undefined,
    };

    addElement(element);
  };

  const handleElementSelect = useCallback((id: string) => {
    if (!isConnectMode) {
      setSelectedElement(id);
      return;
    }

    // In connect mode
    if (!connectingFrom) {
      // First shape selection in connect mode
      setConnectingFrom(id);
      setSelectedElement(id);
    } else if (connectingFrom !== id) {
      // Second shape selection - create connection
      const connectionId = Math.random().toString(36).substr(2, 9);
      addElement({
        id: connectionId,
        type: 'connection',
        from: connectingFrom,
        to: id,
        position: { x: 0, y: 0 },
      });
      // Clear connecting state but maintain connect mode
      setConnectingFrom(null);
    }
  }, [isConnectMode, connectingFrom, setSelectedElement, setConnectingFrom, addElement]);

  const getElementCenter = (element: DiagramElement): Position => {
    return {
      x: element.position.x + (element.width || 0) / 2,
      y: element.position.y + (element.height || 0) / 2,
    };
  };

  const renderConnection = (element: DiagramElement) => {
    const fromElement = elements.find(el => el.id === element.from);
    const toElement = elements.find(el => el.id === element.to);
    
    if (!fromElement || !toElement) return null;

    const from = getElementCenter(fromElement);
    const to = getElementCenter(toElement);

    const isSelected = selectedElement === element.id;

    return (
      <svg
        key={element.id}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={isSelected ? '#3B82F6' : '#4B5563'}
          strokeWidth={isSelected ? '3' : '2'}
          className="pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleElementSelect(element.id);
          }}
          markerEnd="url(#arrowhead)"
        />
      </svg>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full bg-gray-50 ${isDragOver ? 'bg-blue-50' : ''} outline-none`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.target === canvasRef.current) {
          setSelectedElement(null);
          setConnectingFrom(null);
        }
      }}
      tabIndex={-1}
    >
      {isConnectMode && (
        <div className="fixed top-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-md z-50">
          Connection Mode Active
        </div>
      )}
      {connectingFrom && (
        <div className="fixed top-16 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md z-50">
          Click another shape to connect
        </div>
      )}
      <svg className="absolute" width="0" height="0">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
          </marker>
        </defs>
      </svg>
      {elements.map((element) =>
        element.type === 'connection' ? (
          renderConnection(element)
        ) : (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            isConnecting={connectingFrom === element.id}
            onSelect={handleElementSelect}
            isConnectMode={isConnectMode}
          />
        )
      )}
    </div>
  );
}