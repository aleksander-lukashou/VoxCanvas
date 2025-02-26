// Types of errors we might encounter
export enum ErrorType {
  CONNECTION = 'CONNECTION',
  MEDIA = 'MEDIA',
  SIGNALING = 'SIGNALING',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
}

class ErrorService {
  private errors: AppError[] = [];
  private errorListeners: ((error: AppError) => void)[] = [];

  // Report a new error
  reportError(type: ErrorType, message: string, originalError?: any): AppError {
    const error: AppError = {
      type,
      message,
      originalError,
      timestamp: new Date()
    };
    
    this.errors.push(error);
    this.notifyListeners(error);
    
    // Log to console for debugging
    console.error(`[${error.type}] ${error.message}`, originalError);
    
    return error;
  }

  // Add a listener for new errors
  addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  // Remove a listener
  removeErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  // Get all errors
  getErrors(): AppError[] {
    return [...this.errors];
  }

  // Clear all errors
  clearErrors(): void {
    this.errors = [];
  }

  // Notify all listeners of a new error
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

// Export a singleton instance
export const errorService = new ErrorService();

// Helper functions for common error scenarios
export const reportConnectionError = (message: string, originalError?: any) => 
  errorService.reportError(ErrorType.CONNECTION, message, originalError);

export const reportMediaError = (message: string, originalError?: any) => 
  errorService.reportError(ErrorType.MEDIA, message, originalError);

export const reportSignalingError = (message: string, originalError?: any) => 
  errorService.reportError(ErrorType.SIGNALING, message, originalError); 