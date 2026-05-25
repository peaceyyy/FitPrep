import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { fetchAllOrders } from '../services/ordersService';

const filterOptions = ['All', 'Paid (Mock)'];

export default function AdminOrdersScreen({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    (async () => {
      const { data, error } = await fetchAllOrders();
      if (!error) setOrders(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const lower = searchText.toLowerCase();
      const planName = order.published_weekly_plans?.name?.toLowerCase() || '';
      const matchesSearch = order.id.toLowerCase().includes(lower) || planName.includes(lower);
      const matchesFilter = filter === 'All' || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchText, filter]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (value) => {
    const amount = Number(value);
    return Number.isNaN(amount) ? '$--' : `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('paid') || s.includes('delivered')) return { bg: '#dff4da', text: COLORS.accent };
    if (s.includes('pending')) return { bg: '#fff0db', text: '#d97706' };
    if (s.includes('cancelled') || s.includes('failed')) return { bg: '#fbeaea', text: COLORS.danger };
    return { bg: '#f0f1ea', text: COLORS.textSecondary };
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Order Management" action={{ icon: 'refresh-cw', onPress: () => {} }} onBack={onBack} />

      <AppText style={styles.sectionTitle}>All Orders</AppText>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by order ID or plan name..."
        placeholderTextColor={COLORS.textTertiary}
        style={styles.searchInput}
      />

      <View style={styles.filtersRow}>
        {filterOptions.map((option) => (
          <Pressable
            key={option}
            style={({ pressed }) => [styles.filterChip, filter === option && styles.filterChipActive, pressed && { opacity: 0.75 }]}
            onPress={() => setFilter(option)}
          >
            <AppText style={[styles.filterLabel, filter === option && styles.filterLabelActive]}>{option}</AppText>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />}

      {!loading && filtered.length === 0 && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyText}>No orders found.</AppText>
        </View>
      )}

      {filtered.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHead}>
            <AppText style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</AppText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status).bg }]}>
              <AppText style={[styles.statusText, { color: getStatusColor(order.status).text }]}>{order.status?.toUpperCase()}</AppText>
            </View>
          </View>
          <AppText style={styles.orderPlan}>{order.published_weekly_plans?.name || '—'}</AppText>
          <AppText style={styles.orderCategory}>{order.published_weekly_plans?.category}</AppText>
          <View style={styles.orderFooter}>
            <AppText style={styles.orderDate}>{formatDate(order.created_at)}</AppText>
            <AppText style={styles.orderPrice}>{formatPrice(order.published_weekly_plans?.weekly_price)}</AppText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  sectionTitle: { color: COLORS.brand, fontSize: 24, fontWeight: '900', marginBottom: 16 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, color: COLORS.brand },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  filterChip: { backgroundColor: COLORS.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, marginBottom: 10 },
  filterChipActive: { backgroundColor: '#eef7dd', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.brand, fontWeight: '700' },
  filterLabelActive: { color: COLORS.accent },
  emptyState: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#dff4da' },
  statusText: { color: COLORS.brand, fontSize: 11, fontWeight: '800' },
  orderPlan: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  orderCategory: { color: COLORS.accent, fontWeight: '700', fontSize: 13, marginBottom: 10 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { color: COLORS.muted, fontSize: 12 },
  orderPrice: { color: COLORS.brand, fontWeight: '800', fontSize: 15 },
});
