import { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCService, WebRTCCallbacks, WebRTCConfig } from '../api/webrtcService';
import { MockRTCService } from '../api/mockRtcService';
import { ConnectionStatus } from '../context/ConnectionContext';
import { reportConnectionError, reportMediaError, reportSignalingError } from '../services/errorService';
import { useAppContext } from '../context/AppContext';

// Use environment variable to determine if in development mode
const IS_DEV_MODE = process.env.NODE_ENV === 'development';

// Define types for our WebRTC hook
interface UseWebRTCOptions {
  serverUrl: string;
  iceServers?: RTCIceServer[];
  mediaConstraints?: MediaStreamConstraints;
}

interface UseWebRTCResult {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWebRTC = (options: UseWebRTCOptions): UseWebRTCResult => {
  const { serverUrl, iceServers = [], mediaConstraints = { video: true, audio: true } } = options;
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  const { setIsConnected, setIsConnecting } = useAppContext();

  // Function to get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      reportMediaError('Failed to access media devices', error);
      throw error;
    }
  }, [mediaConstraints]);

  // Function to create and set up peer connection
  const createPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({ 
        iceServers: iceServers.length > 0 ? iceServers : [{ urls: 'stun:stun.l.google.com:19302' }] 
      });
      
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }));
        }
      };
      
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setIsConnected(false);
          reportConnectionError(`ICE connection state changed to ${pc.iceConnectionState}`);
        }
      };
      
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      peerConnectionRef.current = pc;
      return pc;
    } catch (error) {
      reportConnectionError('Failed to create peer connection', error);
      throw error;
    }
  }, [iceServers, setIsConnected, setIsConnecting]);

  // Function to connect to the signaling server
  const connectToSignalingServer = useCallback(() => {
    return new Promise<WebSocket>((resolve, reject) => {
      try {
        const socket = new WebSocket(serverUrl);
        
        socket.onopen = () => {
          socketRef.current = socket;
          resolve(socket);
        };
        
        socket.onerror = (error) => {
          reportSignalingError('WebSocket connection error', error);
          reject(error);
        };
        
        socket.onclose = () => {
          setIsConnected(false);
          if (socketRef.current === socket) {
            socketRef.current = null;
          }
        };
        
        socket.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            const pc = peerConnectionRef.current;
            
            if (!pc) {
              return;
            }
            
            switch (message.type) {
              case 'offer':
                await pc.setRemoteDescription(new RTCSessionDescription(message));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({
                  type: 'answer',
                  sdp: pc.localDescription
                }));
                break;
                
              case 'answer':
                await pc.setRemoteDescription(new RTCSessionDescription(message));
                break;
                
              case 'ice-candidate':
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                break;
                
              default:
                console.log('Unhandled message type:', message.type);
            }
          } catch (error) {
            reportSignalingError('Error handling WebSocket message', error);
          }
        };
      } catch (error) {
        reportSignalingError('Failed to connect to signaling server', error);
        reject(error);
      }
    });
  }, [serverUrl, setIsConnected]);

  // Function to initiate connection
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Get user media
      const stream = await getUserMedia();
      
      // Create peer connection
      const pc = createPeerConnection();
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Connect to signaling server
      const socket = await connectToSignalingServer();
      
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.send(JSON.stringify({
        type: 'offer',
        sdp: pc.localDescription
      }));
    } catch (error) {
      setIsConnecting(false);
      reportConnectionError('Connection failed', error);
      throw error;
    }
  }, [getUserMedia, createPeerConnection, connectToSignalingServer, setIsConnecting]);

  // Function to disconnect
  const disconnect = useCallback(() => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Close WebSocket connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Clear remote stream
    setRemoteStream(null);
    
    // Update connection state
    setIsConnected(false);
    setIsConnecting(false);
  }, [localStream, setIsConnected, setIsConnecting]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    localStream,
    remoteStream,
    connect,
    disconnect
  };
}; 