import AppText from '../components/AppText';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BrandMark from '../components/BrandMark';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabaseClient';

export default function LoginScreen({ onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
            <Feather name="mail" size={18} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={COLORS.textTertiary}
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
            <Feather name="lock" size={18} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="•••••••••"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry={secureEntry}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setSecureEntry((prev) => !prev)}>
              <Feather name={secureEntry ? 'eye' : 'eye-off'} size={18} color={COLORS.muted} style={styles.eyeIcon} />
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
          <AppText style={styles.bottomText}>Don’t have an account?</AppText>
          <TouchableOpacity onPress={onNavigateRegister}>
            <AppText style={styles.bottomLink}> Sign up</AppText>
          </TouchableOpacity>
        </View>
      </View>

      <AppText style={styles.footer}>© 2024 FitFood Systems. All Rights Reserved.</AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
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
    color: COLORS.brand,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  brandSubtitle: {
    color: COLORS.textTertiary,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 22,
  },
  heading: {
    color: COLORS.brand,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtext: {
    color: COLORS.textTertiary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: 16,
    color: COLORS.brand,
  },
  primaryButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: '#7c846f',
    fontSize: 14,
  },
  bottomLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    color: '#8c9684',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
    width: '100%',
    maxWidth: 420,
  },
});
