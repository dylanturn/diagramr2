// Using localStorage instead of SQLite for browser compatibility
const STORAGE_KEY = 'custom_shapes';

interface CustomShape {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderStyle: string;
  borderRadius?: number;
  createdAt: string;
}

export async function initDb() {
  // Initialize storage if needed
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export async function saveCustomShape(shape: Omit<CustomShape, 'id' | 'createdAt'>) {
  const shapes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newShape = {
    ...shape,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  
  shapes.push(newShape);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
  return newShape.id;
}

export async function getCustomShapes(): Promise<CustomShape[]> {
  const shapes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return shapes.sort((a: CustomShape, b: CustomShape) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteCustomShape(id: string) {
  const shapes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const filteredShapes = shapes.filter((shape: CustomShape) => shape.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredShapes));
}