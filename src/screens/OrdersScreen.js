import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const summary = [
  { label: 'Total Orders', value: '24' },
  { label: 'Completed', value: '22', active: true },
  { label: 'Active', value: '2' },
];

const orders = [
  { title: 'Cutting Plan', date: 'Oct 5 - Oct 11', price: '$168.00', status: 'DELIVERED' },
  { title: 'Bulking Plan', date: 'Sep 28 - Oct 4', price: '$195.50', status: 'COMPLETED' },
  { title: 'Maintenance Plan', date: 'Sep 21 - Sep 27', price: '$152.00', status: 'COMPLETED' },
];

export default function OrdersScreen({ onOpenCheckout, onOpenReview }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="History" action={{ icon: '⚙️', onPress: () => {} }} />

      <View style={styles.summaryRow}>
        {summary.map((item) => (
          <View key={item.label} style={[styles.summaryCard, item.active && styles.summaryActive]}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {orders.map((order) => (
        <View key={order.title} style={styles.orderCard}>
          <View style={styles.orderBadge} />
          <View style={styles.orderBody}>
            <Text style={styles.orderTitle}>{order.title}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderPrice}>{order.price}</Text>
          </View>
          <View style={styles.orderActions}>
            <Pressable style={styles.orderButton} onPress={() => onOpenCheckout(order.title)}>
              <Text style={styles.orderButtonText}>Details</Text>
            </Pressable>
            <Pressable style={styles.reviewButton} onPress={() => onOpenReview(order.title)}>
              <Text style={styles.reviewButtonText}>Review</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.ctaCard}>
        <Text style={styles.ctaHeading}>Ready for next week?</Text>
        <Text style={styles.ctaDescription}>Stay on track with your Bulking Plan. Fast delivery guaranteed.</Text>
        <Pressable style={styles.ctaButton} onPress={() => onOpenCheckout('Bulking')}>
          <Text style={styles.ctaButtonText}>Reorder Favorite</Text>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  summaryActive: {
    backgroundColor: '#ebf5c7',
    borderColor: '#d8ed9a',
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  summaryValue: {
    color: COLORS.brand,
    fontSize: 26,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 14,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderBadge: {
    width: 56,
    height: 56,
    backgroundColor: '#dfeecc',
    borderRadius: 18,
    marginRight: 14,
  },
  orderBody: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 4,
  },
  orderDate: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand,
  },
  statusChip: {
    backgroundColor: '#e9f7dd',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  orderActions: {
    alignItems: 'flex-end',
  },
  orderButton: {
    backgroundColor: '#f4f7ef',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  orderButtonText: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  reviewButton: {
    backgroundColor: '#d6f18a',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  reviewButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 26,
    padding: 24,
    marginTop: 8,
  },
  ctaHeading: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  ctaDescription: {
    color: '#dde8d3',
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#d7f16a',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 15,
  },
});
