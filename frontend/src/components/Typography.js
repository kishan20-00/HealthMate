// components/Typography.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const Heading = ({
  level = 1,
  children,
  color,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const sizes = {
    1: 'hero',
    2: 'title',
    3: 'xxxl',
    4: 'xxl',
    5: 'xl',
    6: 'lg',
  };

  const headingStyle = [
    {
      fontSize: theme.typography.sizes[sizes[level]],
      fontWeight: theme.typography.weights.bold,
      color: color || theme.colors.text,
      lineHeight: theme.typography.sizes[sizes[level]] * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={headingStyle} {...props}>
      {children}
    </Text>
  );
};

export const BodyText = ({
  size = 'md',
  weight = 'normal',
  color,
  children,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const textStyle = [
    {
      fontSize: theme.typography.sizes[size],
      fontWeight: theme.typography.weights[weight],
      color: color || theme.colors.text,
      lineHeight: theme.typography.sizes[size] * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

export const Caption = ({
  children,
  color,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const captionStyle = [
    {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.normal,
      color: color || theme.colors.textLight,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={captionStyle} {...props}>
      {children}
    </Text>
  );
};

export const Label = ({
  children,
  color,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const labelStyle = [
    {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: color || theme.colors.textLight,
      lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={labelStyle} {...props}>
      {children}
    </Text>
  );
};

export const Title = ({
  children,
  color,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const titleStyle = [
    {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semibold,
      color: color || theme.colors.text,
      lineHeight: theme.typography.sizes.xl * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={titleStyle} {...props}>
      {children}
    </Text>
  );
};

export const Subtitle = ({
  children,
  color,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const subtitleStyle = [
    {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.normal,
      color: color || theme.colors.textLight,
      lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.normal,
    },
    style,
  ];

  return (
    <Text style={subtitleStyle} {...props}>
      {children}
    </Text>
  );
};
