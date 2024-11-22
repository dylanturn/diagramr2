export interface Position {
  x: number;
  y: number;
}

export interface ShapeStyle {
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: string;
}

export interface DiagramElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'connection' | 'group';
  position: Position;
  text?: string;
  width?: number;
  height?: number;
  from?: string;
  to?: string;
  zIndex?: number;
  isHidden?: boolean;
  groupId?: string;
  parentId?: string; // New: reference to parent shape
  elements?: string[];
  style?: ShapeStyle;
}

export interface DiagramState {
  elements: DiagramElement[];
  selectedElements: string[];
  connectingFrom: string | null;
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElements: (ids: string[]) => void;
  toggleSelectedElement: (id: string) => void;
  setConnectingFrom: (id: string | null) => void;
  groupElements: (elementIds: string[]) => void;
  ungroupElements: (groupId: string) => void;
  setParent: (childId: string, parentId: string | undefined) => void; // New: parent setting function
}