import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types for our elements
export interface ElementOption {
  value: string;
  text: string;
}

export interface Element {
  id: string;
  type: string;
  content?: string;
  className?: string;
  placeholder?: string;
  inputType?: string;
  options?: ElementOption[];
}

// State type
interface ElementsState {
  elements: Element[];
}

// Actions
type ElementsAction = 
  | { type: 'ADD_ELEMENT'; payload: Element }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'REORDER_ELEMENTS'; payload: string[] }
  | { type: 'INSERT_ELEMENT'; payload: { element: Element; targetId: string; position: 'before' | 'after' } }
  | { type: 'MOVE_ELEMENT'; payload: { elementId: string; targetId: string; position: string } }
  | { type: 'RESET_ELEMENTS'; payload?: Element[] };

// Initial state
const initialState: ElementsState = {
  elements: [
    { id: 'title', type: 'h1', content: 'This is a plain old website' },
    { id: 'text-field', type: 'p', content: 'This is example of text field' }
  ]
};

// Create context
const ElementsContext = createContext<{
  state: ElementsState;
  dispatch: React.Dispatch<ElementsAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Helper function to find element index
const findElementIndex = (elements: Element[], id: string): number => 
  elements.findIndex(el => el.id === id);

// Create a reducer function
function elementsReducer(state: ElementsState, action: ElementsAction): ElementsState {
  switch (action.type) {
    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload]
      };
      
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload)
      };
      
    case 'REORDER_ELEMENTS': {
      const newElementsOrder: Element[] = [];
      const elementsCopy = [...state.elements];
      
      // First add elements in the specified order
      action.payload.forEach(id => {
        const element = elementsCopy.find(el => el.id === id);
        if (element) {
          newElementsOrder.push(element);
        }
      });
      
      // Then add any remaining elements not in the specified order
      elementsCopy.forEach(element => {
        if (!action.payload.includes(element.id)) {
          newElementsOrder.push(element);
        }
      });
      
      return {
        ...state,
        elements: newElementsOrder
      };
    }
    
    case 'INSERT_ELEMENT': {
      const { element, targetId, position } = action.payload;
      const targetIndex = findElementIndex(state.elements, targetId);
      
      if (targetIndex === -1) return state;
      
      const elementsCopy = [...state.elements];
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      
      elementsCopy.splice(insertIndex, 0, element);
      
      return {
        ...state,
        elements: elementsCopy
      };
    }
    
    case 'MOVE_ELEMENT': {
      const { elementId, targetId, position } = action.payload;
      const elementIndex = findElementIndex(state.elements, elementId);
      const targetIndex = findElementIndex(state.elements, targetId);
      
      if (elementIndex === -1 || targetIndex === -1) return state;
      
      const elementsCopy = [...state.elements];
      const elementToMove = elementsCopy.splice(elementIndex, 1)[0];
      
      if (position === 'before') {
        elementsCopy.splice(targetIndex, 0, elementToMove);
      } else if (position === 'after') {
        elementsCopy.splice(targetIndex + 1, 0, elementToMove);
      }
      
      return {
        ...state,
        elements: elementsCopy
      };
    }
    
    case 'RESET_ELEMENTS':
      return {
        ...state,
        elements: action.payload || initialState.elements
      };
      
    default:
      return state;
  }
}

// Create a provider component
export const ElementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(elementsReducer, initialState);
  
  return (
    <ElementsContext.Provider value={{ state, dispatch }}>
      {children}
    </ElementsContext.Provider>
  );
};

// Create a custom hook to use the elements context
export const useElements = () => useContext(ElementsContext); 