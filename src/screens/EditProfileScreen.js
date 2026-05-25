import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function EditProfileScreen({ section, user, onSave, onBack }) {
  const [name, setName] = useState(user.name);
  const [contactNumber, setContactNumber] = useState(user.contactNumber || '');
  const [address, setAddress] = useState(user.address || '');

  useEffect(() => {
    setName(user.name);
    setContactNumber(user.contactNumber || '');
    setAddress(user.address || '');
  }, [user, section]);

  const handleSave = () => {
    onSave({
      ...user,
      name,
      contactNumber,
      address,
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
            <View style={styles.readonlyField}>
              <AppText style={styles.readonlyText}>{user.email || 'Not provided'}</AppText>
            </View>
            <AppText style={styles.helpText}>Email is managed by your login account.</AppText>

            <AppText style={styles.fieldLabel}>GCash Number</AppText>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="09XX XXX XXXX"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="phone-pad"
            />

            <AppText style={styles.fieldLabel}>Delivery Address</AppText>
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

        {section !== 'Personal Information' && (
          <AppText style={styles.helpText}>This profile setting now lives in Personal Information.</AppText>
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
  readonlyField: {
    backgroundColor: '#f4f7ef',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readonlyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
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
