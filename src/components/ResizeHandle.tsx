import React from 'react';

interface Props {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ position, onMouseDown }: Props) {
  const positionClasses = {
    'top-left': '-top-1.5 -left-1.5',
    'top-right': '-top-1.5 -right-1.5',
    'bottom-left': '-bottom-1.5 -left-1.5',
    'bottom-right': '-bottom-1.5 -right-1.5',
  };

  const cursorClasses = {
    'top-left': 'cursor-nw-resize',
    'top-right': 'cursor-ne-resize',
    'bottom-left': 'cursor-sw-resize',
    'bottom-right': 'cursor-se-resize',
  };

  return (
    <div
      className={`absolute w-3 h-3 bg-white border-2 border-blue-500 z-10 ${positionClasses[position]} ${cursorClasses[position]}`}
      onMouseDown={onMouseDown}
    />
  );
}