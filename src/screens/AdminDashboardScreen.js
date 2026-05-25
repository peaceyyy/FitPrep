import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { fetchAllOrders } from '../services/ordersService';

export default function AdminDashboardScreen({ user, onLogout, onBack }) {
  const { plans } = usePlans();
  const [orderCount, setOrderCount] = useState('—');
  const [revenue, setRevenue] = useState('—');

  useEffect(() => {
    (async () => {
      const { data } = await fetchAllOrders();
      if (data) {
        setOrderCount(data.length);
        const total = data.reduce((sum, o) => sum + Number(o.published_weekly_plans?.weekly_price || 0), 0);
        setRevenue(`$${total.toFixed(2)}`);
      }
    })();
  }, []);

  const stats = [
    { label: 'Total Orders', value: String(orderCount), meta: 'All time' },
    { label: 'Active Plans', value: String(plans?.length || 0), meta: 'This week' },
    { label: 'Total Revenue', value: revenue, meta: 'Est. from orders' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Dashboard" action={{ icon: 'bell', onPress: () => {} }} onBack={onBack} />

      <AppText style={styles.subHeading}>OPERATIONAL SNAPSHOT</AppText>
      <AppText style={styles.title}>Dashboard Overview</AppText>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <AppText style={styles.statValue}>{item.value}</AppText>
            <AppText style={styles.statLabel}>{item.label}</AppText>
            <AppText style={styles.statMeta}>{item.meta}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <AppText style={styles.cardTitle}>Weekly Growth</AppText>
        <View style={styles.chartPlaceholder}>
          <AppText style={styles.chartText}>[Revenue chart — coming soon]</AppText>
        </View>
      </View>

      <Pressable style={styles.logoutAction} onPress={onLogout}>
        <AppText style={styles.logoutActionText}>Logout</AppText>
      </Pressable>
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
  createActionText: { color: COLORS.surface, fontSize: 16, fontWeight: '800' },
  createActionArrow: { color: COLORS.surface, fontSize: 22, fontWeight: '900' },
  logoutAction: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  logoutActionText: { color: COLORS.danger, fontWeight: '900' },
  sectionTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 14 },
  activityCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  activityTitle: { color: COLORS.brand, fontWeight: '800', marginBottom: 8 },
  activityDetail: { color: COLORS.textSecondary, marginBottom: 10 },
  activityTime: { color: COLORS.muted, fontSize: 12 },
});
