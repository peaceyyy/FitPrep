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
        <Text style={styles.label}>Edit {section}</Text>

        {section === 'Personal Information' && (
          <>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Alex Johnson"
              placeholderTextColor="#7b7f7a"
            />
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="alex@fitfood.com"
              placeholderTextColor="#7b7f7a"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {section === 'Fitness Goals' && (
          <View>
            <Text style={styles.fieldLabel}>Select a goal</Text>
            {goalOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.goalButton, goal === option.value && styles.goalButtonActive]}
                onPress={() => setGoal(option.value)}
              >
                <Text style={[styles.goalButtonText, goal === option.value && styles.goalButtonTextActive]}>{option.label}</Text>
                <Text style={styles.goalDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {section === 'Delivery Address' && (
          <>
            <Text style={styles.fieldLabel}>Shipping Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your delivery address"
              placeholderTextColor="#7b7f7a"
              multiline
              numberOfLines={4}
            />
          </>
        )}

        {section === 'Payment Methods' && (
          <>
            <Text style={styles.fieldLabel}>Default Card</Text>
            <TextInput
              style={styles.input}
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="Visa •••• 1234"
              placeholderTextColor="#7b7f7a"
            />
            <Text style={styles.helpText}>Update your payment card and email billing receipts to your account address.</Text>
          </>
        )}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
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
    backgroundColor: '#eef1e7',
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
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
