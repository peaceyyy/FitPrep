import AppText from '../components/AppText';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { usePlans } from '../context/PlansContext';
import { TYPOGRAPHY } from '../theme';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { fetchMyDailyDeliveries } from '../services/deliveriesService';
import { formatWeekRange, getWeekEndDate, normalizeCategory, getNextWeekStartDate, getCurrentWeekStartDate } from '../services/plansService';

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

export default function OrdersScreen({ onOpenReview, onBack, reviewedOrderIds = [], onNavigateToPlans, onNavigateToDay }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const { orders, ordersLoading, loadOrders, setSelectedCategory, setBrowsingWeek } = usePlans();
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

  const hasFutureOrder = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return false;
    return orders.some(isCurrentOrFutureOrder);
  }, [orders]);

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

  const handleDayClick = (delivery, group) => {
    if (!onNavigateToDay || !group.plan) return;
    const dateObj = new Date(`${delivery.delivery_date}T00:00:00`);
    const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    if (group.plan.category) setSelectedCategory(normalizeCategory(group.plan.category));
    if (group.plan.week_start_date) setBrowsingWeek(group.plan.week_start_date);
    
    onNavigateToDay(dayStr);
  };

  const handleBrowsePlans = () => {
    setBrowsingWeek(getNextWeekStartDate(getCurrentWeekStartDate()));
    if (onNavigateToPlans) onNavigateToPlans();
  };

  const renderDelivery = (delivery, group) => {
    const statusColor = getStatusColor(delivery.current_status);

    return (
      <Pressable 
        key={delivery.id} 
        style={({ pressed }) => [styles.deliveryRow, pressed && { opacity: 0.7 }]}
        onPress={() => handleDayClick(delivery, group)}
        accessibilityRole="button"
        accessibilityLabel={`View ${formatDate(delivery.delivery_date)} menu`}
      >
        <View>
          <AppText style={styles.deliveryDate}>{formatDate(delivery.delivery_date)}</AppText>
          <AppText style={styles.deliverySlot}>{delivery.delivery_time}</AppText>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor.bg }]}>
          <AppText style={[styles.statusText, { color: statusColor.text }]}>
            {delivery.current_status?.toUpperCase() || 'UNKNOWN'}
          </AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="My Deliveries" action={{ icon: 'refresh-cw', onPress: loadDeliveries }} onBack={onBack} />

      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />}

      {!loading && !!error && (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} style={styles.emptyStateIcon} />
          <AppText style={styles.emptyStateTitle}>Deliveries unavailable</AppText>
          <AppText style={styles.emptyStateText}>{error}</AppText>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]}
            onPress={loadDeliveries}
            accessibilityRole="button"
            accessibilityLabel="Retry loading deliveries"
          >
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      )}

      {!loading && !ordersLoading && !error && orderGroups.length === 0 && upcomingPreorder && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.accent} style={styles.emptyStateIcon} />
          <AppText style={styles.emptyStateTitle}>Preorder confirmed</AppText>
          <AppText style={styles.emptyStateText}>
            {getOrderPlan(upcomingPreorder).name || 'Your weekly plan'} is locked for {formatWeekRange(getOrderWeekStart(upcomingPreorder))}. Deliveries will appear here once that week starts.
          </AppText>
        </View>
      )}

      {!loading && !ordersLoading && !error && orderGroups.length === 0 && !upcomingPreorder && (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color={colors.brand} style={styles.emptyStateIcon} />
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
                  {group.deliveries.map((delivery) => renderDelivery(delivery, group))}
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

      {!hasFutureOrder && (
        <View style={styles.ctaCard}>
          <AppText style={styles.ctaHeading}>Ready for next week?</AppText>
          <AppText style={styles.ctaDescription}>New plans open for preorder as soon as they are published.</AppText>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }
            ]}
            onPress={handleBrowsePlans}
            accessibilityRole="button"
            accessibilityLabel="Browse meal plans"
          >
            <AppText style={styles.ctaButtonText}>Browse Plans</AppText>
          </Pressable>
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
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
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
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    marginBottom: 4,
  },
  orderDate: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
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
    // Fixed dark brand bg — avoids the inverted-mint problem in dark mode
    backgroundColor: '#0b2912',
    borderRadius: 26,
    padding: 24,
    marginTop: 8,
    overflow: 'hidden',
  },
  ctaHeading: {
    // Always white on dark brand green — high contrast in both modes
    color: '#ffffff',
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 10,
  },
  ctaDescription: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: TYPOGRAPHY.sm,
    marginBottom: 18,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#0b2912',
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.sm,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: TYPOGRAPHY.sm,
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
