// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Light Pastel Theme (Default)
const lightPastelTheme = {
  colors: {
    // Primary colors
    primary: '#A8E6CF',      // Mint green
    secondary: '#D0E8FF',    // Baby Blue (updated)
    accent: '#FFD3B6',       // Peach (updated)
    purple: '#EBD4FF',       // Lavender (updated)
    
    // Background colors
    background: '#FFFFFF',   // White
    card: '#FFFFFF',
    surface: '#F8F9FA',
    
    // Text colors
    text: '#2B2D42',
    textLight: '#6C757D',
    textSecondary: '#495057',
    
    // Status colors
    success: '#A8E6CF',
    warning: '#FFD3B6',
    error: '#FFB3BA',
    info: '#D0E8FF',
    
    // Border and divider
    border: '#E9ECEF',
    divider: '#DEE2E6',
    
    // BMI colors
    bmi: {
      underweight: '#FFD3B6',
      normal: '#A8E6CF',
      overweight: '#FFD3B6',
      obese: '#FFB3BA',
    },
    
    // Hydration colors
    hydration: {
      water: '#D0E8FF',
      progress: '#A8E6CF',
      background: '#F0F8FF',
    },
  },
  isDark: false,
};

// Dark Pastel Theme
const darkPastelTheme = {
  colors: {
    // Primary colors
    primary: '#A8E6CF',      // Mint Glow
    secondary: '#5A6B8C',    // Muted blue-gray
    accent: '#FFD3B6',       // Soft peach
    purple: '#C9B6E4',       // Lavender
    
    // Background colors
    background: '#2B2D42',   // Deep Navy
    card: '#3A3D5C',         // Soft Charcoal
    surface: '#4A4E6B',      // Lighter charcoal
    
    // Text colors
    text: '#F5F5F5',         // Light Text
    textLight: '#B8BCC8',    // Muted light text
    textSecondary: '#9CA3AF',
    
    // Status colors
    success: '#A8E6CF',
    warning: '#FFD3B6',
    error: '#FF8A95',
    info: '#7FB3D3',
    
    // Border and divider
    border: '#4A4E6B',
    divider: '#5A5F7A',
    
    // BMI colors
    bmi: {
      underweight: '#FFD3B6',
      normal: '#A8E6CF',
      overweight: '#FFD3B6',
      obese: '#FF8A95',
    },
    
    // Hydration colors
    hydration: {
      water: '#7FB3D3',
      progress: '#A8E6CF',
      background: '#3A3D5C',
    },
  },
  isDark: true,
};

// Common theme properties (same for both themes)
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    round: 50,
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      title: 28,
      hero: 32,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 800,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    spring: {
      tension: 100,
      friction: 8,
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState({ ...lightPastelTheme, ...commonTheme });

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    const selectedTheme = isDarkMode ? darkPastelTheme : lightPastelTheme;
    setTheme({ ...selectedTheme, ...commonTheme });
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    try {
      await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
