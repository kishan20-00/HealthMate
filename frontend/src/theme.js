// theme.js - Pastel Color Theme Configuration
// This file is kept for backward compatibility
// New components should use useTheme() hook from ThemeContext

// STATIC THEME OBJECT - ONLY FOR BACKWARD COMPATIBILITY
// All new components should use useTheme() hook instead
export const theme = {
  colors: {
    primary: '#A8E6CF',      // Mint green
    secondary: '#B8D4F0',    // Light blue
    accent: '#FFD3A5',       // Peach
    purple: '#E1BEE7',       // Lavender
    white: '#FFFFFF',
    background: '#F8FFFE',   // Very light mint
    text: '#2C3E50',         // Dark blue-gray
    textLight: '#7F8C8D',    // Light gray
    success: '#A8E6CF',      // Mint
    warning: '#FFD3A5',      // Peach
    error: '#FFB3BA',        // Light pink
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.08)',

    // BMI Colors
    bmi: {
      underweight: '#FFD3A5',  // Peach
      normal: '#A8E6CF',       // Mint
      overweight: '#FFD3A5',   // Peach
      obese: '#FFB3BA',        // Light pink
    },

    // Hydration colors
    hydration: {
      water: '#B8D4F0',        // Light blue
      progress: '#A8E6CF',     // Mint
      background: '#F0F8FF',   // Very light blue
    },
  },

  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
    round: 50,
  },

  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
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

// Helper functions for consistent styling
// DEPRECATED: These functions are no longer used and cause theme reference errors
// All components now use useTheme() hook from ThemeContext

// export const createShadow = (level = 'small') => theme.shadows[level];

// export const createCard = (backgroundColor = theme.colors.card) => ({
//   backgroundColor,
//   borderRadius: theme.borderRadius.medium,
//   padding: theme.spacing.lg,
//   ...theme.shadows.small,
// });

// export const createButton = (variant = 'primary') => {
//   const variants = {
//     primary: {
//       backgroundColor: theme.colors.primary,
//       color: theme.colors.text,
//     },
//     secondary: {
//       backgroundColor: theme.colors.secondary,
//       color: theme.colors.text,
//     },
//     accent: {
//       backgroundColor: theme.colors.accent,
//       color: theme.colors.text,
//     },
//     error: {
//       backgroundColor: theme.colors.error,
//       color: theme.colors.text,
//     },
//   };

//   return {
//     ...variants[variant],
//     padding: theme.spacing.lg,
//     borderRadius: theme.borderRadius.medium,
//     alignItems: 'center',
//     justifyContent: 'center',
//     ...theme.shadows.small,
//   };
// };

// Animation helper functions
// DEPRECATED: These functions are no longer used and cause theme reference errors
// All components now use useTheme() hook from ThemeContext

// export const createFadeInAnimation = (duration = theme.animations.duration.normal) => ({
//   from: { opacity: 0 },
//   to: { opacity: 1 },
//   duration,
// });

// export const createSlideInAnimation = (direction = 'up', duration = theme.animations.duration.normal) => {
//   const directions = {
//     up: { from: { translateY: 50 }, to: { translateY: 0 } },
//     down: { from: { translateY: -50 }, to: { translateY: 0 } },
//     left: { from: { translateX: -50 }, to: { translateX: 0 } },
//     right: { from: { translateX: 50 }, to: { translateX: 0 } },
//   };

//   return {
//     ...directions[direction],
//     duration,
//   };
// };

// export const createScaleAnimation = (duration = theme.animations.duration.normal) => ({
//   from: { scale: 0.8 },
//   to: { scale: 1 },
//   duration,
// });

// Typography helper functions
// export const createTextStyle = (size = 'md', weight = 'normal', color = theme.colors.text) => ({
//   fontSize: theme.typography.sizes[size],
//   fontWeight: theme.typography.weights[weight],
//   color,
//   lineHeight: theme.typography.sizes[size] * theme.typography.lineHeights.normal,
// });

// export const createHeadingStyle = (level = 1) => {
//   const sizes = {
//     1: 'hero',
//     2: 'title',
//     3: 'xxxl',
//     4: 'xxl',
//     5: 'xl',
//     6: 'lg',
//   };

//   return createTextStyle(sizes[level], 'bold', theme.colors.text);
// };
