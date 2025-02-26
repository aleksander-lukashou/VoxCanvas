// Helper function to generate unique IDs
export function generateUniqueId(prefix = 'element') {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

// Create and export the function definitions
export function createFunctions(callbacks) {
  return {
    getPageHTML: () => {
      return { success: true, html: document.documentElement.outerHTML };
    },
    
    changeBackgroundColor: ({ color }) => {
      document.body.style.backgroundColor = color;
      return { success: true, color };
    },
    
    changeTextColor: ({ color }) => {
      document.body.style.color = color;
      return { success: true, color };
    },
    
    addText: ({ text, elementId }) => {
      const newElement = {
        id: elementId || generateUniqueId('text'),
        type: 'p',
        content: text
      };
      
      callbacks.onElementAdd(newElement);
      return { success: true, createdElementId: newElement.id };
    },
    
    addButton: ({ text, elementId, buttonId, className }) => {
      const newElement = {
        id: buttonId || generateUniqueId('button'),
        type: 'button',
        content: text,
        className: className
      };
      
      callbacks.onElementAdd(newElement);
      return { success: true, buttonId: newElement.id };
    },
    
    addInputField: ({ placeholder, type, elementId, inputId, className }) => {
      const newElement = {
        id: inputId || generateUniqueId('input'),
        type: 'input',
        inputType: type || 'text',
        placeholder: placeholder,
        className: className
      };
      
      callbacks.onElementAdd(newElement);
      return { success: true, inputId: newElement.id };
    },
    
    addDropdownMenu: ({ options, elementId, selectId, className }) => {
      const newElement = {
        id: selectId || generateUniqueId('select'),
        type: 'select',
        options: options,
        className: className
      };
      
      callbacks.onElementAdd(newElement);
      return { success: true, selectId: newElement.id };
    },
    
    changeElementOrder: ({ elementIds }) => {
      if (callbacks.onElementReorder) {
        callbacks.onElementReorder(elementIds);
        return { success: true, newOrder: elementIds };
      }
      return { success: false, error: 'Reordering not supported' };
    },
    
    changeTextStyle: ({ elementId, styles }) => {
      if (callbacks.onElementStyleChange) {
        callbacks.onElementStyleChange(elementId, styles);
        return { success: true, elementId, appliedStyles: styles };
      }
      return { success: false, error: 'Style changing not supported' };
    },
    
    insertElementBefore: ({ newElement, targetId }) => {
      if (callbacks.onElementInsert) {
        const elementToInsert = {
          id: newElement.id || generateUniqueId(newElement.type),
          type: newElement.type === 'text' ? 'p' : newElement.type,
          content: newElement.content,
          className: newElement.className,
          inputType: newElement.inputType,
          placeholder: newElement.placeholder
        };
        
        callbacks.onElementInsert(elementToInsert, targetId, 'before');
        return { success: true, insertedElementId: elementToInsert.id };
      }
      return { success: false, error: 'Insertion not supported' };
    },
    
    insertElementAfter: ({ newElement, targetId }) => {
      if (callbacks.onElementInsert) {
        const elementToInsert = {
          id: newElement.id || generateUniqueId(newElement.type),
          type: newElement.type === 'text' ? 'p' : newElement.type,
          content: newElement.content,
          className: newElement.className,
          inputType: newElement.inputType,
          placeholder: newElement.placeholder
        };
        
        callbacks.onElementInsert(elementToInsert, targetId, 'after');
        return { success: true, insertedElementId: elementToInsert.id };
      }
      return { success: false, error: 'Insertion not supported' };
    },
    
    moveElement: ({ elementId, targetId, position }) => {
      if (callbacks.onElementMove) {
        callbacks.onElementMove(elementId, targetId, position);
        return { success: true, movedElementId: elementId, position };
      }
      return { success: false, error: 'Moving not supported' };
    },
    
    deleteElement: ({ elementId }) => {
      callbacks.onElementDelete(elementId);
      return { success: true, deletedElementId: elementId };
    },
    
    parseAndAddHTML: ({ html, elementId }) => {
      if (callbacks.onHTMLAdd) {
        callbacks.onHTMLAdd(html, elementId);
        return { success: true, elementId };
      }
      return { success: false, error: 'HTML parsing not supported' };
    },
    
    listPageElements: () => {
      if (callbacks.onListElements) {
        const elements = callbacks.onListElements();
        return { 
          success: true, 
          elements: elements,
          count: elements.length
        };
      }
      // Fallback: return elements from the DOM
      const elementsWithIds = document.querySelectorAll('[id]');
      const elementsList = [];
      
      elementsWithIds.forEach(el => {
        elementsList.push({
          id: el.id,
          tagName: el.tagName.toLowerCase(),
          text: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : ''),
          visible: el.offsetParent !== null
        });
      });
      
      return { 
        success: true, 
        elements: elementsList,
        count: elementsList.length
      };
    },
    
    getElementInfo: ({ elementId }) => {
      if (callbacks.onGetElementInfo) {
        return callbacks.onGetElementInfo(elementId);
      }
      
      // Fallback: get info from the DOM
      const element = document.getElementById(elementId);
      
      if (!element) {
        return { success: false, found: false, error: `Element with ID ${elementId} not found` };
      }
      
      return { 
        success: true, 
        found: true,
        exactMatch: true,
        element: {
          id: element.id,
          tagName: element.tagName.toLowerCase(),
          text: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : '')
        }
      };
    }
  };
}

// Export the tool definitions for the WebRTC configuration
export const toolDefinitions = [
  { type: 'function', name: 'getPageHTML', description: 'Gets the HTML for the current page' },
  { 
    type: 'function', 
    name: 'changeBackgroundColor', 
    description: 'Changes the background color of a web page',
    parameters: {
      type: 'object',
      properties: {
        color: { type: 'string', description: 'A hex value of the color' },
      },
    },
  },
  {
    type: 'function',
    name: 'changeTextColor',
    description: 'Changes the text color of a web page',
    parameters: {
      type: 'object',
      properties: {
        color: { type: 'string', description: 'A hex value of the color' },
      },
    },
  },
  {
    type: 'function',
    name: 'addText',
    description: 'Adds a new text paragraph to the page',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text content to add' },
        elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
      },
      required: ['text']
    },
  },
  {
    type: 'function',
    name: 'addButton',
    description: 'Adds a new button to the page',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The button text' },
        elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
        buttonId: { type: 'string', description: 'Optional ID for the button' },
        className: { type: 'string', description: 'Optional CSS class for the button' },
      },
      required: ['text']
    },
  },
  {
    type: 'function',
    name: 'addInputField',
    description: 'Adds a new input field to the page',
    parameters: {
      type: 'object',
      properties: {
        placeholder: { type: 'string', description: 'Placeholder text for the input' },
        type: { type: 'string', description: 'Input type (text, number, email, etc.)' },
        elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
        inputId: { type: 'string', description: 'Optional ID for the input' },
        className: { type: 'string', description: 'Optional CSS class for the input' },
      }
    },
  },
  {
    type: 'function',
    name: 'addDropdownMenu',
    description: 'Adds a dropdown menu to the page',
    parameters: {
      type: 'object',
      properties: {
        options: { 
          type: 'array', 
          description: 'Array of options for the dropdown',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', description: 'Option value' },
              text: { type: 'string', description: 'Option display text' }
            }
          }
        },
        elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
        selectId: { type: 'string', description: 'Optional ID for the select element' },
        className: { type: 'string', description: 'Optional CSS class for the select element' },
      },
      required: ['options']
    },
  },
  {
    type: 'function',
    name: 'changeElementOrder',
    description: 'Changes the order of elements on the page',
    parameters: {
      type: 'object',
      properties: {
        elementIds: { 
          type: 'array', 
          description: 'Array of element IDs in the desired order',
          items: { type: 'string' }
        }
      },
      required: ['elementIds']
    },
  },
  {
    type: 'function',
    name: 'deleteElement',
    description: 'Deletes an element from the page',
    parameters: {
      type: 'object',
      properties: {
        elementId: { 
          type: 'string', 
          description: 'ID of the element to delete' 
        }
      },
      required: ['elementId']
    }
  },
  {
    type: 'function',
    name: 'listPageElements',
    description: 'Lists all elements with IDs on the page',
  },
  // Add other tool definitions as needed
]; 