import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function AdminTrackingScreen({ onBack }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Admin Tracking" onBack={onBack} action={{ icon: '📍', onPress: () => {} }} />

      <View style={styles.card}>
        <Text style={styles.statusLabel}>CURRENT VIEW</Text>
        <Text style={styles.orderTitle}>Fulfillment Overview</Text>
        <Text style={styles.orderSubtitle}>Review delivery progress for all active customer orders.</Text>

        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerCompleted} />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Order Received</Text>
            <Text style={styles.stepDetail}>All items are queued for packing.</Text>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerCompleted} />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Preparation</Text>
            <Text style={styles.stepDetail}>Kitchen team is assembling meals.</Text>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerActive} />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Out for Delivery</Text>
            <Text style={styles.stepDetail}>Drivers are en route to customers.</Text>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.stepMarkerPending} />
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Complete</Text>
            <Text style={styles.stepDetail}>Marked after customer confirmation.</Text>
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
