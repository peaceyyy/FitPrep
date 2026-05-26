import AppText from '../components/AppText';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { DELIVERY_STATUSES } from '../services/deliveryStatusService';
import { fetchAllDailyDeliveries } from '../services/deliveriesService';

export default function AdminOrdersScreen({ onBack, onOpenDeliveryDetails }) {
  const { colors, isDark, setTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  const loadDeliveries = useCallback(async ({ showPageLoader = true } = {}) => {
    if (showPageLoader) {
      setLoading(true);
    }
    setError('');
    const { data, error: fetchError } = await fetchAllDailyDeliveries();
    if (fetchError) {
      setDeliveries([]);
      setError(fetchError.message || 'Could not load delivery orders.');
    } else {
      setDeliveries(data || []);
    }
    if (showPageLoader) {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDeliveries({ showPageLoader: false });
    } finally {
      setRefreshing(false);
    }
  }, [loadDeliveries]);

  useEffect(() => {
    loadDeliveries();
    return () => {};
  }, [loadDeliveries]);

  const groupedOrders = useMemo(() => {
    const map = {};
    deliveries.forEach(delivery => {
      const wid = delivery.weekly_order_id;
      if (!map[wid]) {
        map[wid] = {
          id: wid,
          user: delivery.user,
          user_id: delivery.user_id,
          order: delivery.weekly_orders || {},
          deliveries: [],
        };
      }
      map[wid].deliveries.push(delivery);
    });
    return Object.values(map);
  }, [deliveries]);

  const filtered = useMemo(() => {
    const lower = searchText.trim().toLowerCase();
    return groupedOrders.filter((group) => {
      const plan = group.order.plan_snapshot || group.order.published_weekly_plans || {};
      const userName = group.user?.full_name || '';
      const haystack = [
        group.id,
        group.user_id,
        userName,
        plan.name,
        plan.category,
      ].filter(Boolean).join(' ').toLowerCase();

      return !lower || haystack.includes(lower);
    });
  }, [groupedOrders, searchText]);

  const summary = useMemo(() => {
    let completedOrders = 0;
    groupedOrders.forEach(group => {
      const allDelivered = group.deliveries.length > 0 && group.deliveries.every(d => d.current_status === DELIVERY_STATUSES.DELIVERED);
      if (allDelivered) completedOrders++;
    });
    return {
      active: groupedOrders.length - completedOrders,
      completed: completedOrders,
      total: groupedOrders.length,
    };
  }, [groupedOrders]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderOrderGroup = ({ item }) => {
    const order = item.order || {};
    const plan = order.plan_snapshot || order.published_weekly_plans || {};
    const userName = item.user?.full_name || 'Customer ' + (item.user_id?.slice(0, 8) || 'Unknown');
    const userLocation = item.user?.address || 'No location provided';
    
    // Sort deliveries by date
    const sortedDeliveries = [...item.deliveries].sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));
    const firstDelivery = sortedDeliveries[0];
    const lastDelivery = sortedDeliveries[sortedDeliveries.length - 1];
    const dateRange = firstDelivery && lastDelivery 
      ? `${formatDate(firstDelivery.delivery_date)} - ${formatDate(lastDelivery.delivery_date)}`
      : 'N/A';

    const deliveredCount = item.deliveries.filter(d => d.current_status === DELIVERY_STATUSES.DELIVERED).length;
    const progress = `${deliveredCount}/${item.deliveries.length} Delivered`;

    return (
      <Pressable
        style={({ pressed }) => [styles.deliveryCard, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
        onPress={() => onOpenDeliveryDetails?.(item)}
      >
        <View style={styles.cardHead}>
          <View style={styles.cardHeadText}>
            <AppText style={styles.customerLabel}>{userName}</AppText>
            <AppText style={styles.planName}>{plan.name || 'Weekly plan'}</AppText>
            <AppText style={styles.planMeta}>{plan.category || 'Meal plan'} • Order #{item.id?.slice(0, 8)}</AppText>
            <AppText style={styles.locationText}>📍 {userLocation}</AppText>
          </View>
          <View style={styles.pillBadge}>
            <AppText style={styles.pillBadgeText}>Details</AppText>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCell}>
            <AppText style={styles.detailLabel}>Schedule</AppText>
            <AppText style={styles.detailValue}>{dateRange}</AppText>
          </View>
          <View style={styles.detailCell}>
            <AppText style={styles.detailLabel}>Progress</AppText>
            <AppText style={styles.detailValue}>{progress}</AppText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View>
      <HeaderBar 
        title="Orders" 
        action={{
          icon: isDark ? "moon" : "sun",
          onPress: () => setTheme(isDark ? "light" : "dark"),
          label: "Toggle Theme",
        }}
        onBack={onBack} 
      />

      <View style={{ marginBottom: 14 }}>
        <AppText style={{ color: colors.brand, fontSize: 28, fontWeight: "900" }}>Delivery Orders</AppText>
      </View>

      <View style={styles.pillSummaryRow}>
        <View style={[styles.pillSummary, { backgroundColor: colors.highlightSubtle, borderColor: colors.accent }]}>
          <AppText style={[styles.pillSummaryLabel, { color: colors.accent }]}>Active: {summary.active}</AppText>
        </View>
        <View style={[styles.pillSummary, { backgroundColor: colors.surfaceGreen, borderColor: colors.border }]}>
          <AppText style={[styles.pillSummaryLabel, { color: colors.textSecondary }]}>Completed: {summary.completed}</AppText>
        </View>
        <View style={[styles.pillSummary, { backgroundColor: colors.surfaceGreen, borderColor: colors.border }]}>
          <AppText style={[styles.pillSummaryLabel, { color: colors.textSecondary }]}>Total: {summary.total}</AppText>
        </View>
      </View>

      <View style={styles.searchShell}>
        <Feather name="search" size={16} color={colors.textSecondary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search order, customer, plan..."
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
        />
        {!!searchText && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            style={({ pressed }) => [styles.clearSearchButton, pressed && { opacity: 0.7 }]}
            onPress={() => setSearchText('')}
          >
            <Feather name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={loading || error ? [] : filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderGroup}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={<View style={styles.footerSpacer} />}
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      )}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />
      ) : error ? (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>Delivery orders unavailable</AppText>
          <AppText style={styles.emptyText}>{error}</AppText>
          <Pressable style={styles.retryButton} onPress={loadDeliveries}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyText}>No orders match your search.</AppText>
        </View>
      )}
    />
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  pillSummaryRow: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  pillSummary: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  pillSummaryLabel: { fontSize: 13, fontWeight: '700' },
  searchShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 14, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, minHeight: 52, paddingHorizontal: 10, color: colors.brand, fontSize: 15 },
  clearSearchButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.inputBg },
  emptyState: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.brand, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  retryButton: { minHeight: 44, marginTop: 16, borderRadius: 16, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand },
  retryButtonText: { color: colors.surface, fontWeight: '800' },
  deliveryCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  cardHeadText: { flex: 1, paddingRight: 10 },
  customerLabel: { color: colors.brand, fontSize: 17, fontWeight: '900', marginBottom: 4 },
  planName: { color: colors.brand, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  planMeta: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  locationText: { color: colors.textSecondary, fontSize: 13, marginTop: 6, fontWeight: '600' },
  pillBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.surfaceGreen },
  pillBadgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  detailCell: { width: '50%', marginBottom: 10 },
  detailLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 3 },
  detailValue: { color: colors.brand, fontSize: 14, fontWeight: '800' },
  footerSpacer: { height: 12 },
});
