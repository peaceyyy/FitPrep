import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/useTheme';
import AppText from './AppText';

export default function ThemeToggle() {
  const { isDark, setTheme, colors } = useTheme();

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.highlightSubtle }]}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      aria-pressed={isDark}
    >
      <Feather name={isDark ? "moon" : "sun"} size={18} color={colors.brand} style={{ marginRight: 8 }} />
      <AppText style={[styles.iconText, { color: colors.brand }]}>
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
