import React from 'react';
import { Text } from 'react-native';
import { TYPOGRAPHY } from '../theme';

export default function AppText({ style, ...props }) {
  return <Text style={[{ fontFamily: TYPOGRAPHY.fontFamily }, style]} {...props} />;
}
