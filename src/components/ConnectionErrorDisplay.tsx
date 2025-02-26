import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ErrorType } from '../services/errorService';

interface ConnectionErrorDisplayProps {
  className?: string;
}

const ConnectionErrorDisplay: React.FC<ConnectionErrorDisplayProps> = ({ className }) => {
  const { errors, clearErrors } = useAppContext();
  
  // Filter to only show connection errors
  const connectionErrors = errors.filter(error => 
    error.type === ErrorType.CONNECTION || error.type === ErrorType.SIGNALING
  );
  
  if (connectionErrors.length === 0) {
    return null;
  }
  
  return (
    <div className={`connection-error ${className || ''}`}>
      <h3>Connection Error</h3>
      <ul>
        {connectionErrors.map((error, index) => (
          <li key={index}>
            {error.message}
            <span className="error-time">
              {error.timestamp.toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
      <button onClick={clearErrors}>Dismiss</button>
    </div>
  );
};

export default ConnectionErrorDisplay; 