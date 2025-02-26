// Error types for better error identification
export enum ErrorType {
  CONNECTION = 'CONNECTION',
  PERMISSION = 'PERMISSION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

// Custom application error
export class AppError extends Error {
  type: ErrorType;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    
    // This is needed for instanceof to work correctly with custom errors
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Helper function to categorize errors
export function categorizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
  
  if (errorMessage.includes('getUserMedia') || errorMessage.includes('permission')) {
    return new AppError(errorMessage, ErrorType.PERMISSION);
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection') || 
      errorMessage.includes('ICE') || errorMessage.includes('STUN')) {
    return new AppError(errorMessage, ErrorType.NETWORK);
  }
  
  return new AppError(errorMessage);
}

// Global error handler
export function setupGlobalErrorHandling(): void {
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // You could send this to a monitoring service like Sentry
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could send this to a monitoring service like Sentry
  });
} 