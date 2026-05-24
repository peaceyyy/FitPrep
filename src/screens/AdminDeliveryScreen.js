import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
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
      <HeaderBar title="Delivery Tasks" action={{ icon: '🔔', onPress: () => {} }} />

      <Text style={styles.sectionTitle}>ACTIVE TASKS</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{String(active).padStart(2, '0')}</Text>
      </View>
      <Text style={styles.sectionTitle}>COMPLETED TODAY</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{completedToday}</Text>
      </View>
      <View style={[styles.summaryCard, styles.efficiencyCard]}>
        <Text style={styles.efficiencyLabel}>DAILY EFFICIENCY</Text>
        <Text style={styles.efficiencyValue}>98%</Text>
      </View>

      {tasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{task.name}</Text>
            <View style={[styles.statusBadge, task.status === 'Urgent' ? styles.urgentBadge : task.status === 'Delivered' ? styles.deliveredBadge : styles.scheduledBadge]}>
              <Text style={styles.statusBadgeText}>{task.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>{task.address}</Text>
          </View>
          <View style={styles.proofBox}>
            {task.proof ? (
              <Image source={{ uri: task.proof }} style={styles.proofImage} />
            ) : (
              <Text style={styles.proofText}>Proof of Delivery</Text>
            )}
          </View>
          <View style={styles.buttonsRow}>
            <Pressable style={styles.outButton} onPress={() => setOutForDelivery(task.id)}>
              <Text style={styles.outButtonText}>Out for Delivery</Text>
            </Pressable>
            <Pressable style={styles.deliveredButton} onPress={() => setDelivered(task.id)}>
              <Text style={styles.deliveredButtonText}>Delivered</Text>
            </Pressable>
          </View>
          <Pressable style={styles.uploadBox} onPress={() => attachProof(task.id)}>
            <Text style={styles.uploadLabel}>Upload Photo</Text>
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
  deliveredButtonText: { color: '#fff', fontWeight: '800' },
  uploadBox: { borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  uploadLabel: { color: COLORS.accent, fontWeight: '800' },
});
