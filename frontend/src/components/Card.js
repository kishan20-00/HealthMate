// components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AnimatedView from './AnimatedView';

const Card = ({
  children,
  style = {},
  animated = true,
  animation = 'fadeIn',
  delay = 0,
  padding,
  margin = 0,
  backgroundColor,
  borderRadius,
  shadow = 'small',
  ...props
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      padding: padding || theme.spacing.lg,
      margin,
      backgroundColor: backgroundColor || theme.colors.card,
      borderRadius: borderRadius || theme.borderRadius.medium,
      ...theme.shadows[shadow],
    },
    style,
  ];

  if (animated) {
    return (
      <AnimatedView 
        style={cardStyle} 
        animation={animation} 
        delay={delay}
        {...props}
      >
        {children}
      </AnimatedView>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base card styles are applied through props
  },
});

export default Card;
