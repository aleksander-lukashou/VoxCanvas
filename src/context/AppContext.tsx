import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { errorService, AppError } from '../services/errorService';

// Define the shape of our application state
interface AppState {
  isConnected: boolean;
  isConnecting: boolean;
  errors: AppError[];
  clearErrors: () => void;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
}

// Create the context with a default value
const AppContext = createContext<AppState | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errors, setErrors] = useState<AppError[]>([]);

  // Subscribe to errors from the error service
  useEffect(() => {
    const handleError = (error: AppError) => {
      setErrors(prev => [...prev, error]);
    };
    
    errorService.addErrorListener(handleError);
    
    return () => {
      errorService.removeErrorListener(handleError);
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
    errorService.clearErrors();
  };

  const value = {
    isConnected,
    isConnecting,
    errors,
    clearErrors,
    setIsConnected,
    setIsConnecting
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 