import React, { useRef, useState } from 'react';
import { DiagramElement } from '../types';
import { useDiagramStore } from '../store';

interface Props {
  element: DiagramElement;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (id: string) => void;
  isConnectMode: boolean;
}

export function DraggableElement({ element, isSelected, isConnecting, onSelect, isConnectMode }: Props) {
  const { updateElement } = useDiagramStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isConnectMode) {
      onSelect(element.id);
      return;
    }

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...element.position };
    onSelect(element.id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    updateElement(element.id, {
      position: {
        x: elementStartPos.current.x + dx,
        y: elementStartPos.current.y + dy,
      },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDoubleClick = () => {
    if (!isConnectMode && element.type === 'text') {
      const newText = prompt('Enter text:', element.text);
      if (newText !== null) {
        updateElement(element.id, { text: newText });
      }
    }
  };

  const baseClasses = `absolute select-none ${
    isSelected ? 'ring-2 ring-blue-500' : ''
  } ${isConnecting ? 'ring-2 ring-green-500' : ''} ${
    isDragging ? 'cursor-grabbing' : isConnectMode ? 'cursor-pointer' : 'cursor-grab'
  }`;

  const commonProps = {
    onMouseDown: handleMouseDown,
    onDoubleClick: handleDoubleClick,
    style: {
      left: element.position.x,
      top: element.position.y,
      width: element.width,
      height: element.height,
      zIndex: isSelected ? 2 : 1,
    },
  };

  switch (element.type) {
    case 'rectangle':
      return (
        <div
          className={`${baseClasses} bg-white border-2 border-gray-700`}
          {...commonProps}
        />
      );
    case 'circle':
      return (
        <div
          className={`${baseClasses} bg-white border-2 border-gray-700 rounded-full`}
          {...commonProps}
        />
      );
    case 'text':
      return (
        <div
          className={`${baseClasses} min-w-[100px] min-h-[24px] p-2`}
          {...commonProps}
          style={{
            ...commonProps.style,
            width: 'auto',
            height: 'auto',
          }}
        >
          {element.text}
        </div>
      );
    default:
      return null;
  }
}