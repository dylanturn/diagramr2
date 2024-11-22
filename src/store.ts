import { create } from 'zustand';
import { DiagramState, DiagramElement } from './types';

export const useDiagramStore = create<DiagramState>((set) => ({
  elements: [],
  selectedElement: null,
  connectingFrom: null,
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),
  setSelectedElement: (id) => set({ selectedElement: id }),
  setConnectingFrom: (id) => set({ connectingFrom: id }),
}));