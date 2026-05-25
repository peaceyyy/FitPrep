import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const goalOptions = [
  { label: 'Cutting', value: 'cutting', description: 'Lean fat loss with high protein.' },
  { label: 'Bulking', value: 'bulking', description: 'Build muscle with surplus calories.' },
  { label: 'Maintain', value: 'maintain', description: 'Keep current weight and energy.' },
];

export default function EditProfileScreen({ section, user, onSave, onBack }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [goal, setGoal] = useState(user.goal || 'bulking');
  const [address, setAddress] = useState(user.address || '482 Fitness Way, Apt 4B, Austin TX');
  const [paymentMethod, setPaymentMethod] = useState(user.paymentMethod || 'Visa •••• 1234');

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setGoal(user.goal || 'bulking');
    setAddress(user.address || '482 Fitness Way, Apt 4B, Austin TX');
    setPaymentMethod(user.paymentMethod || 'Visa •••• 1234');
  }, [user, section]);

  const handleSave = () => {
    onSave({
      ...user,
      name,
      email,
      goal,
      address,
      paymentMethod,
    });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title={section} onBack={onBack} />

      <View style={styles.card}>
        <AppText style={styles.label}>Edit {section}</AppText>

        {section === 'Personal Information' && (
          <>
            <AppText style={styles.fieldLabel}>Full Name</AppText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Alex Johnson"
              placeholderTextColor={COLORS.textTertiary}
            />
            <AppText style={styles.fieldLabel}>Email Address</AppText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="alex@fitfood.com"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {section === 'Fitness Goals' && (
          <View>
            <AppText style={styles.fieldLabel}>Select a goal</AppText>
            {goalOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.goalButton, goal === option.value && styles.goalButtonActive]}
                onPress={() => setGoal(option.value)}
              >
                <AppText style={[styles.goalButtonText, goal === option.value && styles.goalButtonTextActive]}>{option.label}</AppText>
                <AppText style={styles.goalDescription}>{option.description}</AppText>
              </Pressable>
            ))}
          </View>
        )}

        {section === 'Delivery Address' && (
          <>
            <AppText style={styles.fieldLabel}>Shipping Address</AppText>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your delivery address"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
            />
          </>
        )}

        {section === 'Payment Methods' && (
          <>
            <AppText style={styles.fieldLabel}>Default Card</AppText>
            <TextInput
              style={styles.input}
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="Visa •••• 1234"
              placeholderTextColor={COLORS.textTertiary}
            />
            <AppText style={styles.helpText}>Update your payment card and email billing receipts to your account address.</AppText>
          </>
        )}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <AppText style={styles.saveText}>Save Changes</AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.brand,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  goalButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  goalButtonActive: {
    backgroundColor: '#edf7c4',
    borderColor: COLORS.accent,
  },
  goalButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
    marginBottom: 6,
  },
  goalButtonTextActive: {
    color: COLORS.brand,
  },
  goalDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  helpText: {
    color: COLORS.muted,
    marginTop: 12,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  saveText: {
    color: COLORS.surface,
    fontWeight: '800',
    fontSize: 16,
  },
});
