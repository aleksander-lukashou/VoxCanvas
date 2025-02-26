import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types
export interface ElementStyle {
  [key: string]: string | number;
}

interface StylesState {
  styles: {
    [elementId: string]: ElementStyle;
  };
}

// Define actions
type StylesAction = 
  | { type: 'UPDATE_STYLE'; payload: { elementId: string; style: ElementStyle } }
  | { type: 'DELETE_STYLE'; payload: string }
  | { type: 'RESET_STYLES' };

// Initial state
const initialState: StylesState = {
  styles: {}
};

// Create context
const StylesContext = createContext<{
  state: StylesState;
  dispatch: React.Dispatch<StylesAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Create a reducer
function stylesReducer(state: StylesState, action: StylesAction): StylesState {
  switch (action.type) {
    case 'UPDATE_STYLE':
      return {
        ...state,
        styles: {
          ...state.styles,
          [action.payload.elementId]: {
            ...(state.styles[action.payload.elementId] || {}),
            ...action.payload.style
          }
        }
      };
      
    case 'DELETE_STYLE':
      const { [action.payload]: _, ...restStyles } = state.styles;
      return {
        ...state,
        styles: restStyles
      };
      
    case 'RESET_STYLES':
      return {
        ...state,
        styles: {}
      };
      
    default:
      return state;
  }
}

// Provider component
export const StylesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(stylesReducer, initialState);
  
  return (
    <StylesContext.Provider value={{ state, dispatch }}>
      {children}
    </StylesContext.Provider>
  );
};

// Custom hook
export const useStyles = () => useContext(StylesContext); 