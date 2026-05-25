import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { fetchMyOrders } from '../services/ordersService';

export default function OrdersScreen({ onOpenReview, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await fetchMyOrders();
      if (!error) setOrders(data || []);
      setLoading(false);
    })();
  }, []);

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
      <HeaderBar title="My Orders" action={{ icon: 'settings', onPress: () => {} }} onBack={onBack} />

      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />}

      {!loading && orders.length === 0 && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyStateTitle}>No orders yet</AppText>
          <AppText style={styles.emptyStateText}>Browse the weekly plans and place your first preorder!</AppText>
        </View>
      )}

      {!loading && orders.length > 0 && (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <AppText style={styles.summaryLabel}>Total Orders</AppText>
              <AppText style={styles.summaryValue}>{orders.length}</AppText>
            </View>
            <View style={[styles.summaryCard, styles.summaryActive]}>
              <AppText style={styles.summaryLabel}>Active</AppText>
              <AppText style={styles.summaryValue}>{orders.filter((o) => o.status?.includes('Paid')).length}</AppText>
            </View>
          </View>

          <AppText style={styles.sectionTitle}>Order History</AppText>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderBadge} />
              <View style={styles.orderBody}>
                <AppText style={styles.orderTitle}>{order.published_weekly_plans?.name || 'Plan'}</AppText>
                <AppText style={styles.orderDate}>Ordered {formatDate(order.created_at)}</AppText>
                <AppText style={styles.orderPrice}>{formatPrice(order.published_weekly_plans?.weekly_price)}</AppText>
              </View>
              <View style={styles.orderActions}>
                <View style={[styles.statusChip, { backgroundColor: getStatusColor(order.status).bg }]}>
                  <AppText style={[styles.statusText, { color: getStatusColor(order.status).text }]}>
                    {order.status?.toUpperCase() || 'UNKNOWN'}
                  </AppText>
                </View>
                <Pressable 
                  style={({ pressed }) => [styles.reviewButton, pressed && { opacity: 0.75 }]} 
                  onPress={() => onOpenReview(order)}
                >
                  <AppText style={styles.reviewButtonText}>Review</AppText>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={styles.ctaCard}>
        <AppText style={styles.ctaHeading}>Ready for next week?</AppText>
        <AppText style={styles.ctaDescription}>New plans are published every Saturday. Check back to preorder!</AppText>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  summaryActive: {
    backgroundColor: '#ebf5c7',
    borderColor: '#d8ed9a',
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  summaryValue: {
    color: COLORS.brand,
    fontSize: 26,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 14,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderBadge: {
    width: 56,
    height: 56,
    backgroundColor: '#dfeecc',
    borderRadius: 18,
    marginRight: 14,
  },
  orderBody: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 4,
  },
  orderDate: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand,
  },
  statusChip: {
    backgroundColor: '#e9f7dd',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  orderActions: {
    alignItems: 'flex-end',
  },
  orderButton: {
    backgroundColor: '#f4f7ef',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  orderButtonText: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  reviewButton: {
    backgroundColor: COLORS.highlight,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  reviewButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 26,
    padding: 24,
    marginTop: 8,
  },
  ctaHeading: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  ctaDescription: {
    color: '#dde8d3',
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
