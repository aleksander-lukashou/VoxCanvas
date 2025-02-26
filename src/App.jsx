import React, { useEffect, useRef, useState } from 'react';
import { setupWebRTC } from './webrtc';

function App() {
  const [elements, setElements] = useState([
    { id: 'title', type: 'h1', content: 'This is a plain old website' },
    { id: 'text-field', type: 'p', content: 'This is example of text field' }
  ]);
  const [status, setStatus] = useState('Initializing...');
  
  const contentRef = useRef(null);
  
  useEffect(() => {
    // Setup WebRTC connection when component mounts
    if (contentRef.current) {
      try {
        setStatus('Connecting to microphone...');
        setupWebRTC(contentRef.current, {
          onElementAdd: (newElement) => {
            setElements(prev => [...prev, newElement]);
          },
          onElementDelete: (id) => {
            setElements(prev => prev.filter(el => el.id !== id));
          },
        });
        
        // Add event listeners to track WebRTC connection status
        navigator.mediaDevices.addEventListener('devicechange', () => {
          console.log('Media devices changed');
        });
      } catch (error) {
        console.error('Error setting up WebRTC:', error);
        setStatus(`Error: ${error.message}`);
      }
    }
  }, []);

  return (
    <div className="app">
      <div className="status-bar">Connection status: {status}</div>
      <div className="content" ref={contentRef}>
        {elements.map(element => {
          switch(element.type) {
            case 'h1':
              return <h1 key={element.id} id={element.id}>{element.content}</h1>;
            case 'p':
              return <p key={element.id} id={element.id}>{element.content}</p>;
            case 'button':
              return <button key={element.id} id={element.id}>{element.content}</button>;
            case 'input':
              return <input key={element.id} id={element.id} placeholder={element.placeholder} type={element.inputType || 'text'} />;
            case 'select':
              return (
                <select key={element.id} id={element.id}>
                  {element.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.text}</option>
                  ))}
                </select>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

export default App;
