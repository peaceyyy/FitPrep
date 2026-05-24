import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
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
      <HeaderBar title="Dashboard Overview" action={{ icon: '⚙️', onPress: () => {} }} />

      <Text style={styles.sectionTitle}>Operational Snapshot</Text>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>1,284</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Deliveries</Text>
          <Text style={styles.statValue}>42</Text>
        </View>
      </View>

      <View style={styles.revenueCard}>
        <Text style={styles.statLabel}>Total Revenue</Text>
        <Text style={styles.revenueValue}>$24,510</Text>
        <View style={styles.graphPlaceholder}><Text style={styles.graphText}>[Revenue graph]</Text></View>
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.createButton} onPress={onCreateMeal}>
          <Text style={styles.createButtonText}>+ Create Meal Plan</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recent.map((r) => (
        <View key={r.id} style={styles.activityRow}>
          <Text style={styles.activityText}>{r.text}</Text>
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
  createButtonText: { color: '#fff', fontWeight: '800' },
  activityRow: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  activityText: { color: COLORS.textSecondary },
});
