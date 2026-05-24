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

export default function LoginScreen({ onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🍽️</Text>
        </View>

        <Text style={styles.brandTitle}>FitFood</Text>
        <Text style={styles.brandSubtitle}>ELITE FUELING</Text>

        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subtext}>Sign in to continue your nutritional journey.</Text>
        
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#7b7f7a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="•••••••••"
              placeholderTextColor="#7b7f7a"
              secureTextEntry={secureEntry}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setSecureEntry((prev) => !prev)}>
              <Text style={styles.eyeIcon}>{secureEntry ? '👁️' : '🙈'}</Text>
            </Pressable>
          </View>
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Pressable 
          style={styles.primaryButton} 
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
          <Text style={styles.primaryButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={[styles.socialButton, styles.socialButtonSpacing]} onPress={() => {}}>
            <Text style={styles.socialEmoji}>🌈</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => {}}>
            <Text style={styles.socialEmoji}></Text>
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.bottomLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>© 2024 FitFood Systems. All Rights Reserved.</Text>
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
    width: 86,
    height: 86,
    backgroundColor: COLORS.brand,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 34,
    color: '#b7de66',
  },
  brandTitle: {
    color: COLORS.brand,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  brandSubtitle: {
    color: '#7b8c75',
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
    color: '#5e6b5a',
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
    backgroundColor: '#eef1e7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
    fontSize: 18,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.brand,
  },
  linkButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  linkText: {
    color: COLORS.accent,
    fontWeight: '700',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d8dccf',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8c9684',
    fontSize: 12,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
  },
  socialButtonSpacing: {
    marginRight: 12,
  },
  socialEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  socialText: {
    fontSize: 15,
    color: COLORS.brand,
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
