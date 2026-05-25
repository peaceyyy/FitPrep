import AppText from '../components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const recent = [
  { id: 1, text: 'New Meal Plan Created: "High-Protein Summer Bulk"' },
  { id: 2, text: 'New VIP Subscriber: James Wilson' },
  { id: 3, text: 'Order #ORD-8921 marked Delivered' },
];

export default function AdminOverviewScreen({ onCreateMeal }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Dashboard Overview" />

      <AppText style={styles.sectionTitle}>Operational Snapshot</AppText>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <AppText style={styles.statLabel}>Total Orders</AppText>
          <AppText style={styles.statValue}>1,284</AppText>
        </View>
        <View style={styles.statCard}>
          <AppText style={styles.statLabel}>Active Deliveries</AppText>
          <AppText style={styles.statValue}>42</AppText>
        </View>
      </View>

      <View style={styles.revenueCard}>
        <AppText style={styles.statLabel}>Total Revenue</AppText>
        <AppText style={styles.revenueValue}>₱124,510</AppText>
        <View style={styles.graphPlaceholder}><AppText style={styles.graphText}>Use the main Dashboard for live demo totals.</AppText></View>
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.createButton} onPress={onCreateMeal}>
          <AppText style={styles.createButtonText}>+ Create Meal Plan</AppText>
        </Pressable>
      </View>

      <AppText style={styles.sectionTitle}>Recent Activity</AppText>
      {recent.map((r) => (
        <View key={r.id} style={styles.activityRow}>
          <AppText style={styles.activityText}>{r.text}</AppText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.brand, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 16, borderRadius: 18, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.brand },
  revenueCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  revenueValue: { fontSize: 22, fontWeight: '900', color: COLORS.brand, marginBottom: 10 },
  graphPlaceholder: { height: 100, borderRadius: 10, backgroundColor: '#eef4df', alignItems: 'center', justifyContent: 'center' },
  graphText: { color: COLORS.muted },
  quickActions: { marginBottom: 18 },
  createButton: { backgroundColor: COLORS.brand, paddingVertical: 14, borderRadius: 18, alignItems: 'center' },
  createButtonText: { color: COLORS.surface, fontWeight: '800' },
  activityRow: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  activityText: { color: COLORS.textSecondary },
});
