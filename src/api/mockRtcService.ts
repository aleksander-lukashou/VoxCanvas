import { ConnectionStatus } from '../context/ConnectionContext';
import { WebRTCCallbacks, WebRTCConfig } from './webrtcService';

/**
 * This is a mock implementation of WebRTCService for development environments
 * It simulates the behavior of WebRTCService without actually connecting to anything
 */
export class MockRTCService {
  private callbacks: WebRTCCallbacks;
  private config: WebRTCConfig;
  private connectionTimer: number | null = null;
  private contentElement: HTMLElement;
  
  constructor(contentElement: HTMLElement, callbacks: WebRTCCallbacks, config: WebRTCConfig = {}) {
    console.log('Using MockRTCService for development');
    this.contentElement = contentElement;
    this.callbacks = callbacks;
    this.config = config;
    
    // Store reference globally as backup
    window._savedContentElement = contentElement;
  }
  
  async connect(): Promise<void> {
    console.log('MockRTCService: Simulating connection...');
    
    // Update status to connecting
    this.updateStatus('connecting');
    
    // Simulate connection delay (1 second)
    return new Promise((resolve) => {
      this.connectionTimer = window.setTimeout(() => {
        console.log('MockRTCService: Connected successfully');
        this.updateStatus('connected');
        
        if (this.callbacks.onConnected) {
          this.callbacks.onConnected();
        }
        
        resolve();
      }, 1000);
    });
  }
  
  disconnect(): void {
    console.log('MockRTCService: Disconnecting');
    
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    this.updateStatus('closed');
  }
  
  private updateStatus(status: ConnectionStatus): void {
    console.log('MockRTCService status updated:', status);
    
    if (this.config.onStatusChange) {
      this.config.onStatusChange(status);
    }
    
    if (this.callbacks.onConnectionStateChange) {
      this.callbacks.onConnectionStateChange(status);
    }
  }
} 