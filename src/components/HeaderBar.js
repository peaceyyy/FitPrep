import AppText from './AppText';
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BrandMark from './BrandMark';
import { useTheme } from '../context/useTheme';
import { TYPOGRAPHY } from '../theme';

export default function HeaderBar({ title, onBack, action }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={colors.brand} style={styles.icon} />
        </Pressable>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BrandMark size={38} style={styles.headerLogo} />
        </View>
      )}

      <AppText style={styles.title}>{title}</AppText>

      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={action.label || 'Header action'}
        >
          <Feather name={action.icon} size={20} color={colors.brand} style={styles.icon} />
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  title: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconButtonPressed: {
    opacity: 0.65,
  },
  icon: {
    fontSize: 18,
    color: colors.brand,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  headerLogo: {
    marginHorizontal: 5,
  },
});
