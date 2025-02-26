// Helper function to generate unique IDs
export function generateUniqueId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
}

// Helper function to validate element structure
export function validateElement(element: any): boolean {
  // Must have an id and type
  if (!element.id || !element.type) {
    return false;
  }
  
  // Type must be one of the supported types
  const validTypes = ['h1', 'h2', 'h3', 'p', 'button', 'input', 'select'];
  if (!validTypes.includes(element.type)) {
    return false;
  }
  
  // Additional validation based on type
  if (element.type === 'select' && (!element.options || !Array.isArray(element.options))) {
    return false;
  }
  
  return true;
}

// Helper to safely merge styles
export function mergeStyles(baseStyles: Record<string, any> = {}, newStyles: Record<string, any> = {}): Record<string, any> {
  return {
    ...baseStyles,
    ...newStyles
  };
}

// Convert camelCase to kebab-case for CSS properties
export function camelToKebab(input: string): string {
  return input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Convert styles object to CSS string
export function stylesToCssString(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
    .join(' ');
}

// Calculate contrast color (black or white) based on background
export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the formula from WCAG 2.0
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  // Return black for bright colors, white for dark colors
  return luminance > 128 ? 'black' : 'white';
} 