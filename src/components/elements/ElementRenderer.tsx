import React from 'react';
import { Element } from '../../context/ElementsContext';
import { ElementStyle } from '../../context/StylesContext';

interface ElementRendererProps {
  element: Element;
  styles?: ElementStyle;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, styles = {} }) => {
  switch(element.type) {
    case 'h1':
      return <h1 id={element.id} style={styles}>{element.content}</h1>;
      
    case 'h2':
      return <h2 id={element.id} style={styles}>{element.content}</h2>;
      
    case 'h3':
      return <h3 id={element.id} style={styles}>{element.content}</h3>;
      
    case 'p':
      return <p id={element.id} style={styles}>{element.content}</p>;
      
    case 'button':
      return (
        <button 
          id={element.id} 
          style={styles} 
          className={element.className}
        >
          {element.content}
        </button>
      );
      
    case 'input':
      return (
        <input 
          id={element.id} 
          placeholder={element.placeholder} 
          type={element.inputType || 'text'} 
          style={styles}
          className={element.className}
        />
      );
      
    case 'select':
      return (
        <select 
          id={element.id} 
          style={styles} 
          className={element.className}
        >
          {element.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      );
      
    default:
      return null;
  }
}; 