import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const stats = [
  { label: 'Total Orders', value: '1,284', meta: '+12.5% this week' },
  { label: 'Active Deliveries', value: '42', meta: '8 en route • 34 pending' },
  { label: 'Total Revenue', value: '$24,510', meta: 'Live' },
];

const activity = [
  { title: 'New Meal Plan Created', detail: 'High-Protein Summer Bulk published by Sarah K.', time: '2 mins ago' },
  { title: 'New VIP Subscriber', detail: 'James Wilson upgraded to Platinum Plan.', time: '45 mins ago' },
];

export default function AdminDashboardScreen({ user, onLogout, onCreateMeal, onViewCustomer }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Dashboard Overview" action={{ icon: '🔔', onPress: () => {} }} />

      <Text style={styles.subHeading}>OPERATIONAL SNAPSHOT</Text>
      <Text style={styles.title}>Dashboard Overview</Text>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statMeta}>{item.meta}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Weekly Growth</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>[Revenue chart]</Text>
        </View>
        <View style={styles.chartFooter}>
          <View>
            <Text style={styles.chartLabel}>Peak Performance</Text>
            <Text style={styles.chartValue}>Friday (+$4.2k)</Text>
          </View>
          <View style={styles.chartMetric}>
            <Text style={styles.chartLabel}>Efficiency</Text>
            <Text style={styles.chartValue}>98.2%</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.createAction} onPress={onCreateMeal}>
        <Text style={styles.createActionText}>＋ Create Meal Plan</Text>
        <Text style={styles.createActionArrow}>›</Text>
      </Pressable>

      <Pressable style={styles.logoutAction} onPress={onLogout}>
        <Text style={styles.logoutActionText}>Logout</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activity.map((item) => (
        <View key={item.title} style={styles.activityCard}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDetail}>{item.detail}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  subHeading: { color: COLORS.muted, fontSize: 12, letterSpacing: 1.2, marginBottom: 8 },
  title: { color: COLORS.brand, fontSize: 28, fontWeight: '900', marginBottom: 18 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: '900', color: COLORS.brand, marginBottom: 8 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  statMeta: { color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, padding: 18, marginBottom: 18 },
  cardTitle: { color: COLORS.brand, fontWeight: '800', marginBottom: 12 },
  chartPlaceholder: { height: 140, borderRadius: 18, backgroundColor: '#f4f7ef', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  chartText: { color: COLORS.muted },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabel: { color: COLORS.muted, fontSize: 12 },
  chartValue: { color: COLORS.brand, fontWeight: '800', marginTop: 4 },
  createAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.brand, borderRadius: 24, padding: 18, marginBottom: 18 },
  createActionText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  createActionArrow: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  logoutAction: { backgroundColor: '#fff', borderRadius: 24, padding: 18, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  logoutActionText: { color: COLORS.danger, fontWeight: '900' },
  sectionTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 14 },
  activityCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  activityTitle: { color: COLORS.brand, fontWeight: '800', marginBottom: 8 },
  activityDetail: { color: COLORS.textSecondary, marginBottom: 10 },
  activityTime: { color: COLORS.muted, fontSize: 12 },
});
