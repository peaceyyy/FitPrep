import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';

const fitFoodGoLogo = require('../../assets/FitFood GO.jpg');

export default function BrandMark({ size = 36, style }) {
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.28 }, style]}>
      <Image source={fitFoodGoLogo} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
