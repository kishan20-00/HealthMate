// components/Button.js
import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BodyText } from './Typography';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  style = {},
  textStyle = {},
  animated = true,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        ...theme.animations.spring,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        ...theme.animations.spring,
      }).start();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xxl,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'md';
    }
  };

  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
      },
      accent: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
      },
      error: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
    };
    return variants[variant] || variants.primary;
  };

  const buttonStyle = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    style,
  ];

  const textColor = disabled 
    ? theme.colors.textLight 
    : variant === 'primary' || variant === 'secondary' || variant === 'accent' || variant === 'error'
    ? theme.colors.text
    : theme.colors.text;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        <BodyText 
          size={getTextSize()}
          weight="semibold"
          color={textColor}
          style={textStyle}
        >
          {children}
        </BodyText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
