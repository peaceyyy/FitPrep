import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function OrderTrackingScreen({ onBack }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Track Order" onBack={onBack} action={{ icon: '❓', onPress: () => {} }} />

      <View style={styles.card}>
        <Text style={styles.statusLabel}>CURRENT DELIVERY</Text>
        <View style={styles.orderHeadingRow}>
          <Text style={styles.orderTitle}>Cutting Plan - Week 3</Text>
          <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
        </View>
        <Text style={styles.orderSubtitle}>Order #FP-98231</Text>
        <View style={styles.avatarsRow}>
          <View style={styles.avatarDot} />
          <View style={styles.avatarDot} />
          <View style={styles.extraCount}><Text style={styles.extraCountText}>+12</Text></View>
        </View>
        <Text style={styles.arrivalLabel}>Estimated Arrival</Text>
        <Text style={styles.arrivalTime}>Today, 2:30 PM</Text>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Delivery Status</Text>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotCompleted} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStep}>Order Placed</Text>
            <Text style={styles.timelineDetail}>We have received your meal selection</Text>
          </View>
          <Text style={styles.timelineTime}>Oct 12, 09:00 AM</Text>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotCompleted} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStep}>Preparing</Text>
            <Text style={styles.timelineDetail}>Chef-curated meals are being packed</Text>
          </View>
          <Text style={styles.timelineTime}>Oct 14, 02:30 PM</Text>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDotActive} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStep}>Out for Delivery</Text>
            <Text style={styles.timelineDetail}>Courier is 5 mins away from your location</Text>
          </View>
          <Text style={styles.timelineTime}>In Progress</Text>
        </View>
        <View style={styles.timelineFooter}>
          <View style={styles.mapPlaceholder} />
          <View style={styles.routePartner}>
            <View style={styles.partnerAvatar} />
            <View>
              <Text style={styles.partnerName}>Marcus J.</Text>
              <Text style={styles.partnerDetail}>Your Delivery Partner</Text>
            </View>
            <Pressable style={styles.callButton} onPress={() => {}}>
              <Text style={styles.callButtonText}>📞</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpHeading}>Need help with this order?</Text>
        <Text style={styles.helpText}>Our wellness experts are online</Text>
        <Pressable style={styles.helpButton} onPress={() => {}}>
          <Text style={styles.helpButtonText}>Chat Now</Text>
        </Pressable>
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
    backgroundColor: '#d6f18a',
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
  timelineFooter: {
    marginTop: 10,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 20,
    backgroundColor: '#e9f3da',
    marginBottom: 16,
  },
  routePartner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f9ec',
    borderRadius: 20,
    padding: 14,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#d6e6bd',
    marginRight: 12,
  },
  partnerName: {
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 2,
  },
  partnerDetail: {
    color: COLORS.muted,
    fontSize: 12,
  },
  callButton: {
    marginLeft: 'auto',
    backgroundColor: COLORS.brand,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  helpCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 26,
    padding: 24,
  },
  helpHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  helpText: {
    color: '#dde8d3',
    lineHeight: 20,
    marginBottom: 18,
  },
  helpButton: {
    backgroundColor: '#d7f16a',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  helpButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 15,
  },
});
