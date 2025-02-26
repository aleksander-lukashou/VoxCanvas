import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ThemeProvider } from './components/common/ThemeProvider';
import { Button } from './components/common/Button';
import { ElementRenderer } from './components/elements/ElementRenderer';
import { SortableList } from './components/common/SortableList';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionErrorDisplay from './components/ConnectionErrorDisplay';
import { useElements } from './context/ElementsContext';
import { useStyles } from './context/StylesContext';
import { useConnection } from './context/ConnectionContext';
import { useWebRTC } from './hooks/useWebRTC';
import { useElementManagement } from './hooks/useElementManagement';
import { setupGlobalErrorHandling } from './utils/errorHandling';

// Initialize global error handling
setupGlobalErrorHandling();

const App: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { state: elementsState } = useElements();
  const { state: stylesState } = useStyles();
  const { state: connectionState, dispatch: connectionDispatch } = useConnection();
  
  // Element management hooks
  const {
    addElement,
    deleteElement,
    updateElementStyle,
    reorderElements,
    insertElement,
    moveElement,
    listElements,
    getElementInfo
  } = useElementManagement();
  
  // Create WebRTC callbacks
  const webRTCCallbacks = useCallback(() => {
    return {
      onElementAdd: addElement,
      onElementDelete: deleteElement,
      onElementStyleChange: updateElementStyle,
      onElementReorder: reorderElements,
      onElementInsert: insertElement,
      onElementMove: moveElement,
      onListElements: listElements,
      onGetElementInfo: getElementInfo,
      onConnectionStateChange: (status) => {
        connectionDispatch({ type: 'SET_STATUS', payload: status });
      }
    };
  }, [
    addElement, deleteElement, updateElementStyle, reorderElements,
    insertElement, moveElement, listElements, getElementInfo, connectionDispatch
  ]);
  
  // Use WebRTC hook with error handling
  const { status, error, reconnect } = useWebRTC(contentRef, webRTCCallbacks());
  
  // Watch for status changes and update connection context
  useEffect(() => {
    connectionDispatch({ 
      type: 'SET_STATUS', 
      payload: status,
      error: error || undefined
    });
  }, [status, error, connectionDispatch]);
  
  // Handle retry connection
  const handleRetryConnection = useCallback(() => {
    reconnect();
  }, [reconnect]);
  
  // Add a useEffect to check the ref is attached
  useEffect(() => {
    console.log('Content ref is now:', contentRef.current ? 'available' : 'not available');
  }, []);
  
  // Make sure the loading state only renders after a small delay
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (connectionState.status === 'initializing') {
      const timer = setTimeout(() => setShowLoading(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [connectionState.status]);
  
  // Convert elements for the sortable list
  const sortableItems = elementsState.elements.map(element => ({
    id: element.id,
    content: (
      <ElementRenderer 
        element={element} 
        styles={stylesState.styles[element.id]} 
      />
    )
  }));
  
  // Add some dummy data for development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Adding dummy elements');
      
      // Add some initial elements with a delay to simulate server population
      setTimeout(() => {
        addElement({ 
          type: 'h1', 
          content: 'Sample Heading', 
          id: 'heading-1' 
        });
        
        addElement({ 
          type: 'p', 
          content: 'This is a sample paragraph created in development mode.', 
          id: 'paragraph-1' 
        });
        
        addElement({ 
          type: 'button', 
          content: 'Sample Button', 
          id: 'button-1' 
        });
        
        // Add some styles
        updateElementStyle('heading-1', { 
          color: '#2a6496', 
          fontSize: '28px',
          marginBottom: '16px'
        });
      }, 1500);
    }
  }, [addElement, updateElementStyle]);
  
  // Add this to debug ref stability
  useEffect(() => {
    console.log('Content ref updated:', contentRef.current);
    
    // Save reference to ensure it's always available
    if (contentRef.current) {
      window._savedContentElement = contentRef.current;
    }
    
    return () => {
      console.log('Content ref effect cleanup');
      // Don't clear the saved reference on cleanup
    };
  }, [contentRef.current]);
  
  return (
    <ErrorBoundary>
      <ThemeProvider initialTheme="light">
        <div className="app">
          {/* Always render the main content element, but hide it when not needed */}
          <main className="content" ref={contentRef} style={{ 
            display: connectionState.status === 'initializing' || 
                     connectionState.status === 'failed' || 
                     connectionState.status === 'error' ? 'none' : 'block' 
          }}>
            <SortableList 
              items={sortableItems} 
              onReorder={reorderElements} 
            />
          </main>

          {/* Conditionally render UI overlay elements */}
          {connectionState.status === 'initializing' && showLoading ? (
            <div className="connection-loading overlay">
              <h3>Connecting to server...</h3>
              <div className="loading-spinner"></div>
              <p>This may take a few moments...</p>
            </div>
          ) : connectionState.status === 'failed' || connectionState.status === 'error' ? (
            <div className="error-overlay overlay">
              <ConnectionErrorDisplay 
                error={connectionState.error || error} 
                onRetry={handleRetryConnection} 
              />
            </div>
          ) : (
            <header className="app-header">
              <div className="status-indicator">
                Connection status: {connectionState.status}
              </div>
              <div className="controls">
                <Button 
                  variant="primary" 
                  onClick={() => addElement({ 
                    type: 'p', 
                    content: 'New paragraph added at ' + new Date().toLocaleTimeString() 
                  })}
                >
                  Add Paragraph
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => connectionState.status !== 'connected' ? reconnect() : null}
                  disabled={connectionState.status === 'connected'}
                >
                  Reconnect
                </Button>
              </div>
            </header>
          )}
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 