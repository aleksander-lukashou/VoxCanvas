export function setupWebRTC(contentElement, callbacks) {
    // Create a WebRTC Agent
    const peerConnection = new RTCPeerConnection();
  
    // On inbound audio add to page
    peerConnection.ontrack = (event) => {
      const el = document.createElement('audio');
      el.srcObject = event.streams[0];
      el.autoplay = el.controls = true;
      document.body.appendChild(el);
    };
  
    const dataChannel = peerConnection.createDataChannel('oai-events');
    
    // Define all your functions here, but modify them to use React state
    const fns = {
      getPageHTML: () => {
        return { success: true, html: document.documentElement.outerHTML };
      },
      changeBackgroundColor: ({ color }) => {
        document.body.style.backgroundColor = color;
        return { success: true, color };
      },
      changeTextColor: ({ color }) => {
        document.body.style.color = color;
        return { success: true, color };
      },
      addText: ({ text, elementId }) => {
        const newElement = {
          id: elementId || generateUniqueId('text'),
          type: 'p',
          content: text
        };
        
        callbacks.onElementAdd(newElement);
        return { success: true, createdElementId: newElement.id };
      },
      // Convert all your other functions similarly
      // ...
    };
  
    function configureData() {
      console.log('Configuring data channel');
      const event = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          tools: [
            // Your tool definitions
            // ...
          ],
        },
      };
      dataChannel.send(JSON.stringify(event));
    }
  
    // Add this to your setupWebRTC function - PLACE YOUR CODE HERE
    dataChannel.addEventListener('open', (ev) => {
      console.log('Opening data channel', ev);
      configureData();
    });
  
    dataChannel.addEventListener('message', async (ev) => {
      const msg = JSON.parse(ev.data);
      // Handle function calls
      if (msg.type === 'response.function_call_arguments.done') {
        const fn = fns[msg.name];
        if (fn !== undefined) {
          console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
          const args = JSON.parse(msg.arguments);
          const result = await fn(args);
          console.log('result', result);
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
        }
      }
    });
  
    // Capture microphone
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
    });
  
    return peerConnection;
  }
  
  function generateUniqueId(prefix = 'element') {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
  }