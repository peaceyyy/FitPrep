import AppText from '../components/AppText';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { updateDailyDeliveryStatus } from '../services/deliveriesService';

const STATUS_ACTIONS = [
  DELIVERY_STATUSES.PREPARING,
  DELIVERY_STATUSES.OUT_FOR_DELIVERY,
  DELIVERY_STATUSES.DELIVERED,
  DELIVERY_STATUSES.UNDELIVERED,
];

export default function AdminDeliveryDetailsScreen({ orderGroup, onBack }) {
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
    if (s.includes('cancelled') || s.includes('failed') || s.includes('undelivered')) return { bg: '#fbeaea', text: COLORS.danger };
    if (s.includes('paid') || s === 'delivered') return { bg: '#dff4da', text: COLORS.accent };
    if (s.includes('pending')) return { bg: '#fff0db', text: '#d97706' };
    return { bg: '#f0f1ea', text: COLORS.textSecondary };
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
                <AppText style={[
                  styles.statusActionText, 
                  isActive && styles.statusActionTextActive,
                  disableForFuture && styles.statusActionTextDisabled
                ]}>
                  {status}
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
    const plan = orderGroup?.order?.plan_snapshot || orderGroup?.order?.published_weekly_plans || {};
    
    return (
      <View style={styles.headerContainer}>
        <HeaderBar title="Delivery Details" onBack={onBack} />
        <View style={styles.orderSummary}>
          <AppText style={styles.summaryName}>{userName}</AppText>
          <AppText style={styles.summaryPlan}>{plan.name || 'Weekly plan'} • {plan.category || 'Meal plan'}</AppText>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  headerContainer: { marginBottom: 20 },
  orderSummary: { marginTop: 10, paddingHorizontal: 4 },
  summaryName: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  summaryPlan: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  deliveryCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  cardHeadText: { flex: 1, paddingRight: 10 },
  dateLabel: { color: COLORS.brand, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  timeSlot: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#dff4da' },
  statusText: { color: COLORS.brand, fontSize: 11, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusAction: { minHeight: 44, flex: 1, minWidth: '30%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7ef', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, marginRight: 8, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  statusActionActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  statusActionDisabled: { backgroundColor: '#f0f1ea', borderColor: COLORS.border, opacity: 0.5 },
  statusActionText: { color: COLORS.brand, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  statusActionTextActive: { color: COLORS.surface },
  statusActionTextDisabled: { color: COLORS.muted },
  emptyState: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textSecondary, fontWeight: '700', textAlign: 'center' },
  errorState: { backgroundColor: COLORS.dangerSubtle, borderRadius: 16, padding: 14, marginTop: 8 },
  errorText: { color: COLORS.danger, fontWeight: '800', textAlign: 'center' },
  footerSpacer: { height: 12 },
});
