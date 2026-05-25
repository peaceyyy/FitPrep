import AppText from '../components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function AdminTrackingScreen({ onBack }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Admin Tracking" onBack={onBack} />

      <View style={styles.card}>
        <AppText style={styles.statusLabel}>CURRENT VIEW</AppText>
        <AppText style={styles.orderTitle}>Fulfillment Overview</AppText>
        <AppText style={styles.orderSubtitle}>Review delivery progress for all active customer orders.</AppText>

        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerCompleted} />
          <View style={styles.stepContent}>
            <AppText style={styles.stepTitle}>Order Received</AppText>
            <AppText style={styles.stepDetail}>All items are queued for packing.</AppText>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerCompleted} />
          <View style={styles.stepContent}>
            <AppText style={styles.stepTitle}>Preparation</AppText>
            <AppText style={styles.stepDetail}>Kitchen team is assembling meals.</AppText>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerActive} />
          <View style={styles.stepContent}>
            <AppText style={styles.stepTitle}>Out for Delivery</AppText>
            <AppText style={styles.stepDetail}>Drivers are en route to customers.</AppText>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerPending} />
          <View style={styles.stepContent}>
            <AppText style={styles.stepTitle}>Complete</AppText>
            <AppText style={styles.stepDetail}>Marked after customer confirmation.</AppText>
          </View>
        </View>
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
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 6,
  },
  orderSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  stepMarkerCompleted: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginTop: 4,
    marginRight: 14,
  },
  stepMarkerActive: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.brand,
    marginTop: 4,
    marginRight: 14,
  },
  stepMarkerPending: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#d8dccf',
    marginTop: 4,
    marginRight: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.brand,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDetail: {
    color: COLORS.muted,
    lineHeight: 20,
  },
});
