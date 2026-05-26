import AppText from '../components/AppText';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { updateDailyDeliveryStatus } from '../services/deliveriesService';

const STATUS_ACTIONS = [
  DELIVERY_STATUSES.PREPARING,
  DELIVERY_STATUSES.OUT_FOR_DELIVERY,
  DELIVERY_STATUSES.DELIVERED,
  DELIVERY_STATUSES.UNDELIVERED,
];

export default function AdminDeliveryDetailsScreen({ orderGroup, onBack }) {
  const { colors, isDark, setTheme } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [deliveries, setDeliveries] = useState(
    [...(orderGroup?.deliveries || [])].sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))
  );
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (delivery, currentStatus) => {
    setUpdatingId(delivery.id);
    setError('');
    const { data, error } = await updateDailyDeliveryStatus(delivery.id, currentStatus);
    if (!error) {
      setDeliveries((prev) => prev.map((item) => (
        item.id === delivery.id ? { ...item, ...(data || {}), current_status: currentStatus } : item
      )));
    } else {
      setError(error.message || 'Could not update this delivery status.');
    }
    setUpdatingId(null);
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancelled') || s.includes('failed') || s.includes('undelivered')) return { bg: colors.dangerSubtle, text: colors.danger };
    if (s.includes('paid') || s === 'delivered') return { bg: colors.surfaceGreen, text: colors.accent };
    if (s.includes('pending')) return { bg: colors.warningSubtle, text: colors.warning };
    return { bg: colors.highlightSubtle, text: colors.textSecondary };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' });
  };

  const renderDelivery = ({ item }) => {
    const statusColor = getStatusColor(item.current_status);
    const isUpdating = updatingId === item.id;
    
    // Future date logic
    const todayStr = new Date().toISOString().split('T')[0];
    const isFutureDate = item.delivery_date && item.delivery_date > todayStr;

    return (
      <View style={styles.deliveryCard}>
        <View style={styles.cardHead}>
          <View style={styles.cardHeadText}>
            <AppText style={styles.dateLabel}>{formatDate(item.delivery_date)}</AppText>
            <AppText style={styles.timeSlot}>Slot: {item.delivery_time}</AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <AppText style={[styles.statusText, { color: statusColor.text }]}>{item.current_status?.toUpperCase()}</AppText>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {STATUS_ACTIONS.map((status) => {
            const disableForFuture = isFutureDate && (status === DELIVERY_STATUSES.OUT_FOR_DELIVERY || status === DELIVERY_STATUSES.DELIVERED);
            const isActive = item.current_status === status;
            // Only disable if it's updating, or if it's restricted for the future. We don't disable active states anymore.
            const disabled = isUpdating || disableForFuture;
            
            // Abbreviate "Out for Delivery" to fit 4 buttons nicely
            let displayText = status;
            if (status === DELIVERY_STATUSES.OUT_FOR_DELIVERY) displayText = 'Out';
            if (status === DELIVERY_STATUSES.DELIVERED) displayText = 'Claimed';
            if (status === DELIVERY_STATUSES.UNDELIVERED) displayText = 'Unclaimed';

            return (
              <Pressable
                key={status}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.statusAction,
                  isActive && styles.statusActionActive,
                  disableForFuture && styles.statusActionDisabled,
                  pressed && !disabled && { opacity: 0.75 },
                ]}
                onPress={() => {
                  // If clicking the currently active status, reset to Confirmed
                  const newStatus = isActive ? 'Confirmed' : status;
                  handleStatusUpdate(item, newStatus);
                }}
              >
                <AppText
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.statusActionText, 
                    isActive && styles.statusActionTextActive,
                    disableForFuture && styles.statusActionTextDisabled
                  ]}
                >
                  {displayText}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const userName = orderGroup?.user?.full_name || 'Customer ' + (orderGroup?.user_id?.slice(0, 8) || 'Unknown');
    const userEmail = orderGroup?.user?.email || 'No email provided';
    const userGcash = orderGroup?.user?.gcash_number || 'No GCash provided';
    const plan = orderGroup?.order?.plan_snapshot || orderGroup?.order?.published_weekly_plans || {};
    const orderId = orderGroup?.id || orderGroup?.order?.id || 'Unknown';
    
    return (
      <View style={styles.headerContainer}>
        <HeaderBar 
          title="Delivery Details" 
          onBack={onBack} 
          action={{
            icon: isDark ? "moon" : "sun",
            onPress: () => setTheme(isDark ? "light" : "dark"),
            label: "Toggle Theme",
          }}
        />
        <View style={styles.orderSummary}>
          <AppText style={styles.summaryName}>{userName}</AppText>
          <AppText style={styles.summaryContact}>{userEmail}</AppText>
          <AppText style={styles.summaryContact}>GCash: {userGcash}</AppText>
          <AppText style={styles.summaryPlan}>{plan.name || 'Weekly plan'} • {plan.category || 'Meal plan'}</AppText>
          <AppText style={styles.summaryPlan}>Order #{orderId.slice(0, 8)}</AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.content}
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={renderDelivery}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AppText style={styles.emptyText}>No deliveries found for this order.</AppText>
          </View>
        }
        ListFooterComponent={
          <>
            {!!error && (
              <View style={styles.errorState}>
                <AppText style={styles.errorText}>{error}</AppText>
              </View>
            )}
            <View style={styles.footerSpacer} />
          </>
        }
      />
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  headerContainer: { marginBottom: 20 },
  orderSummary: { marginTop: 10, paddingHorizontal: 4 },
  summaryName: { color: colors.brand, fontSize: 20, fontWeight: '900', marginBottom: 2 },
  summaryContact: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  summaryPlan: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  deliveryCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  cardHeadText: { flex: 1, paddingRight: 10 },
  dateLabel: { color: colors.brand, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  timeSlot: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  statusAction: { minHeight: 40, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.border },
  statusActionActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  statusActionDisabled: { backgroundColor: colors.inputBg, borderColor: colors.border, opacity: 0.5 },
  statusActionText: { color: colors.brand, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  statusActionTextActive: { color: colors.surface },
  statusActionTextDisabled: { color: colors.muted },
  emptyState: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textSecondary, fontWeight: '700', textAlign: 'center' },
  errorState: { backgroundColor: colors.dangerSubtle, borderRadius: 16, padding: 14, marginTop: 8 },
  errorText: { color: colors.danger, fontWeight: '800', textAlign: 'center' },
  footerSpacer: { height: 12 },
});
