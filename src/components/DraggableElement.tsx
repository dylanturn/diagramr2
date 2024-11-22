import React, { useRef, useState, useEffect } from 'react';
import { DiagramElement } from '../types';
import { useDiagramStore } from '../store';
import { ResizeHandle } from './ResizeHandle';
import { ContextMenu } from './ContextMenu';

interface Props {
  element: DiagramElement;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (id: string, event: React.MouseEvent) => void;
  isConnectMode: boolean;
}

export function DraggableElement({
  element,
  isSelected,
  isConnecting,
  onSelect,
  isConnectMode,
}: Props) {
  const { updateElement, elements } = useDiagramStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const elementStartSize = useRef({ width: 0, height: 0 });

  // Get parent element if it exists
  const parentElement = element.parentId ? elements.find(el => el.id === element.parentId) : null;

  // Calculate absolute position based on parent hierarchy
  const getAbsolutePosition = (el: DiagramElement): { x: number; y: number } => {
    let pos = { ...el.position };
    let current = elements.find(e => e.id === el.parentId);
    
    while (current) {
      pos.x += current.position.x;
      pos.y += current.position.y;
      current = elements.find(e => e.id === current?.parentId);
    }
    
    return pos;
  };

  // Convert absolute position to relative position based on parent
  const getRelativePosition = (absoluteX: number, absoluteY: number): { x: number; y: number } => {
    if (!parentElement) {
      return { x: absoluteX, y: absoluteY };
    }

    const parentAbs = getAbsolutePosition(parentElement);
    return {
      x: absoluteX - parentAbs.x,
      y: absoluteY - parentAbs.y,
    };
  };

  const absolutePosition = getAbsolutePosition(element);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isConnectMode) {
      onSelect(element.id, e);
      return;
    }

    if (e.button === 0) { // Left click
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      elementStartPos.current = { ...absolutePosition };
      onSelect(element.id, e);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    if (isResizing && resizeHandle) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      let newWidth = elementStartSize.current.width;
      let newHeight = elementStartSize.current.height;
      let newAbsoluteX = elementStartPos.current.x;
      let newAbsoluteY = elementStartPos.current.y;

      if (resizeHandle.includes('right')) {
        newWidth = Math.max(50, elementStartSize.current.width + dx);
      }
      if (resizeHandle.includes('left')) {
        const widthDiff = Math.min(dx, elementStartSize.current.width - 50);
        newWidth = elementStartSize.current.width - widthDiff;
        newAbsoluteX = elementStartPos.current.x + widthDiff;
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(50, elementStartSize.current.height + dy);
      }
      if (resizeHandle.includes('top')) {
        const heightDiff = Math.min(dy, elementStartSize.current.height - 50);
        newHeight = elementStartSize.current.height - heightDiff;
        newAbsoluteY = elementStartPos.current.y + heightDiff;
      }

      const newPos = getRelativePosition(newAbsoluteX, newAbsoluteY);
      updateElement(element.id, {
        width: newWidth,
        height: newHeight,
        position: newPos,
      });
    } else if (isDragging) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      const newAbsoluteX = elementStartPos.current.x + dx;
      const newAbsoluteY = elementStartPos.current.y + dy;

      const newPos = getRelativePosition(newAbsoluteX, newAbsoluteY);
      updateElement(element.id, { position: newPos });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleResizeStart = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...absolutePosition };
    elementStartSize.current = {
      width: element.width || 100,
      height: element.height || 100,
    };
  };

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

  const elementStyle = {
    width: element.width,
    height: element.height,
    zIndex: element.zIndex || 1,
    ...element.style,
  };

  const renderResizeHandles = () => {
    if (!isSelected || element.type === 'text') return null;

    return (
      <>
        <ResizeHandle position="top-left" onMouseDown={(e) => handleResizeStart('top-left', e)} />
        <ResizeHandle position="top-right" onMouseDown={(e) => handleResizeStart('top-right', e)} />
        <ResizeHandle position="bottom-left" onMouseDown={(e) => handleResizeStart('bottom-left', e)} />
        <ResizeHandle position="bottom-right" onMouseDown={(e) => handleResizeStart('bottom-right', e)} />
      </>
    );
  };

  return (
    <>
      <div
        data-element-id={element.id}
        className={`${baseClasses} ${
          element.type === 'circle' ? 'rounded-full' : ''
        } bg-white border-2`}
        style={{
          ...elementStyle,
          left: absolutePosition.x,
          top: absolutePosition.y,
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        {element.text && (
          <div className="w-full h-full flex items-center justify-center">
            {element.text}
          </div>
        )}
        {renderResizeHandles()}
        {element.parentId && (
          <div className="absolute -top-5 left-0 text-xs text-gray-500">
            ↳ Child of {elements.find(el => el.id === element.parentId)?.text || element.parentId}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={element.id}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}