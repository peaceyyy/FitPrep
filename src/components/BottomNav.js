import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

const tabs = [
  { key: 'home', label: 'HOME', icon: '🏠' },
  { key: 'orders', label: 'ORDERS', icon: '🧾' },
  { key: 'tracking', label: 'TRACK', icon: '📍' },
  { key: 'profile', label: 'PROFILE', icon: '👤' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={styles.tab}
        >
          <Text style={[styles.icon, active === tab.key && styles.activeText]}>{tab.icon}</Text>
          <Text style={[styles.label, active === tab.key && styles.activeText]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#e1e7d9',
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    width: 96,
  },
  icon: {
    fontSize: 18,
    marginBottom: 4,
    color: COLORS.muted,
  },
  label: {
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
  activeText: {
    color: COLORS.brand,
    fontWeight: '700',
  },
});
