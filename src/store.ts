import { create } from 'zustand';
import { DiagramState, DiagramElement } from './types';

export const useDiagramStore = create<DiagramState>((set) => ({
  elements: [],
  selectedElements: [],
  connectingFrom: null,
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, { ...element, zIndex: state.elements.length }],
    })),
  updateElement: (id, updates) =>
    set((state) => {
      const updatedElements = state.elements.map((el) => {
        if (el.id === id) {
          // If we're updating visibility of a group, update all children
          if (el.type === 'group' && 'isHidden' in updates) {
            const childElements = state.elements.filter(child => 
              child.groupId === id || child.parentId === id
            );
            childElements.forEach(child => {
              child.isHidden = updates.isHidden;
            });
          }
          return { ...el, ...updates };
        }
        // If parent is hidden, ensure children stay hidden
        if ((el.groupId === id || el.parentId === id) && updates.isHidden) {
          return { ...el, isHidden: true };
        }
        return el;
      });

      return { elements: updatedElements };
    }),
  removeElement: (id) =>
    set((state) => {
      // Remove the element and its children
      const elementsToRemove = new Set([id]);
      state.elements.forEach(el => {
        if (el.parentId === id) elementsToRemove.add(el.id);
      });

      const newElements = state.elements
        .filter((el) => !elementsToRemove.has(el.id) && el.groupId !== id)
        .map((el, index) => ({ ...el, zIndex: index }));

      return {
        elements: newElements,
        selectedElements: state.selectedElements.filter((elId) => !elementsToRemove.has(elId)),
      };
    }),
  setSelectedElements: (ids) => set({ selectedElements: ids }),
  toggleSelectedElement: (id) =>
    set((state) => ({
      selectedElements: state.selectedElements.includes(id)
        ? state.selectedElements.filter((elId) => elId !== id)
        : [...state.selectedElements, id],
    })),
  setConnectingFrom: (id) => set({ connectingFrom: id }),
  groupElements: (elementIds) =>
    set((state) => {
      if (elementIds.length < 2) return state;

      const groupElements = state.elements.filter((el) => elementIds.includes(el.id));
      if (!groupElements.length) return state;

      const bounds = groupElements.reduce(
        (acc, el) => {
          const right = el.position.x + (el.width || 0);
          const bottom = el.position.y + (el.height || 0);
          return {
            left: Math.min(acc.left, el.position.x),
            top: Math.min(acc.top, el.position.y),
            right: Math.max(acc.right, right),
            bottom: Math.max(acc.bottom, bottom),
          };
        },
        {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        }
      );

      const maxZIndex = Math.max(...state.elements.map((el) => el.zIndex || 0));
      const groupId = Math.random().toString(36).substr(2, 9);
      const group: DiagramElement = {
        id: groupId,
        type: 'group',
        position: { x: bounds.left, y: bounds.top },
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
        elements: elementIds,
        zIndex: maxZIndex + 1,
      };

      const updatedElements = [
        ...state.elements.map((el) =>
          elementIds.includes(el.id)
            ? { ...el, groupId, zIndex: maxZIndex + 2 }
            : el
        ),
        group,
      ];

      return {
        elements: updatedElements,
        selectedElements: [groupId],
      };
    }),
  ungroupElements: (groupId) =>
    set((state) => {
      const groupedElements = state.elements.filter((el) => el.groupId === groupId);
      const otherElements = state.elements.filter((el) => el.id !== groupId && el.groupId !== groupId);
      
      const ungroupedElements = groupedElements.map((el) => ({
        ...el,
        groupId: undefined,
        zIndex: otherElements.length + groupedElements.indexOf(el),
      }));
      
      return {
        elements: [...otherElements, ...ungroupedElements],
        selectedElements: ungroupedElements.map(el => el.id),
      };
    }),
  setParent: (childId, parentId) =>
    set((state) => {
      // Don't allow circular parenting
      const wouldCreateCircle = (childId: string, newParentId: string): boolean => {
        let current = newParentId;
        while (current) {
          if (current === childId) return true;
          const parent = state.elements.find(el => el.id === current);
          if (!parent) break;
          current = parent.parentId || '';
        }
        return false;
      };

      if (parentId && wouldCreateCircle(childId, parentId)) {
        console.warn('Circular parenting prevented');
        return state;
      }

      // Update the child's position to be relative to the new parent
      const child = state.elements.find(el => el.id === childId);
      const parent = parentId ? state.elements.find(el => el.id === parentId) : null;
      
      if (!child) return state;

      let newPosition = { ...child.position };
      if (parent) {
        // Convert to relative position
        newPosition = {
          x: child.position.x - parent.position.x,
          y: child.position.y - parent.position.y,
        };
      } else if (child.parentId) {
        // Convert back to absolute position
        const oldParent = state.elements.find(el => el.id === child.parentId);
        if (oldParent) {
          newPosition = {
            x: child.position.x + oldParent.position.x,
            y: child.position.y + oldParent.position.y,
          };
        }
      }

      return {
        elements: state.elements.map(el =>
          el.id === childId
            ? { ...el, parentId, position: newPosition }
            : el
        ),
      };
    }),
}));