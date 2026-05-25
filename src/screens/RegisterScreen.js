import AppText from '../components/AppText';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme';
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <AppText style={styles.backArrow}>←</AppText>
          </Pressable>
          <AppText style={styles.brandTitle}>FitFood</AppText>
          <View style={styles.iconPlaceholder} />
        </View>

        <AppText style={styles.heading}>Create Account</AppText>
        <AppText style={styles.subtext}>Join the community of high-performance nutrition.</AppText>

        {errorMsg ? <AppText style={styles.errorText}>{errorMsg}</AppText> : null}

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Full Name</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="John Doe"
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>Email Address</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="john@fitfood.com"
            placeholderTextColor={COLORS.textTertiary}
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
            placeholderTextColor={COLORS.textTertiary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText style={styles.fieldLabel}>GCash Number</AppText>
          <TextInput
            style={styles.inputSolo}
            placeholder="0992 867 7722 (Default)"
            placeholderTextColor={COLORS.textTertiary}
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
                color={goal === item ? COLORS.accent : COLORS.muted}
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
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setSecurePassword((prev) => !prev)}>
                <Feather name={securePassword ? 'eye' : 'eye-off'} size={18} color={COLORS.muted} style={styles.eyeIcon} />
              </Pressable>
            </View>
          </View>
          <View style={styles.halfInputGroup}>
            <AppText style={styles.fieldLabel}>Confirm</AppText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry={secureConfirm}
                value={confirm}
                onChangeText={setConfirm}
              />
              <Pressable onPress={() => setSecureConfirm((prev) => !prev)}>
                <Feather name={secureConfirm ? 'eye' : 'eye-off'} size={18} color={COLORS.muted} style={styles.eyeIcon} />
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
              // Mock auth fallback if Supabase not configured
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
          <TouchableOpacity onPress={onBack}>
            <AppText style={styles.bottomLink}> Login</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30,
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
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.brand,
  },
  iconPlaceholder: {
    width: 34,
    height: 34,
  },
  brandTitle: {
    color: COLORS.brand,
    fontSize: 18,
    fontWeight: '800',
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
  inputSolo: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.brand,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.brand,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  goalButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalButtonSpacing: {
    marginRight: 10,
  },
  goalButtonActive: {
    backgroundColor: '#edf7c4',
    borderColor: COLORS.accent,
  },
  goalIcon: {
    marginBottom: 6,
  },
  goalLabel: {
    color: COLORS.brand,
    fontSize: 13,
    fontWeight: '700',
  },
  goalLabelActive: {
    color: COLORS.brand,
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
});
