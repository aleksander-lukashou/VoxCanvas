import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setupWebRTC } from './webrtc';
import { ElementRenderer } from './components/ElementRenderer';
import { createElementHandlers } from './handlers/elementHandlers';

function App() {
  const [elements, setElements] = useState([
    { id: 'title', type: 'h1', content: 'This is a plain old website' },
    { id: 'text-field', type: 'p', content: 'This is example of text field' }
  ]);
  const [elementStyles, setElementStyles] = useState({});
  const [status, setStatus] = useState('Initializing...');
  
  const contentRef = useRef(null);
  const peerConnectionRef = useRef(null);
  
  // Create element handlers with access to current state
  const getElementHandlers = useCallback(() => {
    const handlers = createElementHandlers(setElements, setElementStyles);
    
    // Add handlers that need access to current elements state
    return {
      ...handlers,
      onListElements: () => handlers.onListElements(elements),
      onGetElementInfo: (elementId) => handlers.onGetElementInfo(elementId, elements)
    };
  }, [elements]);
  
  // Connection state change handler
  const handleConnectionStateChange = useCallback((state) => {
    console.log('Connection state changed:', state);
    if (state === 'connected') {
      setStatus('Connected to OpenAI');
    } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      setStatus(`Disconnected (${state})`);
    } else {
      setStatus(`Connection state: ${state}`);
    }
  }, []);
  
  useEffect(() => {
    // Setup WebRTC connection when component mounts
    if (contentRef.current && !peerConnectionRef.current) {
      try {
        setStatus('Connecting to microphone...');
        
        // Get the element handlers
        const elementHandlers = getElementHandlers();
        
        // Setup WebRTC with all callbacks
        peerConnectionRef.current = setupWebRTC(contentRef.current, {
          ...elementHandlers,
          onConnected: () => {
            setStatus('Connected to OpenAI');
          },
          onConnectionStateChange: handleConnectionStateChange
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

    // Cleanup function to close connections when component unmounts
    return () => {
      if (peerConnectionRef.current) {
        console.log('Closing WebRTC connection...');
        // Close all data channels
        peerConnectionRef.current.getDataChannels?.().forEach(channel => channel.close());
        // Close peer connection
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
        setStatus('Disconnected');
      }
    };
  }, []); // Empty dependency array so it only runs once

  return (
    <div className="app">
      <div className="status-bar">Connection status: {status}</div>
      <div className="content" ref={contentRef}>
        {elements.map(element => (
          <ElementRenderer 
            key={element.id} 
            element={element} 
            styles={elementStyles[element.id]}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
