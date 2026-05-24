import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function HeaderBar({ title, onBack, action }) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Text style={styles.icon}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      {action ? (
        <Pressable onPress={action.onPress} style={styles.iconButton}>
          <Text style={styles.icon}>{action.icon}</Text>
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f4f7ef',
  },
  icon: {
    fontSize: 18,
    color: COLORS.brand,
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
  },
});
