import { createFunctions, toolDefinitions, generateUniqueId } from './functions';

export function setupWebRTC(contentElement, callbacks) {
    // Create a WebRTC Agent with configuration for better stability
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10
    });
  
    // Track connection state to manage reconnection
    let connectionActive = false;
    let dataChannel = null;
  
    // Import functions from the functions module
    const fns = createFunctions(callbacks);
  
    // Create data channel with better reliability settings
    function createDataChannel() {
      dataChannel = peerConnection.createDataChannel('oai-events', {
        ordered: true,           // Guaranteed delivery order
        maxRetransmits: 3        // Retry up to 3 times before failing
      });
      
      setupDataChannelEventListeners();
      return dataChannel;
    }
  
    function setupDataChannelEventListeners() {
      dataChannel.addEventListener('open', handleDataChannelOpen);
      dataChannel.addEventListener('message', handleDataChannelMessage);
      dataChannel.addEventListener('close', () => {
        console.log('Data channel closed');
        connectionActive = false;
        // Attempt to reconnect after a short delay if disconnect was not intentional
        if (!peerConnection.connectionClosed) {
          setTimeout(() => {
            if (!connectionActive) {
              console.log("Attempting to reestablish data channel");
              createDataChannel();
            }
          }, 2000);
        }
      });
      dataChannel.addEventListener('error', (error) => {
        console.error('Data channel error:', error);
      });
    }
  
    function handleDataChannelOpen(ev) {
      console.log('Opening data channel', ev);
      connectionActive = true;
      configureData();
      if (callbacks.onConnected) {
        callbacks.onConnected();
      }
    }
  
    async function handleDataChannelMessage(ev) {
      try {
        const msg = JSON.parse(ev.data);
        // Handle function calls
        if (msg.type === 'response.function_call_arguments.done') {
          const fn = fns[msg.name];
          if (fn !== undefined) {
            console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
            const args = JSON.parse(msg.arguments);
            const result = await fn(args);
            console.log('result', result);
            
            // Check if connection is still active before sending
            if (dataChannel && dataChannel.readyState === 'open') {
              // Let OpenAI know that the function has been called and share it's output
              const event = {
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: msg.call_id, // call_id from the function_call message
                  output: JSON.stringify(result), // result of the function
                },
              };
              dataChannel.send(JSON.stringify(event));
              // Have assistant respond after getting the results
              dataChannel.send(JSON.stringify({type:"response.create"}));
            } else {
              console.error("Data channel closed, can't send function result");
            }
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    }
  
    // On inbound audio add to page
    peerConnection.ontrack = (event) => {
      const el = document.createElement('audio');
      el.srcObject = event.streams[0];
      el.autoplay = el.controls = true;
      document.body.appendChild(el);
    };
  
    // Create initial data channel
    dataChannel = createDataChannel();
    
    // Add connection state monitoring
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      if (callbacks.onConnectionStateChange) {
        callbacks.onConnectionStateChange(peerConnection.iceConnectionState);
      }
      
      // Handle reconnection on failed/disconnected states
      if (peerConnection.iceConnectionState === 'disconnected' || 
          peerConnection.iceConnectionState === 'failed') {
        connectionActive = false;
        
        // Only try to reconnect if not intentionally closed
        if (!peerConnection.connectionClosed) {
          console.log("Connection issues detected, will try to recover...");
          
          // Try to restart ICE
          peerConnection.restartIce && peerConnection.restartIce();
        }
      } else if (peerConnection.iceConnectionState === 'connected' ||
                 peerConnection.iceConnectionState === 'completed') {
        connectionActive = true;
      }
    };
  
    function configureData() {
      console.log('Configuring data channel');
      const event = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          tools: toolDefinitions,
        },
      };
      dataChannel.send(JSON.stringify(event));
    }
  
    // Capture microphone and establish connection
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Add microphone to PeerConnection
      stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: 'sendrecv' }));

      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        fetch('/session')
          .then((tokenResponse) => tokenResponse.json())
          .then((data) => {
            const EPHEMERAL_KEY = data.result.client_secret.value;
            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = 'gpt-4o-realtime-preview-2024-12-17';
            fetch(`${baseUrl}?model=${model}`, {
              method: 'POST',
              body: offer.sdp,
              headers: {
                Authorization: `Bearer ${EPHEMERAL_KEY}`,
                'Content-Type': 'application/sdp',
              },
            })
              .then((r) => r.text())
              .then((answer) => {
                // Accept answer from Realtime WebRTC API
                peerConnection.setRemoteDescription({
                  sdp: answer,
                  type: 'answer',
                });
              });
          });
      });
    }).catch(error => {
      console.error('Error accessing microphone:', error);
      if (callbacks.onConnectionStateChange) {
        callbacks.onConnectionStateChange('failed');
      }
    });
  
    // Modify the return to include a proper close method
    const originalClose = peerConnection.close;
    peerConnection.close = function() {
      peerConnection.connectionClosed = true;
      if (dataChannel) {
        dataChannel.close();
      }
      originalClose.call(peerConnection);
    };
  
    return peerConnection;
  }