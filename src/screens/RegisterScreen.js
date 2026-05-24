import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabaseClient';

export default function RegisterScreen({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.brandTitle}>FitFood</Text>
          <View style={styles.iconPlaceholder} />
        </View>

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subtext}>Join the community of high-performance nutrition.</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.promoCard}>
          <View style={styles.promoOverlay} />
          <Text style={styles.promoBadge}>PREMIUM PREP</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.inputSolo}
            placeholder="John Doe"
            placeholderTextColor="#7b7f7a"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={styles.inputSolo}
            placeholder="john@fitfood.com"
            placeholderTextColor="#7b7f7a"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.fieldLabel}>Fitness Goal</Text>
        <View style={styles.goalRow}>
          {['cutting', 'bulking', 'maintain'].map((item, index) => (
            <Pressable
              key={item}
              style={[
                styles.goalButton,
                index < 2 && styles.goalButtonSpacing,
                goal === item && styles.goalButtonActive,
              ]}
              onPress={() => setGoal(item)}
            >
              <Text style={styles.goalIcon}>
                {item === 'cutting' ? '↘️' : item === 'bulking' ? '↗️' : '⏸️'}
              </Text>
              <Text style={[styles.goalLabel, goal === item && styles.goalLabelActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.halfInputGroup, styles.rowInputSpacing]}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#7b7f7a"
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setSecurePassword((prev) => !prev)}>
                <Text style={styles.eyeIcon}>{securePassword ? '👁️' : '🙈'}</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.halfInputGroup}>
            <Text style={styles.fieldLabel}>Confirm</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#7b7f7a"
                secureTextEntry={secureConfirm}
                value={confirm}
                onChangeText={setConfirm}
              />
              <Pressable onPress={() => setSecureConfirm((prev) => !prev)}>
                <Text style={styles.eyeIcon}>{secureConfirm ? '👁️' : '🙈'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable 
          style={styles.primaryButton} 
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
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name,
                  goal: goal,
                }
              }
            });
            if (error) {
              setErrorMsg(error.message);
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account?</Text>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.bottomLink}> Login</Text>
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
    backgroundColor: '#eef1e7',
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
    color: '#5e6b5a',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  promoCard: {
    width: '100%',
    borderRadius: 22,
    height: 140,
    backgroundColor: '#e8f0db',
    marginBottom: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 14,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 46, 18, 0.08)',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d6f18a',
    color: COLORS.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
    zIndex: 1,
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
    backgroundColor: '#eef1e7',
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
    backgroundColor: '#eef1e7',
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
    fontSize: 18,
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
    fontSize: 16,
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
    color: '#ffffff',
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
