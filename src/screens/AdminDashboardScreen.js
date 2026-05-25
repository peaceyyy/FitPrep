import AppText from "../components/AppText";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import HeaderBar from "../components/HeaderBar";
import { usePlans } from "../context/PlansContext";
import { useTheme } from "../context/useTheme";
import { fetchAllOrders } from "../services/ordersService";
import { fetchAllDailyDeliveries } from "../services/deliveriesService";
import { DELIVERY_STATUSES } from "../services/deliveryStatusService";

export default function AdminDashboardScreen({ user, onLogout, onBack }) {
  const { plans } = usePlans();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const [ordersResult, deliveriesResult] = await Promise.all([
      fetchAllOrders(),
      fetchAllDailyDeliveries(),
    ]);

    if (ordersResult.error || deliveriesResult.error) {
      setError(
        ordersResult.error?.message ||
          deliveriesResult.error?.message ||
          "Could not load admin dashboard.",
      );
    }

    setOrders(ordersResult.data || []);
    setDeliveries(deliveriesResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboard = useMemo(() => {
    const activePlans = plans?.filter((plan) => plan.is_published).length || 0;
    const activeDeliveries = deliveries.filter(
      (delivery) => delivery.current_status !== DELIVERY_STATUSES.DELIVERED,
    ).length;
    const outForDelivery = deliveries.filter(
      (delivery) =>
        delivery.current_status === DELIVERY_STATUSES.OUT_FOR_DELIVERY,
    ).length;
    const preparing = deliveries.filter(
      (delivery) => delivery.current_status === DELIVERY_STATUSES.PREPARING,
    ).length;
    const completedDeliveries = deliveries.filter(
      (delivery) => delivery.current_status === DELIVERY_STATUSES.DELIVERED,
    ).length;
    const revenueTotal = orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.amount_paid ??
            order.plan_snapshot?.weekly_price ??
            order.published_weekly_plans?.weekly_price ??
            0,
        ),
      0,
    );

    return {
      activePlans,
      activeDeliveries,
      outForDelivery,
      preparing,
      completedDeliveries,
      orderCount: orders.length,
      revenue: `₱${revenueTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    };
  }, [deliveries, orders, plans]);

  const snapshotPills = [
    { label: "Orders", value: dashboard.orderCount, icon: "shopping-bag" },
    { label: "In progress", value: dashboard.activeDeliveries, icon: "truck" },
    { label: "Live plans", value: dashboard.activePlans, icon: "grid" },
  ];

  const operationsItems = [
    { label: "Payments collected", value: dashboard.revenue },
    { label: "Completed deliveries", value: dashboard.completedDeliveries },
    { label: "Admin account", value: user?.email || "Admin account" },
  ];

  const todayWorkItems = [
    {
      label: "Ready to dispatch",
      value: dashboard.preparing,
      detail: "Meals being prepared",
      icon: "package",
    },
    {
      label: "Out for delivery",
      value: dashboard.outForDelivery,
      detail: "Check delivery status",
      icon: "truck",
    },
    {
      label: "Published plans",
      value: dashboard.activePlans,
      detail: "Visible to customers",
      icon: "calendar",
    },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar
        title="Dashboard"
        action={{ icon: "refresh-cw", onPress: loadDashboard }}
        onBack={onBack}
      />
      <AppText style={styles.title}>Admin Overview</AppText>

      {loading && (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      )}

      {!loading && !!error && (
        <View style={styles.errorCard}>
          <AppText style={styles.errorTitle}>
            Dashboard data unavailable
          </AppText>
          <AppText style={styles.errorText}>{error}</AppText>
          <Pressable style={styles.retryButton} onPress={loadDashboard}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      )}

      {!loading && (
        <View style={styles.snapshotRow}>
          {snapshotPills.map((item) => (
            <View key={item.label} style={styles.snapshotPill}>
              <View style={styles.snapshotIcon}>
                <Feather name={item.icon} size={16} color={colors.brand} />
              </View>
              <View>
                <AppText style={styles.snapshotValue}>{item.value}</AppText>
                <AppText style={styles.snapshotLabel}>{item.label}</AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.workCard}>
        <View style={styles.cardHeader}>
          <AppText style={styles.cardTitle}>Today's Work</AppText>
          <Feather name="clipboard" size={18} color={colors.accent} />
        </View>
        {todayWorkItems.map((item) => (
          <View key={item.label} style={styles.workRow}>
            <View style={styles.workIcon}>
              <Feather name={item.icon} size={16} color={colors.brand} />
            </View>
            <View style={styles.workCopy}>
              <AppText style={styles.workLabel}>{item.label}</AppText>
              <AppText style={styles.workDetail}>{item.detail}</AppText>
            </View>
            <AppText style={styles.workValue}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.operationsCard}>
        <AppText style={styles.cardTitle}>Business Summary</AppText>
        {operationsItems.map((item) => (
          <View key={item.label} style={styles.operationsRow}>
            <AppText style={styles.operationsLabel}>{item.label}</AppText>
            <AppText style={styles.operationsValue}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <Pressable style={styles.logoutAction} onPress={onLogout}>
        <AppText style={styles.logoutActionText}>Logout</AppText>
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  subHeading: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 18,
  },
  loader: { marginVertical: 24 },
  snapshotRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  snapshotPill: {
    minHeight: 74,
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  snapshotIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceGreen, // dynamic color instead of static #edf7d7
    marginBottom: 8,
  },
  snapshotValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.brand,
    marginBottom: 4,
  },
  snapshotLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  workCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: { color: colors.brand, fontWeight: "800" },
  workRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  workIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceGreen, // dynamic color instead of static #edf7d7
    marginRight: 12,
  },
  workCopy: { flex: 1 },
  workLabel: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 3,
  },
  workDetail: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  workValue: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 12,
  },
  operationsCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  operationsRow: {
    minHeight: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  operationsLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  operationsValue: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "900",
    maxWidth: "52%",
    textAlign: "right",
  },
  errorCard: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: { color: colors.danger, fontWeight: "900", marginBottom: 6 },
  errorText: { color: colors.danger, lineHeight: 20 },
  retryButton: {
    minHeight: 42,
    alignSelf: "flex-start",
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  retryButtonText: { color: colors.surface, fontWeight: "900" },
  logoutAction: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutActionText: { color: colors.danger, fontWeight: "900" },
});
