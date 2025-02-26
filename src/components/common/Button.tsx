import React from 'react';
import { useTheme } from './ThemeProvider';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  
  const buttonClasses = [
    'ui-button',
    `ui-button-${variant}`,
    `ui-button-${size}`,
    fullWidth ? 'ui-button-full-width' : '',
    `theme-${theme}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}; 