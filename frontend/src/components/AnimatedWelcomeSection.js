// components/AnimatedWelcomeSection.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const AnimatedWelcomeSection = ({ userName, userAge, userGender }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;


  const welcomeSlides = [
    {
      id: 1,
      illustration: '🌅',
      title: `Welcome back, ${userName || 'Friend'}!`,
      subtitle: 'Ready to achieve your goals today?',
      background: theme.colors.primary,
      backgroundImage: require('../../assets/images/sunrise-wellness.jpg'), 
      gradient: ['rgba(168, 230, 207, 0.8)', 'rgba(168, 230, 207, 0.9)'], 
    },
    {
      id: 2,
      illustration: '💪',
      title: 'Stay Strong!',
      subtitle: 'Every workout brings you closer to your goals',
      background: theme.colors.secondary,
      backgroundImage: require('../../assets/images/workout-motivation.jpg'),
      gradient: ['rgba(208, 232, 255, 0.8)', 'rgba(208, 232, 255, 0.9)'],
    },
    {
      id: 3,
      illustration: '🥗',
      title: 'Nourish Your Body',
      subtitle: 'Healthy choices lead to a healthier you',
      background: theme.colors.accent,
      backgroundImage: require('../../assets/images/healthy-food.jpg'),
      gradient: ['rgba(255, 211, 182, 0.8)', 'rgba(255, 211, 182, 0.9)'],
    },
    {
      id: 4,
      illustration: '💧',
      title: 'Stay Hydrated',
      subtitle: 'Remember to drink water throughout the day',
      background: theme.colors.hydration.water,
      backgroundImage: require('../../assets/images/water-nature.jpg'),
      gradient: ['rgba(184, 212, 240, 0.8)', 'rgba(184, 212, 240, 0.9)'],
    },
    {
      id: 5,
      illustration: '🧘‍♀️',
      title: 'Find Your Balance',
      subtitle: 'Take time for mindfulness and self-care',
      background: theme.colors.purple,
     backgroundImage: require('../../assets/images/meditation-peaceful.jpg'),
      gradient: ['rgba(235, 212, 255, 0.8)', 'rgba(235, 212, 255, 0.9)'],
    },
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      // Fade out current slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change slide
        setCurrentSlide((prev) => (prev + 1) % welcomeSlides.length);
        
        // Reset position and fade in new slide
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [fadeAnim, slideAnim, welcomeSlides.length]);

  const currentSlideData = welcomeSlides[currentSlide];

  const renderSlideContent = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.illustration}>{currentSlideData.illustration}</Text>
      <Text style={styles.title}>{currentSlideData.title}</Text>
      <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>

      {userAge && userGender && (
        <Text style={styles.userInfo}>
          {userAge}y • {userGender}
        </Text>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {currentSlideData.backgroundImage ? (
        <ImageBackground
          source={currentSlideData.backgroundImage}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {/* Gradient overlay */}
          <View style={[styles.gradientOverlay, {
            backgroundColor: currentSlideData.gradient ? 'transparent' : currentSlideData.background
          }]}>
            {currentSlideData.gradient && (
              <View style={[styles.gradient, {
                backgroundColor: currentSlideData.gradient[0],
              }]} />
            )}
            {renderSlideContent()}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.solidBackground, { backgroundColor: currentSlideData.background }]}>
          {renderSlideContent()}
        </View>
      )}

      {/* Slide indicators */}
      <View style={styles.indicators}>
        {welcomeSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentSlide
                  ? theme.colors.text
                  : 'rgba(255, 255, 255, 0.5)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
    minHeight: 180,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    borderRadius: theme.borderRadius.large,
  },
  gradientOverlay: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.large,
  },
  solidBackground: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 1,
  },
  illustration: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.relaxed,
  },
  userInfo: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    fontWeight: theme.typography.weights.medium,
  },
  indicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: theme.spacing.md,
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default AnimatedWelcomeSection;
