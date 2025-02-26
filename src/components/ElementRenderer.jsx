import React from 'react';

// Component to render different element types
export function ElementRenderer({ element, styles }) {
  const style = styles || {};
  
  switch(element.type) {
    case 'h1':
      return <h1 key={element.id} id={element.id} style={style}>{element.content}</h1>;
    case 'p':
      return <p key={element.id} id={element.id} style={style}>{element.content}</p>;
    case 'button':
      return <button 
        key={element.id} 
        id={element.id} 
        style={style} 
        className={element.className}
      >
        {element.content}
      </button>;
    case 'input':
      return <input 
        key={element.id} 
        id={element.id} 
        placeholder={element.placeholder} 
        type={element.inputType || 'text'} 
        style={style}
        className={element.className}
      />;
    case 'select':
      return (
        <select 
          key={element.id} 
          id={element.id} 
          style={style} 
          className={element.className}
        >
          {element.options?.map(option => (
            <option key={option.value} value={option.value}>{option.text}</option>
          ))}
        </select>
      );
    default:
      return null;
  }
} 