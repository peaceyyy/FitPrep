import AppText from '../components/AppText';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { fetchMyDailyDeliveries } from '../services/deliveriesService';
import { getWeekEndDate } from '../services/plansService';

const isPastSunday = (weekStartDate) => {
  if (!weekStartDate) return false;
  const endDate = new Date(`${getWeekEndDate(weekStartDate)}T23:59:59`);
  return new Date() > endDate;
};

export default function OrdersScreen({ onOpenReview, onBack }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchMyDailyDeliveries();
    if (fetchError) {
      setDeliveries([]);
      setError(fetchError.message || 'Could not load your deliveries.');
    } else {
      setDeliveries(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const orderGroups = useMemo(() => {
    const groups = new Map();

    deliveries.forEach((delivery) => {
      const order = delivery.weekly_orders || {};
      const plan = order.plan_snapshot || order.published_weekly_plans || {};
      const groupId = delivery.weekly_order_id;

      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          order,
          plan,
          deliveries: [],
        });
      }

      groups.get(groupId).deliveries.push(delivery);
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      deliveries: group.deliveries.sort((a, b) => `${a.delivery_date}${a.delivery_time}`.localeCompare(`${b.delivery_date}${b.delivery_time}`)),
    }));
  }, [deliveries]);

  const summary = useMemo(() => {
    const delivered = deliveries.filter((delivery) => delivery.current_status === DELIVERY_STATUSES.DELIVERED).length;
    const active = deliveries.length - delivered;
    return { active, delivered, orders: orderGroups.length };
  }, [deliveries, orderGroups.length]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const formatPrice = (value) => {
    const amount = Number(value);
    return Number.isNaN(amount) ? '₱--' : `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('paid') || s.includes('delivered')) return { bg: '#dff4da', text: COLORS.accent };
    if (s.includes('pending')) return { bg: '#fff0db', text: '#d97706' };
    if (s.includes('cancelled') || s.includes('failed')) return { bg: '#fbeaea', text: COLORS.danger };
    return { bg: '#f0f1ea', text: COLORS.textSecondary };
  };

  const renderDelivery = (delivery) => {
    const statusColor = getStatusColor(delivery.current_status);

    return (
      <View key={delivery.id} style={styles.deliveryRow}>
        <View>
          <AppText style={styles.deliveryDate}>{formatDate(delivery.delivery_date)}</AppText>
          <AppText style={styles.deliverySlot}>{delivery.delivery_time}</AppText>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor.bg }]}>
          <AppText style={[styles.statusText, { color: statusColor.text }]}>
            {delivery.current_status?.toUpperCase() || 'UNKNOWN'}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="My Deliveries" action={{ icon: 'refresh-cw', onPress: loadDeliveries }} onBack={onBack} />

      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />}

      {!loading && !!error && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyStateTitle}>Deliveries unavailable</AppText>
          <AppText style={styles.emptyStateText}>{error}</AppText>
          <Pressable style={styles.retryButton} onPress={loadDeliveries}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      )}

      {!loading && !error && orderGroups.length === 0 && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyStateTitle}>No orders yet</AppText>
          <AppText style={styles.emptyStateText}>Browse the weekly plans and place your first preorder!</AppText>
        </View>
      )}

      {!loading && !error && orderGroups.length > 0 && (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <AppText style={styles.summaryLabel}>Orders</AppText>
              <AppText style={styles.summaryValue}>{summary.orders}</AppText>
            </View>
            <View style={[styles.summaryCard, styles.summaryActive]}>
              <AppText style={styles.summaryLabel}>Active</AppText>
              <AppText style={styles.summaryValue}>{summary.active}</AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText style={styles.summaryLabel}>Delivered</AppText>
              <AppText style={styles.summaryValue}>{summary.delivered}</AppText>
            </View>
          </View>

          <AppText style={styles.sectionTitle}>Delivery Progress</AppText>
          {orderGroups.map((group) => (
            <View key={group.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderBody}>
                  <AppText style={styles.orderTitle}>{group.plan.name || 'Plan'}</AppText>
                  <AppText style={styles.orderDate}>{group.plan.category || 'Meal plan'} - Order #{group.id?.slice(0, 8)}</AppText>
                </View>
                <AppText style={styles.orderPrice}>{formatPrice(group.order.amount_paid ?? group.plan.weekly_price)}</AppText>
              </View>

              <View style={styles.paymentRow}>
                <View style={styles.paymentPill}>
                  <AppText style={styles.paymentText}>{group.order.payment_method || 'GCash'}</AppText>
                </View>
                <View style={styles.paymentPill}>
                  <AppText style={styles.paymentText}>{group.deliveries[0]?.delivery_time || '--:--'}</AppText>
                </View>
              </View>

              <View style={styles.deliveryList}>
                {group.deliveries.map(renderDelivery)}
              </View>

              {isPastSunday(group.plan.week_start_date) ? (
                <Pressable
                  style={({ pressed }) => [styles.reviewButton, pressed && { opacity: 0.75 }]}
                  onPress={() => onOpenReview({ ...group.order, id: group.id, published_weekly_plans: group.plan })}
                >
                  <AppText style={styles.reviewButtonText}>Review</AppText>
                </Pressable>
              ) : (
                <View style={[styles.reviewButton, styles.reviewButtonDisabled]}>
                  <AppText style={[styles.reviewButtonText, { color: COLORS.muted }]}>Review later</AppText>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      <View style={styles.ctaCard}>
        <AppText style={styles.ctaHeading}>Ready for next week?</AppText>
        <AppText style={styles.ctaDescription}>New plans open for preorder as soon as they are published.</AppText>
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
    marginRight: 8,
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
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  orderBody: {
    flex: 1,
    paddingRight: 12,
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
  paymentRow: { flexDirection: 'row', marginBottom: 12 },
  paymentPill: { backgroundColor: '#f4f7ef', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11, marginRight: 8 },
  paymentText: { color: COLORS.brand, fontSize: 12, fontWeight: '800' },
  deliveryList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginBottom: 12,
  },
  deliveryRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deliveryDate: {
    color: COLORS.brand,
    fontWeight: '800',
    marginBottom: 2,
  },
  deliverySlot: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusChip: {
    backgroundColor: '#e9f7dd',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  statusText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  reviewButton: {
    backgroundColor: COLORS.highlight,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  reviewButtonDisabled: {
    backgroundColor: '#e2e6d9',
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
  retryButton: {
    minHeight: 44,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontWeight: '800',
  },
});
