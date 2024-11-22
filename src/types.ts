export interface Position {
  x: number;
  y: number;
}

export interface DiagramElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'connection';
  position: Position;
  text?: string;
  width?: number;
  height?: number;
  from?: string;
  to?: string;
}

export interface DiagramState {
  elements: DiagramElement[];
  selectedElement: string | null;
  connectingFrom: string | null;
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  setConnectingFrom: (id: string | null) => void;
}