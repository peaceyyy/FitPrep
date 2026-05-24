import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const filterOptions = ['All', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function AdminOrdersScreen({ orders: propOrders = [], onViewCustomer, onOpenDetails }) {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('All');

  const orders = useMemo(() => {
    return propOrders.filter((order) => {
      const lower = searchText.toLowerCase();
      const matchesSearch = order.id.toLowerCase().includes(lower) || order.customer.toLowerCase().includes(lower);
      const matchesFilter = filter === 'All' || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [propOrders, searchText, filter]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Order Management" action={{ icon: '👁️', onPress: onViewCustomer }} />

      <Text style={styles.sectionTitle}>Customer Orders</Text>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by Order ID or Customer..."
        placeholderTextColor="#9aa298"
        style={styles.searchInput}
      />
      <View style={styles.filtersRow}>
        {filterOptions.map((option) => (
          <Pressable
            key={option}
            style={[styles.filterChip, filter === option && styles.filterChipActive]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.filterLabel, filter === option && styles.filterLabelActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHead}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <View style={[styles.statusBadge, order.status === 'Delivered' ? styles.statusDelivered : order.status === 'Out for Delivery' ? styles.statusOut : styles.statusPreparing]}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.orderCustomer}>{order.customer}</Text>
          <Text style={styles.orderPlan}>{order.plan}</Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Pressable onPress={() => onOpenDetails && onOpenDetails(order)}>
              <Text style={styles.detailsLink}>Details</Text>
            </Pressable>
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
  orderCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusPreparing: { backgroundColor: '#edf2d8' },
  statusOut: { backgroundColor: '#fff2d2' },
  statusDelivered: { backgroundColor: '#dff4da' },
  statusText: { color: COLORS.brand, fontSize: 11, fontWeight: '800' },
  orderCustomer: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  orderPlan: { color: COLORS.textSecondary, marginBottom: 10 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { color: COLORS.muted, fontSize: 12 },
  detailsLink: { color: COLORS.accent, fontWeight: '800' },
});
