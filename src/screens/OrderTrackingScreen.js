import AppText from '../components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function OrderTrackingScreen({ onBack }) {
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

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  statusLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  orderHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brand,
    flex: 1,
    marginRight: 12,
  },
  activeBadge: {
    backgroundColor: COLORS.highlight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeBadgeText: {
    color: COLORS.brand,
    fontWeight: '700',
    fontSize: 11,
  },
  orderSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: 18,
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
    backgroundColor: '#d6ebc1',
    marginRight: -12,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  extraCount: {
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#e8f4d2',
  },
  extraCountText: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  arrivalLabel: {
    color: COLORS.muted,
    marginBottom: 4,
  },
  arrivalTime: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.brand,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
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
    backgroundColor: COLORS.brand,
    marginRight: 14,
  },
  timelineDotActive: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginRight: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStep: {
    color: COLORS.brand,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDetail: {
    color: COLORS.muted,
    fontSize: 13,
  },
  timelineTime: {
    color: COLORS.muted,
    fontSize: 12,
  },
  helpCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 26,
    padding: 24,
  },
  helpHeading: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  helpText: {
    color: '#dde8d3',
    lineHeight: 20,
  },
});
