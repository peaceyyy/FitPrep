import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, Modal, FlatList } from 'react-native';
import AppText from '../components/AppText';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { profilesService } from '../services/profilesService';
import { fetchPublishedPlans, getCurrentWeekStartDate } from '../services/plansService';
import { adminGrantDemoAccess } from '../services/ordersService';

export default function AdminUserDetailsScreen({ profileId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    setLoading(true);
    const data = await profilesService.getProfile(profileId);
    setProfile(data);
    setLoading(false);
  };

  const updateField = async (field, value) => {
    setSaving(true);
    const { success, error, data } = await profilesService.updateProfile(profileId, { [field]: value });
    setSaving(false);
    if (success) {
      setProfile(data);
      Alert.alert('Success', `${field} updated to ${value === 'disabled' ? 'blocked' : value}`);
    } else {
      Alert.alert('Error', `Failed to update ${field}`);
    }
  };

  const handleOpenDemoModal = async () => {
    setSaving(true);
    const { data: plans, error: fetchError } = await fetchPublishedPlans();
    setSaving(false);
    
    if (fetchError || !plans || plans.length === 0) {
      Alert.alert('Error', 'No published plans found.');
      return;
    }
    setAvailablePlans(plans);
    setShowPlanPicker(true);
  };

  const handleGrantDemoAccess = async (selectedPlan) => {
    setShowPlanPicker(false);
    setSaving(true);
    try {
      const { error: orderError } = await adminGrantDemoAccess(profile.id, selectedPlan);
      
      if (orderError) throw orderError;
      
      Alert.alert('Success', `Granted Demo Access to ${selectedPlan.name}.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to grant demo access.');
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <View style={styles.root}>
        <View style={{ paddingHorizontal: 20 }}>
          <HeaderBar title="User Details" onBack={onBack} />
        </View>
        <View style={styles.centered}><AppText>Loading...</AppText></View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <HeaderBar title="User Details" onBack={onBack} />
        
        <View style={styles.card}>
          <AppText style={styles.label}>FULL NAME</AppText>
          <AppText style={styles.value}>{profile.full_name || 'Not provided'}</AppText>
          
          <AppText style={styles.label}>EMAIL</AppText>
          <AppText style={styles.value}>{profile.email}</AppText>
          
          <AppText style={styles.label}>GOAL</AppText>
          <AppText style={styles.value}>{profile.goal || 'Not provided'}</AppText>
          
          <AppText style={styles.label}>REGISTERED AT</AppText>
          <AppText style={styles.value}>{new Date(profile.created_at).toLocaleDateString()}</AppText>
        </View>

        <AppText style={styles.sectionTitle}>Administration</AppText>
        <View style={styles.card}>
          <AppText style={styles.label}>ROLE</AppText>
          <View style={styles.buttonRow}>
            <Pressable 
              style={[styles.toggleBtn, profile.role === 'customer' && styles.toggleBtnActive]}
              onPress={() => updateField('role', 'customer')}
              disabled={saving}
            >
              <AppText style={[styles.toggleBtnText, profile.role === 'customer' && styles.toggleBtnTextActive]}>Customer</AppText>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, profile.role === 'admin' && styles.toggleBtnActive]}
              onPress={() => updateField('role', 'admin')}
              disabled={saving}
            >
              <AppText style={[styles.toggleBtnText, profile.role === 'admin' && styles.toggleBtnTextActive]}>Admin</AppText>
            </Pressable>
          </View>

          <AppText style={[styles.label, { marginTop: 20 }]}>STATUS</AppText>
          <View style={styles.buttonRow}>
            <Pressable 
              style={[styles.toggleBtn, profile.status === 'active' && styles.toggleBtnActive]}
              onPress={() => updateField('status', 'active')}
              disabled={saving}
            >
              <AppText style={[styles.toggleBtnText, profile.status === 'active' && styles.toggleBtnTextActive]}>Active</AppText>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, profile.status === 'disabled' && styles.toggleBtnActiveDanger]}
              onPress={() => updateField('status', 'disabled')}
              disabled={saving}
            >
              <AppText style={[styles.toggleBtnText, profile.status === 'disabled' && styles.toggleBtnTextActiveDanger]}>Blocked</AppText>
            </Pressable>
          </View>
          
          <AppText style={[styles.label, { marginTop: 20 }]}>SPECIAL ACTIONS</AppText>
          <Pressable 
            style={[styles.actionBtn, { marginTop: 8 }]}
            onPress={handleOpenDemoModal}
            disabled={saving}
          >
            <AppText style={styles.actionBtnText}>Grant Demo Access...</AppText>
          </Pressable>
        </View>

      </ScrollView>

      <Modal visible={showPlanPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Select Plan to Grant</AppText>
            <FlatList
              data={availablePlans}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.planItem}
                  onPress={() => handleGrantDemoAccess(item)}
                >
                  <AppText style={styles.planItemName}>{item.name}</AppText>
                  <AppText style={styles.planItemDate}>{item.week_start_date}</AppText>
                </Pressable>
              )}
            />
            <Pressable style={styles.modalCloseBtn} onPress={() => setShowPlanPicker(false)}>
              <AppText style={styles.modalCloseBtnText}>Cancel</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.muted, marginBottom: 4 },
  value: { fontSize: 16, color: COLORS.brand, marginBottom: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.brand, marginBottom: 10, marginLeft: 4 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  toggleBtnText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: COLORS.surface,
  },
  toggleBtnActiveDanger: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  toggleBtnTextActiveDanger: {
    color: COLORS.surface,
  },
  actionBtn: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  actionBtnText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 16,
  },
  planItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  planItemName: {
    color: COLORS.brand,
    fontWeight: '700',
    fontSize: 15,
  },
  planItemDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
