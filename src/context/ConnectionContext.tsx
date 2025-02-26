import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Connection states
export type ConnectionStatus = 
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'failed'
  | 'closed'
  | 'error';

// State type
interface ConnectionState {
  status: ConnectionStatus;
  error?: string | Error;
}

// Actions
type ConnectionAction = 
  | { type: 'SET_STATUS'; payload: ConnectionStatus; error?: Error | string }
  | { type: 'SET_ERROR'; payload: Error | string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ConnectionState = {
  status: 'initializing'
};

// Create context
const ConnectionContext = createContext<{
  state: ConnectionState;
  dispatch: React.Dispatch<ConnectionAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Create reducer
function connectionReducer(state: ConnectionState, action: ConnectionAction): ConnectionState {
  switch (action.type) {
    case 'SET_STATUS':
      return { 
        ...state, 
        status: action.payload,
        error: action.error !== undefined ? action.error : state.error 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    default:
      return state;
  }
}

// Provider component
export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(connectionReducer, initialState);
  
  return (
    <ConnectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConnectionContext.Provider>
  );
};

// Custom hook
export const useConnection = () => useContext(ConnectionContext); 