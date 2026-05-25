import AppText from './AppText';
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function HeaderBar({ title, onBack, action }) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Feather name="arrow-left" size={20} color={COLORS.brand} style={styles.icon} />
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <AppText style={styles.title}>{title}</AppText>

      {action ? (
        <Pressable onPress={action.onPress} style={styles.iconButton}>
          <Feather name={action.icon} size={20} color={COLORS.brand} style={styles.icon} />
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
    width: 44,
    height: 44,
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
    width: 44,
    height: 44,
  },
});
