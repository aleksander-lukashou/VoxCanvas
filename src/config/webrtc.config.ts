export const webRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  maxRetries: 3,
  retryDelay: 2000,
  iceCandidatePoolSize: 10,
  sdpSemantics: 'unified-plan',
  bundlePolicy: 'max-bundle' as RTCBundlePolicy,
  rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
};

export const dataChannelConfig = {
  ordered: true,
  maxRetransmits: 3
};

export const mediaConstraints = {
  audio: true,
  video: false
};

export const connectionTimeouts = {
  iceGathering: 5000,
  connection: 15000,
  reconnect: 1000
}; 