import AppText from '../components/AppText';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { TYPOGRAPHY } from '../theme';

export default function OrderTrackingScreen({ onBack }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Track Order" onBack={onBack} />

      <View style={styles.card}>
        <AppText style={styles.statusLabel}>CURRENT DELIVERY</AppText>
        <View style={styles.orderHeadingRow}>
          <AppText style={styles.orderTitle}>Cutting Plan - Week 3</AppText>
          <View style={styles.activeBadge}><AppText style={styles.activeBadgeText}>Active</AppText></View>
        </View>
        <AppText style={styles.orderSubtitle}>Order #FP-98231</AppText>
        <View style={styles.avatarsRow}>
          <View style={styles.avatarDot} />
          <View style={styles.avatarDot} />
          <View style={styles.extraCount}><AppText style={styles.extraCountText}>+12</AppText></View>
        </View>
        <AppText style={styles.arrivalLabel}>Estimated Arrival</AppText>
        <AppText style={styles.arrivalTime}>Today, 2:30 PM</AppText>
      </View>

      <View style={styles.timelineCard}>
        <AppText style={styles.timelineTitle}>Delivery Status</AppText>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotCompleted} />
          <View style={styles.timelineContent}>
            <AppText style={styles.timelineStep}>Order Placed</AppText>
            <AppText style={styles.timelineDetail}>We have received your meal selection</AppText>
          </View>
          <AppText style={styles.timelineTime}>Oct 12, 09:00 AM</AppText>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotCompleted} />
          <View style={styles.timelineContent}>
            <AppText style={styles.timelineStep}>Preparing</AppText>
            <AppText style={styles.timelineDetail}>Chef-curated meals are being packed</AppText>
          </View>
          <AppText style={styles.timelineTime}>Oct 14, 02:30 PM</AppText>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotActive} />
          <View style={styles.timelineContent}>
            <AppText style={styles.timelineStep}>Out for Delivery</AppText>
            <AppText style={styles.timelineDetail}>Courier is 5 mins away from your location</AppText>
          </View>
          <AppText style={styles.timelineTime}>In Progress</AppText>
        </View>
      </View>

      <View style={styles.helpCard}>
        <AppText style={styles.helpHeading}>Delivery tracking moved</AppText>
        <AppText style={styles.helpText}>Use My Deliveries for the current Supabase-backed preorder and daily delivery status demo.</AppText>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  statusLabel: {
    color: colors.accent,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    flex: 1,
    marginRight: 12,
  },
  activeBadge: {
    backgroundColor: colors.highlight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeBadgeText: {
    color: colors.brand,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.xs,
  },
  orderSubtitle: {
    color: colors.textSecondary,
    marginBottom: 18,
    fontSize: TYPOGRAPHY.sm,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.highlight,
    marginRight: -12,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  extraCount: {
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceGreen,
  },
  extraCountText: {
    color: colors.brand,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.sm,
  },
  arrivalLabel: {
    color: colors.muted,
    marginBottom: 4,
    fontSize: TYPOGRAPHY.sm,
  },
  arrivalTime: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    marginBottom: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  timelineDotCompleted: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.brand,
    marginRight: 14,
  },
  timelineDotActive: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginRight: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStep: {
    color: colors.brand,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 4,
    fontSize: TYPOGRAPHY.sm,
  },
  timelineDetail: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.xs,
  },
  timelineTime: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.xs,
  },
  helpCard: {
    // Fixed dark brand bg for consistent readability in both light and dark modes
    backgroundColor: '#0b2912',
    borderRadius: 26,
    padding: 24,
  },
  helpHeading: {
    color: '#ffffff',
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 8,
  },
  helpText: {
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
    fontSize: TYPOGRAPHY.sm,
  },
});
