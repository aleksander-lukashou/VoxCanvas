import { ConnectionStatus } from '../context/ConnectionContext';
import { 
  webRTCConfig, 
  dataChannelConfig, 
  mediaConstraints, 
  connectionTimeouts 
} from '../config/webrtc.config';

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  maxRetries?: number;
  retryDelay?: number;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export interface WebRTCCallbacks {
  onElementAdd: (element: any) => void;
  onElementDelete: (id: string) => void;
  onElementStyleChange: (elementId: string, styles: any) => void;
  onElementReorder: (elementIds: string[]) => void;
  onElementInsert: (element: any, targetId: string, position: string) => void;
  onElementMove: (elementId: string, targetId: string, position: string) => void;
  onListElements: () => any[];
  onGetElementInfo: (elementId: string) => any;
  onConnected?: () => void;
  onConnectionStateChange?: (state: ConnectionStatus) => void;
}

// Circuit breaker states
enum CircuitState {
  CLOSED,     // Normal operation
  OPEN,       // Failing, not allowing operations
  HALF_OPEN   // Testing if operations can resume
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private contentElement: HTMLElement;
  private callbacks: WebRTCCallbacks;
  private config: WebRTCConfig;
  private retryCount: number = 0;
  private connectionActive: boolean = false;
  private reconnectTimer: number | null = null;
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(contentElement: HTMLElement, callbacks: WebRTCCallbacks, config: WebRTCConfig = {}) {
    this.contentElement = contentElement;
    this.callbacks = callbacks;
    this.config = {
      // Use iceServers from webRTCConfig as default
      iceServers: config.iceServers || webRTCConfig.iceServers,
      // Use maxRetries from webRTCConfig as default
      maxRetries: config.maxRetries || webRTCConfig.maxRetries,
      // Use retryDelay from webRTCConfig as default
      retryDelay: config.retryDelay || webRTCConfig.retryDelay,
      onStatusChange: config.onStatusChange
    };
  }

  async connect(): Promise<void> {
    // Check circuit breaker
    if (this.circuitState === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      // Use reconnect timeout from connectionTimeouts
      if (timeSinceLastFailure < connectionTimeouts.reconnect * 5) {
        throw new Error('Circuit breaker is open. Too many connection failures.');
      } else {
        // After timeout, move to half-open state to test reconnection
        this.circuitState = CircuitState.HALF_OPEN;
      }
    }

    try {
      this.updateStatus('connecting');
      
      // Create new RTCPeerConnection with configuration from webRTCConfig
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceTransportPolicy: 'all',
        bundlePolicy: webRTCConfig.bundlePolicy,
        rtcpMuxPolicy: webRTCConfig.rtcpMuxPolicy,
        iceCandidatePoolSize: webRTCConfig.iceCandidatePoolSize
      });

      // Set up event listeners
      this.setupConnectionListeners();
      
      // Create data channel
      this.createDataChannel();
      
      // Make sure peerConnection still exists before calling createOffer
      if (!this.peerConnection) {
        throw new Error('PeerConnection was unexpectedly null');
      }
      
      // For development testing, we'll simulate a WebRTC connection without actually connecting
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock WebRTC connection');
        
        // Simulate a successful connection after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.updateStatus('connected');
        if (this.callbacks.onConnected) {
          this.callbacks.onConnected();
        }
        
        return;
      }
      
      // Access user media with constraints from mediaConstraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        stream.getTracks().forEach(track => {
          if (this.peerConnection) {
            this.peerConnection.addTrack(track, stream);
          }
        });
      } catch (mediaError) {
        console.warn('Could not access media devices:', mediaError);
        // Continue without media - might be okay for data-only connections
      }
      
      // Create offer and set local description
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete with timeout from connectionTimeouts
      await this.waitForIceGathering();
      
      // Get the final offer with ICE candidates
      if (!this.peerConnection.localDescription) {
        throw new Error('Failed to create local description');
      }
      
      // Try to get session info
      try {
        const sessionResponse = await this.startSession();
        const serverUrl = sessionResponse.result.webrtc_agent_url;
        
        // Send offer to server
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'offer',
            sdp: this.peerConnection.localDescription.sdp
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        // Get answer from server
        const answer = await response.json();
        
        // Set remote description
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Mark connection as active
        this.connectionActive = true;
        
        // Reset retry count on successful connection
        this.retryCount = 0;
        
        // Reset circuit breaker on success
        this.circuitState = CircuitState.CLOSED;
        this.failureCount = 0;
      } catch (error) {
        console.error('Error during connection setup:', error);
        throw error;
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.updateStatus('failed');
      
      // Handle failure via circuit breaker pattern
      this.handleConnectionFailure();
      
      throw error;
    }
  }
  
  private handleConnectionFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    
    // If too many failures in a short time, open circuit breaker
    if (this.failureCount >= 3) {
      this.circuitState = CircuitState.OPEN;
    }
    
    // Attempt reconnection if within retry limits
    if (this.retryCount < (this.config.maxRetries || webRTCConfig.maxRetries)) {
      this.retryCount++;
      this.updateStatus('failed');
      
      // Schedule retry with delay from config
      this.reconnectTimer = window.setTimeout(
        () => this.connect(),
        this.config.retryDelay || webRTCConfig.retryDelay
      );
    } else {
      // If exceeded max retries, stay in failed state
      this.updateStatus('failed');
    }
  }

  private async startSession(): Promise<any> {
    try {
      // For development testing - if no actual session endpoint exists
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: using mock session');
        return {
          result: {
            id: 'mock-session-' + Date.now(),
            webrtc_agent_url: 'wss://echo.websocket.org', // Echo server for testing
            expires_at: new Date(Date.now() + 3600000).toISOString()
          }
        };
      }

      const response = await fetch('/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        this.updateStatus('failed');
        throw new Error(`Session initialization failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Session start error:', error);
      this.updateStatus('failed');
      throw error;
    }
  }

  private setupConnectionListeners(): void {
    if (!this.peerConnection) return;
    
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      
      console.log('Connection state changed:', this.peerConnection.connectionState);
      
      switch (this.peerConnection.connectionState) {
        case 'connected':
          this.updateStatus('connected');
          if (this.callbacks.onConnected) {
            this.callbacks.onConnected();
          }
          break;
        case 'disconnected':
        case 'failed':
          this.updateStatus('failed');
          this.handleConnectionFailure();
          break;
        case 'closed':
          this.updateStatus('closed');
          break;
      }
    };
    
    // Add explicit iceConnectionState handler for better connection monitoring
    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      console.log('ICE connection state changed:', this.peerConnection.iceConnectionState);
      
      if (this.peerConnection.iceConnectionState === 'failed') {
        this.updateStatus('failed');
        this.handleConnectionFailure();
      }
    };
    
    this.peerConnection.onicecandidate = (event) => {
      console.log('ICE candidate:', event.candidate);
    };
    
    this.peerConnection.ontrack = (event) => {
      console.log('Track received:', event.track.kind);
      
      if (event.track.kind === 'audio') {
        const audio = document.createElement('audio');
        audio.srcObject = new MediaStream([event.track]);
        audio.autoplay = true;
        
        // Append to content element
        this.contentElement.appendChild(audio);
      }
    };
  }

  private createDataChannel(): void {
    if (!this.peerConnection) return;
    
    // Use dataChannelConfig instead of hardcoded values
    this.dataChannel = this.peerConnection.createDataChannel('data', dataChannelConfig);
    
    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };
    
    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
    
    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };
  }

  private async waitForIceGathering(): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('No peer connection available');
    }
    
    // If gathering is already complete, return immediately
    if (this.peerConnection.iceGatheringState === 'complete') {
      return;
    }
    
    // Use timeout from connectionTimeouts
    const timeout = connectionTimeouts.iceGathering;
    
    // Create a promise that resolves when ICE gathering is complete or times out
    return new Promise((resolve, reject) => {
      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          clearTimeout(timeoutId);
          resolve();
        }
      };
      
      const timeoutId = setTimeout(() => {
        if (this.peerConnection?.iceGatheringState !== 'complete') {
          console.warn('ICE gathering timed out, but continuing anyway');
          resolve();
        }
      }, timeout);
      
      this.peerConnection.onicegatheringstatechange = checkState;
      checkState();
    });
  }

  private handleMessage(message: any): void {
    console.log('Received message:', message);
    
    if (message.type === 'function_call') {
      this.handleFunctionCall(message.function_name, message.args || {});
    }
  }

  private handleFunctionCall(name: string, args: any): void {
    console.log(`Function call: ${name}`, args);
    
    try {
      // Route to appropriate callback based on function name
      switch (name) {
        case 'addText':
        case 'addHeading':
        case 'addButton':
        case 'addInput':
        case 'addSelect':
          if (this.callbacks.onElementAdd) {
            this.callbacks.onElementAdd(args);
          }
          break;
        case 'deleteElement':
          if (this.callbacks.onElementDelete) {
            this.callbacks.onElementDelete(args.elementId);
          }
          break;
        case 'changeElementStyle':
          if (this.callbacks.onElementStyleChange) {
            this.callbacks.onElementStyleChange(args.elementId, args.styles);
          }
          break;
        case 'reorderElements':
          if (this.callbacks.onElementReorder) {
            this.callbacks.onElementReorder(args.elementIds);
          }
          break;
        case 'insertElement':
          if (this.callbacks.onElementInsert) {
            this.callbacks.onElementInsert(args.element, args.targetId, args.position);
          }
          break;
        case 'moveElement':
          if (this.callbacks.onElementMove) {
            this.callbacks.onElementMove(args.elementId, args.targetId, args.position);
          }
          break;
        case 'listPageElements':
          if (this.callbacks.onListElements) {
            const elements = this.callbacks.onListElements();
            this.sendResponse(name, { elements });
          }
          break;
        case 'getElementInfo':
          if (this.callbacks.onGetElementInfo) {
            const info = this.callbacks.onGetElementInfo(args.elementId);
            this.sendResponse(name, info);
          }
          break;
        default:
          console.warn(`Unknown function: ${name}`);
      }
    } catch (error) {
      console.error(`Error executing function ${name}:`, error);
    }
  }

  private sendResponse(functionName: string, result: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Cannot send response: data channel not open');
      return;
    }
    
    try {
      this.dataChannel.send(JSON.stringify({
        type: 'function_response',
        function_name: functionName,
        result
      }));
    } catch (error) {
      console.error('Error sending response:', error);
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    console.log('WebRTC status updated:', status);
    if (this.config.onStatusChange) {
      this.config.onStatusChange(status);
    }
    if (this.callbacks.onConnectionStateChange) {
      this.callbacks.onConnectionStateChange(status);
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.updateStatus('closed');
  }
} 