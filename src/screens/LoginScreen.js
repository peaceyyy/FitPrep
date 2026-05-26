import AppText from '../components/AppText';
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BrandMark from '../components/BrandMark';
import { TYPOGRAPHY, COLORS } from '../theme';
import { useTheme } from '../context/useTheme';
import { supabase } from '../lib/supabaseClient';

export default function LoginScreen({ onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const colors = COLORS;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <BrandMark size={86} style={styles.logoBadge} />

        <AppText style={styles.brandTitle}>FitFood</AppText>
        <AppText style={styles.brandSubtitle}>ELITE FUELING</AppText>

        <AppText style={styles.heading}>Welcome Back</AppText>
        <AppText style={styles.subtext}>Sign in to continue your nutritional journey.</AppText>
        
        {errorMsg ? <AppText style={styles.errorText}>{errorMsg}</AppText> : null}

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Email Address</AppText>
          <View style={styles.inputRow}>
            <Feather name="mail" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Password</AppText>
          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="•••••••••"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={secureEntry}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setSecureEntry((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={secureEntry ? 'Show password' : 'Hide password'}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Feather name={secureEntry ? 'eye' : 'eye-off'} size={18} color={colors.muted} style={styles.eyeIcon} />
            </Pressable>
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.75 }]} 
          onPress={async () => {
            setLoading(true);
            setErrorMsg('');
            if (!supabase) {
              // Mock auth fallback if Supabase not configured
              setTimeout(() => {
                setErrorMsg('Supabase not configured. Could not sign in.');
                setLoading(false);
              }, 1000);
              return;
            }
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              setErrorMsg(error.message);
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <AppText style={styles.primaryButtonText}>{loading ? 'Signing In...' : 'Sign In'}</AppText>
        </Pressable>

        <View style={styles.bottomRow}>
          <AppText style={styles.bottomText}>Don't have an account?</AppText>
          <Pressable
            onPress={onNavigateRegister}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
            accessibilityRole="button"
            accessibilityLabel="Sign up for an account"
          >
            <AppText style={styles.bottomLink}> Sign up</AppText>
          </Pressable>
        </View>
      </View>

      <AppText style={styles.footer}>© 2024 FitFood Systems. All Rights Reserved.</AppText>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.semibold,
    fontSize: TYPOGRAPHY.sm,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    marginTop: 12,
    ...{
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
  },
  logoBadge: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.xs,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 22,
  },
  heading: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 8,
  },
  subtext: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.base,
    lineHeight: 22,
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: colors.brand,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.sm,
  },
  bottomLink: {
    color: colors.accent,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  footer: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: 14,
    textAlign: 'center',
    width: '100%',
    maxWidth: 420,
  },
});
