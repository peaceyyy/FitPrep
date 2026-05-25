import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme';

const tabs = [
  { key: 'adminHome', icon: 'bar-chart-2', label: 'Overview' },
  { key: 'adminMeals', icon: 'grid', label: 'Manage' },
  { key: 'adminOrders', icon: 'file-text', label: 'Orders' },
  { key: 'adminUsers', icon: 'users', label: 'Users' },
];

export default function AdminBottomNav({ active, onChange }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable 
          key={tab.key} 
          style={({ pressed }) => [
            styles.tab,
            pressed && { opacity: 0.75 }
          ]} 
          onPress={() => onChange(tab.key)}
        >
          <Feather 
            name={tab.icon} 
            size={22} 
            color={active === tab.key ? COLORS.brand : COLORS.muted} 
            style={styles.icon} 
          />
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
    marginBottom: 4,
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
