// screens/SettingsScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { AnimatedView, Card, Heading, BodyText, Caption } from "./components";

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const settingsOptions = [
    {
      id: 'theme',
      title: 'Theme Settings',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Pastel Mode',
          subtitle: 'Switch between light and dark pastel themes',
          type: 'switch',
          value: isDarkMode,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'dailyReminders',
          title: 'Daily Reminders',
          subtitle: 'Get reminded to log your daily activities',
          type: 'switch',
          value: true,
          onToggle: () => {},
        },
        {
          id: 'weeklyCheckins',
          title: 'Weekly Check-ins',
          subtitle: 'Receive weekly lifestyle assessment reminders',
          type: 'switch',
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Manage your data and privacy preferences',
          type: 'navigation',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingContent}>
          <BodyText style={styles.settingTitle}>{item.title}</BodyText>
          <Caption style={styles.settingSubtitle}>{item.subtitle}</Caption>
        </View>

        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary
            }}
            thumbColor={item.value ? theme.colors.card : theme.colors.textLight}
          />
        )}

        {item.type === 'navigation' && (
          <Text style={[styles.chevron, { color: theme.colors.textLight }]}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AnimatedView animation="fadeIn" duration={600}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Heading level={2} style={styles.title}>Settings</Heading>
          <Caption style={styles.headerSubtitle}>
            Customize your HealthMate experience
          </Caption>
        </View>
        

        <View style={styles.content}>
          {settingsOptions.map((section) => (
            <Card key={section.id} style={styles.sectionCard} animated={true} delay={200}>
              <BodyText style={styles.sectionTitle}>{section.title}</BodyText>
              {section.items.map(renderSettingItem)}
            </Card>
          ))}

          <Card style={styles.infoCard} animated={true} delay={400}>
            <Heading level={4} style={styles.infoTitle}>Theme Preview</Heading>
            <BodyText style={styles.infoText}>
              {isDarkMode
                ? "🌙 Dark Pastel Mode: Night-friendly, calm, and cozy with deep navy backgrounds and soft glowing accents."
                : "☀️ Light Pastel Mode: Morning fresh and positive with mint, peach, baby blue, and lavender colors."
              }
            </BodyText>

            <View style={styles.colorPreview}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]} />
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.purple }]} />
            </View>
          </Card>
        </View>
      </AnimatedView>
    </ScrollView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    color: '#2B2D42',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#2B2D42',
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 0,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    opacity: 0.7,
  },
  chevron: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    marginTop: 8,
  },
  infoTitle: {
    marginBottom: 12,
  },
  infoText: {
    lineHeight: 22,
    marginBottom: 16,
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 4,
  },
});

export default SettingsScreen;
