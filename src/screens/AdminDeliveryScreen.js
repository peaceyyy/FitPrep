import AppText from '../components/AppText';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const initialTasks = [
  { id: 'd1', name: 'Sarah Jenkins', address: '482 Oakwood Ave, Garden District, New Orleans, LA', status: 'Urgent', proof: null },
  { id: 'd2', name: 'Michael Chen', address: '1290 Riverside Drive, Suite 201, New York, NY', status: 'Scheduled', proof: null },
  { id: 'd3', name: 'Amanda Thorne', address: '752 Maple Leaf Way, Portland, OR', status: 'Delivered', proof: 'https://via.placeholder.com/300' },
  { id: 'd4', name: 'David Miller', address: '88 Bluebird Terrace, Austin, TX', status: 'Scheduled', proof: null },
];

export default function AdminDeliveryScreen() {
  const [tasks, setTasks] = useState(initialTasks);

  const setOutForDelivery = (id) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'Out for Delivery' } : t));
  const setDelivered = (id) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'Delivered' } : t));
  const attachProof = (id) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, proof: 'https://via.placeholder.com/300' } : t));

  const active = tasks.filter((t) => t.status !== 'Delivered').length;
  const completedToday = tasks.filter((t) => t.status === 'Delivered').length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Delivery Tasks" />

      <AppText style={styles.sectionTitle}>ACTIVE TASKS</AppText>
      <View style={styles.summaryCard}>
        <AppText style={styles.summaryText}>{String(active).padStart(2, '0')}</AppText>
      </View>
      <AppText style={styles.sectionTitle}>COMPLETED TODAY</AppText>
      <View style={styles.summaryCard}>
        <AppText style={styles.summaryText}>{completedToday}</AppText>
      </View>
      <View style={[styles.summaryCard, styles.efficiencyCard]}>
        <AppText style={styles.efficiencyLabel}>DAILY EFFICIENCY</AppText>
        <AppText style={styles.efficiencyValue}>98%</AppText>
      </View>

      {tasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <AppText style={styles.taskName}>{task.name}</AppText>
            <View style={[styles.statusBadge, task.status === 'Urgent' ? styles.urgentBadge : task.status === 'Delivered' ? styles.deliveredBadge : styles.scheduledBadge]}>
              <AppText style={styles.statusBadgeText}>{task.status.toUpperCase()}</AppText>
            </View>
          </View>
          <View style={styles.addressRow}>
            <AppText style={styles.addressText}>{task.address}</AppText>
          </View>
          <View style={styles.proofBox}>
            {task.proof ? (
              <Image source={{ uri: task.proof }} style={styles.proofImage} />
            ) : (
              <AppText style={styles.proofText}>Proof of Delivery</AppText>
            )}
          </View>
          <View style={styles.buttonsRow}>
            <Pressable style={styles.outButton} onPress={() => setOutForDelivery(task.id)}>
              <AppText style={styles.outButtonText}>Out for Delivery</AppText>
            </Pressable>
            <Pressable style={styles.deliveredButton} onPress={() => setDelivered(task.id)}>
              <AppText style={styles.deliveredButtonText}>Delivered</AppText>
            </Pressable>
          </View>
          <Pressable style={styles.uploadBox} onPress={() => attachProof(task.id)}>
            <AppText style={styles.uploadLabel}>Upload Photo</AppText>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, letterSpacing: 1.2, marginTop: 16, marginBottom: 10 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  summaryText: { color: COLORS.brand, fontSize: 24, fontWeight: '900' },
  efficiencyCard: { backgroundColor: '#eefbbf', borderColor: '#d8f1a6' },
  efficiencyLabel: { color: COLORS.accent, fontSize: 12, marginBottom: 8 },
  efficiencyValue: { color: COLORS.brand, fontSize: 28, fontWeight: '900' },
  taskCard: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 18, marginBottom: 14 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskName: { color: COLORS.brand, fontSize: 16, fontWeight: '900' },
  statusBadge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  urgentBadge: { backgroundColor: '#fde4e1' },
  scheduledBadge: { backgroundColor: '#eef7dd' },
  deliveredBadge: { backgroundColor: '#dff4da' },
  statusBadgeText: { color: COLORS.brand, fontWeight: '800', fontSize: 11 },
  addressRow: { marginBottom: 16 },
  addressText: { color: COLORS.textSecondary, lineHeight: 20 },
  proofBox: { minHeight: 110, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#f7f8f1', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  proofText: { color: COLORS.muted },
  proofImage: { width: '100%', height: '100%', borderRadius: 16 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  outButton: { backgroundColor: '#f4f7ef', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, flex: 1, marginRight: 8, alignItems: 'center' },
  outButtonText: { color: COLORS.brand, fontWeight: '800' },
  deliveredButton: { backgroundColor: COLORS.brand, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, flex: 1, marginLeft: 8, alignItems: 'center' },
  deliveredButtonText: { color: COLORS.surface, fontWeight: '800' },
  uploadBox: { borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  uploadLabel: { color: COLORS.accent, fontWeight: '800' },
});
