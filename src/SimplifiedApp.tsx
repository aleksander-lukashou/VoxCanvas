import React from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import ConnectionErrorDisplay from './components/ConnectionErrorDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider, useAppContext } from './context/AppContext';
import './styles.css';

// Configuration could be imported from a config file
const webRTCConfig = {
  serverUrl: 'wss://your-signaling-server.com',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Inner App component that uses the context
const AppContent: React.FC = () => {
  const { isConnected, isConnecting } = useAppContext();
  
  const { localStream, remoteStream, connect, disconnect } = useWebRTC({
    serverUrl: webRTCConfig.serverUrl,
    iceServers: webRTCConfig.iceServers
  });

  return (
    <div className="app-container">
      <header>
        <h1>WebRTC Video Chat</h1>
      </header>
      
      <main>
        <div className="video-container">
          <div className="video-wrapper">
            {localStream && (
              <video
                className="local-video"
                autoPlay
                muted
                playsInline
                ref={video => {
                  if (video && localStream) {
                    video.srcObject = localStream;
                  }
                }}
              />
            )}
            
            {remoteStream && (
              <video
                className="remote-video"
                autoPlay
                playsInline
                ref={video => {
                  if (video && remoteStream) {
                    video.srcObject = remoteStream;
                  }
                }}
              />
            )}
          </div>
          
          <ConnectionErrorDisplay className="error-overlay" />
        </div>
        
        <div className="controls">
          <button 
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={isConnected ? 'disconnect-btn' : 'connect-btn'}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </main>
    </div>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App; 