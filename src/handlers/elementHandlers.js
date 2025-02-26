// Helper to find index of an element
export const findElementIndex = (elements, id) => elements.findIndex(el => el.id === id);

// Helper to get a copy of elements array for state updates
export const getElementsCopy = (elements) => JSON.parse(JSON.stringify(elements));

// Create callback handlers for WebRTC functions
export function createElementHandlers(setElements, setElementStyles) {
  return {
    onElementAdd: (newElement) => {
      setElements(prev => [...prev, newElement]);
    },
    
    onElementDelete: (id) => {
      setElements(prev => prev.filter(el => el.id !== id));
    },
    
    onElementStyleChange: (elementId, styles) => {
      setElementStyles(prev => ({
        ...prev,
        [elementId]: {
          ...(prev[elementId] || {}),
          ...styles
        }
      }));
    },
    
    onElementReorder: (elementIds) => {
      setElements(prev => {
        // Reordering based on the provided IDs
        const newElementsOrder = [];
        const elementsCopy = getElementsCopy(prev);
        
        // First add elements in the specified order
        elementIds.forEach(id => {
          const element = elementsCopy.find(el => el.id === id);
          if (element) {
            newElementsOrder.push(element);
          }
        });
        
        // Then add any remaining elements not in the specified order
        elementsCopy.forEach(element => {
          if (!elementIds.includes(element.id)) {
            newElementsOrder.push(element);
          }
        });
        
        return newElementsOrder;
      });
    },
    
    onElementInsert: (newElement, targetId, position) => {
      setElements(prev => {
        const targetIndex = findElementIndex(prev, targetId);
        if (targetIndex === -1) return prev;
        
        const elementsCopy = getElementsCopy(prev);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        
        elementsCopy.splice(insertIndex, 0, newElement);
        return elementsCopy;
      });
    },
    
    onElementMove: (elementId, targetId, position) => {
      setElements(prev => {
        const elementIndex = findElementIndex(prev, elementId);
        const targetIndex = findElementIndex(prev, targetId);
        
        if (elementIndex === -1 || targetIndex === -1) return prev;
        
        const elementsCopy = getElementsCopy(prev);
        const elementToMove = elementsCopy.splice(elementIndex, 1)[0];
        
        if (position === 'before') {
          elementsCopy.splice(targetIndex, 0, elementToMove);
        } else if (position === 'after') {
          elementsCopy.splice(targetIndex + 1, 0, elementToMove);
        }
        // For 'prepend' and 'append' we'd need to handle differently
        
        return elementsCopy;
      });
    },
    
    onListElements: (elements) => {
      // Return a list of all elements on the page
      return elements.map(el => ({
        id: el.id,
        tagName: el.type,
        text: el.content ? (el.content.substring(0, 50) + (el.content.length > 50 ? '...' : '')) : '',
        visible: true
      }));
    },
    
    onGetElementInfo: (elementId, elements) => {
      const element = elements.find(el => el.id === elementId);
      
      if (!element) {
        return { success: false, found: false, error: `Element with ID ${elementId} not found` };
      }
      
      return { 
        success: true, 
        found: true,
        exactMatch: true,
        element: {
          id: element.id,
          tagName: element.type,
          text: element.content ? (element.content.substring(0, 50) + (element.content.length > 50 ? '...' : '')) : ''
        }
      };
    }
  };
} 