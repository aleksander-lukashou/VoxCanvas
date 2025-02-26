import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  colors: Record<string, string>;
}

const defaultColors = {
  light: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
    border: '#dee2e6',
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107'
  },
  dark: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    background: '#212529',
    text: '#f8f9fa',
    border: '#495057',
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107'
  }
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  colors: defaultColors.light
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  const [theme, setTheme] = useState<string>(initialTheme);
  
  // Get colors based on current theme
  const colors = theme === 'dark' ? defaultColors.dark : defaultColors.light;
  
  // Apply CSS variables to :root when theme changes
  React.useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--color-${name}`, value);
    });
    
    // Add additional CSS variables
    root.style.setProperty('--font-family', 'system-ui, -apple-system, sans-serif');
    root.style.setProperty('--spacing-unit', '8px');
    root.style.setProperty('--border-radius', '4px');
    
    // Set data-theme attribute for more complex selectors
    document.body.dataset.theme = theme;
  }, [theme, colors]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}; 