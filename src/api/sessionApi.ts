export interface SessionResponse {
  result: {
    id: string;
    webrtc_agent_url: string;
    expires_at: string;
  };
}

export class SessionApi {
  private static instance: SessionApi;
  private baseUrl: string;
  
  private constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  public static getInstance(baseUrl: string = ''): SessionApi {
    if (!SessionApi.instance) {
      SessionApi.instance = new SessionApi(baseUrl);
    }
    return SessionApi.instance;
  }
  
  public async createSession(): Promise<SessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
} 