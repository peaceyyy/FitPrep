import AppText from '../components/AppText';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { usePlans } from '../context/PlansContext';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { fetchMyDailyDeliveries } from '../services/deliveriesService';
import { formatWeekRange, getWeekEndDate } from '../services/plansService';

const getOrderPlan = (order) => (order ? (order.plan_snapshot || order.published_weekly_plans || {}) : {});

const getOrderWeekStart = (order) => getOrderPlan(order).week_start_date || '';

const canReviewOrderGroup = (group = {}) => (
  Array.isArray(group.deliveries)
  && group.deliveries.length > 0
  && group.deliveries.every((delivery) => delivery.current_status === DELIVERY_STATUSES.DELIVERED)
);

const isCurrentOrFutureOrder = (order) => {
  const weekStartDate = getOrderWeekStart(order);
  if (!weekStartDate) return false;
  const weekEnd = new Date(`${getWeekEndDate(weekStartDate)}T23:59:59`);
  return weekEnd >= new Date();
};

export default function OrdersScreen({ onOpenReview, onBack, reviewedOrderIds = [] }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const { orders, ordersLoading, loadOrders } = usePlans();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError('');
    const [{ data, error: fetchError }] = await Promise.all([
      fetchMyDailyDeliveries(),
      loadOrders(),
    ]);
    if (fetchError) {
      setDeliveries([]);
      setError(fetchError.message || 'Could not load your deliveries.');
    } else {
      setDeliveries(data || []);
    }
    setLoading(false);
  }, [loadOrders]);

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

  const upcomingPreorder = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return null;
    const deliveryOrderIds = new Set(orderGroups.map((group) => group.id));

    return orders
      .filter((order) => !deliveryOrderIds.has(order.id))
      .filter(isCurrentOrFutureOrder)
      .sort((a, b) => getOrderWeekStart(a).localeCompare(getOrderWeekStart(b)))[0] || null;
  }, [orderGroups, orders]);

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
    if (s.includes('paid') || s.includes('delivered')) return { bg: colors.surfaceGreen, text: colors.accent };
    if (s.includes('pending')) return { bg: colors.highlightSubtle, text: '#d97706' };
    if (s.includes('cancelled') || s.includes('failed')) return { bg: colors.dangerSubtle, text: colors.danger };
    return { bg: colors.surfaceGreen, text: colors.textSecondary };
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

      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />}

      {!loading && !!error && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyStateTitle}>Deliveries unavailable</AppText>
          <AppText style={styles.emptyStateText}>{error}</AppText>
          <Pressable style={styles.retryButton} onPress={loadDeliveries}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      )}

      {!loading && !ordersLoading && !error && orderGroups.length === 0 && upcomingPreorder && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyStateTitle}>Preorder confirmed</AppText>
          <AppText style={styles.emptyStateText}>
            {getOrderPlan(upcomingPreorder).name || 'Your weekly plan'} is locked for {formatWeekRange(getOrderWeekStart(upcomingPreorder))}. Deliveries will appear here once that week starts.
          </AppText>
        </View>
      )}

      {!loading && !ordersLoading && !error && orderGroups.length === 0 && !upcomingPreorder && (
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
          {orderGroups.map((group) => {
            const hasReviewed = reviewedOrderIds.includes(group.id);

            return (
              <View key={group.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderBody}>
                    <AppText style={styles.orderTitle} numberOfLines={2}>{group.plan.name || 'Plan'}</AppText>
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

                {hasReviewed ? (
                  <View style={[styles.reviewButton, styles.reviewButtonReviewed]}>
                    <AppText style={styles.reviewButtonText}>Reviewed</AppText>
                  </View>
                ) : canReviewOrderGroup(group) ? (
                  <Pressable
                    style={({ pressed }) => [styles.reviewButton, pressed && { opacity: 0.75 }]}
                    onPress={() => onOpenReview({ ...group.order, id: group.id, published_weekly_plans: group.plan })}
                  >
                    <AppText style={styles.reviewButtonText}>Review</AppText>
                  </Pressable>
                ) : (
                  <View style={[styles.reviewButton, styles.reviewButtonDisabled]}>
                    <AppText style={[styles.reviewButtonText, { color: colors.muted }]}>Review later</AppText>
                  </View>
                )}
              </View>
            );
          })}
        </>
      )}

      {!upcomingPreorder && (
        <View style={styles.ctaCard}>
          <AppText style={styles.ctaHeading}>Ready for next week?</AppText>
          <AppText style={styles.ctaDescription}>New plans open for preorder as soon as they are published.</AppText>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  summaryActive: {
    backgroundColor: colors.highlightSubtle,
    borderColor: colors.highlight,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  summaryValue: {
    color: colors.brand,
    fontSize: 26,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 14,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  orderBody: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 4,
  },
  orderDate: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
  },
  paymentRow: { flexDirection: 'row', marginBottom: 12 },
  paymentPill: { backgroundColor: colors.surfaceGreen, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11, marginRight: 8 },
  paymentText: { color: colors.brand, fontSize: 12, fontWeight: '800' },
  deliveryList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    color: colors.brand,
    fontWeight: '800',
    marginBottom: 2,
  },
  deliverySlot: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusChip: {
    backgroundColor: colors.surfaceGreen,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  statusText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  reviewButton: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  reviewButtonDisabled: {
    backgroundColor: colors.surfaceGreen,
  },
  reviewButtonReviewed: {
    backgroundColor: colors.highlightSubtle,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  reviewButtonText: {
    color: isDark ? colors.textPrimary : colors.brand,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: colors.brand,
    borderRadius: 26,
    padding: 24,
    marginTop: 8,
  },
  ctaHeading: {
    color: isDark ? colors.background : colors.surface,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  ctaDescription: {
    color: isDark ? colors.surfaceGreen : colors.textSecondary,
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
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
    backgroundColor: colors.brand,
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: '800',
  },
});
