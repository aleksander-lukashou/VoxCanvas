import { useCallback } from 'react';
import { useElements } from '../context/ElementsContext';
import { useStyles } from '../context/StylesContext';
import { generateUniqueId } from '../utils/elementUtils';

export function useElementManagement() {
  const { state: elementsState, dispatch: elementsDispatch } = useElements();
  const { state: stylesState, dispatch: stylesDispatch } = useStyles();
  
  // Add a new element
  const addElement = useCallback((element: any) => {
    const newElement = {
      ...element,
      id: element.id || generateUniqueId(element.type)
    };
    elementsDispatch({ type: 'ADD_ELEMENT', payload: newElement });
  }, [elementsDispatch]);
  
  // Delete an element
  const deleteElement = useCallback((id: string) => {
    elementsDispatch({ type: 'DELETE_ELEMENT', payload: id });
    stylesDispatch({ type: 'DELETE_STYLE', payload: id });
  }, [elementsDispatch, stylesDispatch]);
  
  // Update element style
  const updateElementStyle = useCallback((elementId: string, styles: any) => {
    stylesDispatch({
      type: 'UPDATE_STYLE',
      payload: { elementId, style: styles }
    });
  }, [stylesDispatch]);
  
  // Reorder elements
  const reorderElements = useCallback((elementIds: string[]) => {
    elementsDispatch({ type: 'REORDER_ELEMENTS', payload: elementIds });
  }, [elementsDispatch]);
  
  // Insert an element at a specific position
  const insertElement = useCallback((element: any, targetId: string, position: 'before' | 'after') => {
    const newElement = {
      ...element,
      id: element.id || generateUniqueId(element.type)
    };
    
    elementsDispatch({
      type: 'INSERT_ELEMENT',
      payload: { element: newElement, targetId, position }
    });
  }, [elementsDispatch]);
  
  // Move an element
  const moveElement = useCallback((elementId: string, targetId: string, position: string) => {
    elementsDispatch({
      type: 'MOVE_ELEMENT',
      payload: { elementId, targetId, position }
    });
  }, [elementsDispatch]);
  
  // List all elements
  const listElements = useCallback(() => {
    return elementsState.elements.map(el => ({
      id: el.id,
      tagName: el.type,
      text: el.content ? (el.content.substring(0, 50) + (el.content.length > 50 ? '...' : '')) : '',
      visible: true
    }));
  }, [elementsState.elements]);
  
  // Get element info
  const getElementInfo = useCallback((elementId: string) => {
    const element = elementsState.elements.find(el => el.id === elementId);
    
    if (!element) {
      return {
        success: false,
        found: false,
        error: `Element with ID ${elementId} not found`
      };
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
  }, [elementsState.elements]);
  
  return {
    elements: elementsState.elements,
    styles: stylesState.styles,
    addElement,
    deleteElement,
    updateElementStyle,
    reorderElements,
    insertElement,
    moveElement,
    listElements,
    getElementInfo
  };
} 