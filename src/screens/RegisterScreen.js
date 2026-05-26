import AppText from '../components/AppText';
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import BrandMark from '../components/BrandMark';
import { TYPOGRAPHY, COLORS } from '../theme';
import { useTheme } from '../context/useTheme';
import { supabase } from '../lib/supabaseClient';

const GOAL_ICONS = { cutting: 'trending-down', bulking: 'trending-up', maintain: 'minus' };

export default function RegisterScreen({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [gcash, setGcash] = useState('');
  const [goal, setGoal] = useState('bulking');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const colors = COLORS;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to login"
          >
            <AppText style={styles.backArrow}>←</AppText>
          </Pressable>
          <AppText style={styles.brandTitle}>FitFood</AppText>
          <BrandMark size={34} />
        </View>

        <AppText style={styles.heading}>Create Account</AppText>
        <AppText style={styles.subtext}>Join the community of high-performance nutrition.</AppText>

        {errorMsg ? <AppText style={styles.errorText}>{errorMsg}</AppText> : null}

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Full Name</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="John Doe"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Email Address</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="john@fitfood.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Delivery Address</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="USC Talamban Campus (Default)"
            placeholderTextColor={colors.textTertiary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>GCash Number</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="0992 867 7722 (Default)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            value={gcash}
            onChangeText={setGcash}
          />
        </View>

        <AppText style={styles.fieldLabel}>Fitness Goal</AppText>
        <View style={styles.goalRow}>
          {['cutting', 'bulking', 'maintain'].map((item, index) => (
            <Pressable
              key={item}
              style={({ pressed }) => [
                styles.goalButton,
                index < 2 && styles.goalButtonSpacing,
                goal === item && styles.goalButtonActive,
                pressed && { opacity: 0.75 }
              ]}
              onPress={() => setGoal(item)}
            >
              <Feather
                name={GOAL_ICONS[item]}
                size={18}
                color={goal === item ? colors.accent : colors.muted}
                style={styles.goalIcon}
              />
              <AppText style={[styles.goalLabel, goal === item && styles.goalLabelActive]}>
                {item.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.halfInputGroup, styles.rowInputSpacing]}>
            <AppText style={styles.fieldLabel}>Password</AppText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setSecurePassword((prev) => !prev)}>
                <Feather name={securePassword ? 'eye' : 'eye-off'} size={18} color={colors.muted} style={styles.eyeIcon} />
              </Pressable>
            </View>
          </View>
          <View style={styles.halfInputGroup}>
            <AppText style={styles.fieldLabel}>Confirm</AppText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={secureConfirm}
                value={confirm}
                onChangeText={setConfirm}
              />
              <Pressable onPress={() => setSecureConfirm((prev) => !prev)}>
                <Feather name={secureConfirm ? 'eye' : 'eye-off'} size={18} color={colors.muted} style={styles.eyeIcon} />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.75 }]} 
          onPress={async () => {
            if (password !== confirm) {
              setErrorMsg('Passwords do not match');
              return;
            }
            setLoading(true);
            setErrorMsg('');
            if (!supabase) {
              setTimeout(() => {
                setErrorMsg('Supabase not configured. Could not sign up.');
                setLoading(false);
              }, 1000);
              return;
            }
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name,
                  goal: goal,
                  address: address || 'USC Talamban Campus',
                  gcash_number: gcash || '0992 867 7722',
                }
              }
            });
            
            setLoading(false);
            
            if (error) {
              setErrorMsg(error.message);
            } else {
              Alert.alert(
                'Registration Successful',
                'Your account has been created. If email confirmation is required, please check your inbox before logging in.',
                [{ text: 'OK', onPress: onBack }]
              );
            }
          }}
          disabled={loading}
        >
          <AppText style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Create Account'}</AppText>
        </Pressable>

        <View style={styles.bottomRow}>
          <AppText style={styles.bottomText}>Already have an account?</AppText>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
            accessibilityRole="button"
            accessibilityLabel="Go to login"
          >
            <AppText style={styles.bottomLink}> Login</AppText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30,
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
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: colors.brand,
  },
  brandTitle: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
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
  inputSolo: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: TYPOGRAPHY.base,
    color: colors.brand,
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
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: colors.brand,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.semibold,
    fontSize: TYPOGRAPHY.sm,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  goalButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalButtonSpacing: {
    marginRight: 10,
  },
  goalButtonActive: {
    backgroundColor: colors.highlight,
    borderColor: colors.accent,
  },
  goalIcon: {
    marginBottom: 6,
  },
  goalLabel: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  goalLabelActive: {
    color: colors.brand,
  },
  rowInputs: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  halfInputGroup: {
    flex: 1,
  },
  rowInputSpacing: {
    marginRight: 12,
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
});
