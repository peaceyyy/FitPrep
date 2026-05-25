import AppText from '../components/AppText';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { placeOrder } from '../services/ordersService';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { usePlans } from '../context/PlansContext';
import { getPreorderEligibility } from '../services/plansService';

const timeOptions = [
  { label: '6:00 AM', subtitle: 'Early Morning' },
  { label: '10:00 AM', subtitle: 'Standard Window' },
];

export default function CheckoutScreen({ plan, user, onBack, onConfirm }) {
  const [selectedTime, setSelectedTime] = useState('6:00 AM');
  const [paymentType, setPaymentType] = useState('online');
  const [loading, setLoading] = useState(false);
  const [proofAttached, setProofAttached] = useState(false);
  const {
    browsingWeekStartDate,
    currentWeekStartDate,
    loadOrders,
    subscriptionForWeek,
  } = usePlans();
  const preorderEligibility = getPreorderEligibility({
    browsingWeekStartDate,
    currentWeekStartDate,
    selectedPlan: plan,
    subscriptionForWeek,
  });
  const canConfirm = preorderEligibility.canPreorder && !loading;

  const handleConfirm = async () => {
    if (!preorderEligibility.canPreorder) {
      Alert.alert('Preorder Locked', preorderEligibility.reason);
      return;
    }

    setLoading(true);
    try {
      let userId = user?.id || 'mock-user';
      if (isSupabaseConfigured) {
        const { data: sessionData } = await supabase.auth.getSession();
        userId = sessionData?.session?.user?.id;
      }

      if (!userId || !plan?.id) {
        Alert.alert('Error', 'Could not place order. Please try again.');
        return;
      }
      const { error } = await placeOrder(userId, plan.id);
      if (error) {
        Alert.alert('Order Failed', error.message);
        return;
      }
      console.log('✅ [Orders] Order placed successfully for plan:', plan.name);
      await loadOrders();
      onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Checkout" onBack={onBack}  />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.planBadge}><AppText style={styles.planBadgeText}>Plan Selected</AppText></View>
          <AppText style={styles.summaryMeals}>14 Total Meals</AppText>
        </View>
        <AppText style={styles.summaryTitle}>{plan?.name || 'Selected Plan'}</AppText>
        <View style={styles.recipeRow}>
          <View style={styles.recipeImage} />
          <View style={styles.recipeItems}>
            <AppText style={styles.recipeText}>6x Lemon Herb Roasted Chicken</AppText>
            <AppText style={styles.recipeText}>4x Wild Caught Salmon & Asparagus</AppText>
            <AppText style={styles.recipeText}>4x Lean Beef & Sweet Potato Mash</AppText>
          </View>
        </View>
        <View style={styles.planNote}>
          <AppText style={styles.planNoteIcon}>i</AppText>
          <AppText style={styles.planNoteText}>Nutritional Focus: Low Carb / High Protein</AppText>
          <AppText style={styles.planEdit}>Edit Items</AppText>
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Delivery Time</AppText>
      <View style={styles.timeRow}>
        {timeOptions.map((option) => (
          <Pressable
            key={option.label}
            style={[styles.timeOption, selectedTime === option.label && styles.timeOptionActive]}
            onPress={() => setSelectedTime(option.label)}
          >
            <AppText style={styles.timeIcon}>{option.label === '6:00 AM' ? '🌅' : '☀️'}</AppText>
            <AppText style={[styles.timeLabel, selectedTime === option.label && styles.timeLabelActive]}>{option.label}</AppText>
            <AppText style={styles.timeSubtitle}>{option.subtitle}</AppText>
          </Pressable>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Payment</AppText>
      <View style={styles.paymentRow}>
        <Pressable
          style={[styles.paymentOption, paymentType === 'cash' && styles.paymentOptionActive]}
          onPress={() => setPaymentType('cash')}
        >
          <AppText style={[styles.paymentLabel, paymentType === 'cash' && styles.paymentLabelActive]}>Cash on Delivery</AppText>
        </Pressable>
        <Pressable
          style={[styles.paymentOption, paymentType === 'online' && styles.paymentOptionActive]}
          onPress={() => setPaymentType('online')}
        >
          <AppText style={[styles.paymentLabel, paymentType === 'online' && styles.paymentLabelActive]}>Online Payment</AppText>
        </Pressable>
      </View>

      {paymentType === 'online' && (
        <View style={styles.onlineCard}>
          <View style={styles.qrPlaceholder}>
            <AppText style={styles.qrLabel}>QR Code</AppText>
          </View>
          <Pressable style={styles.attachButton} onPress={() => setProofAttached(true)}>
            <AppText style={styles.attachText}>{proofAttached ? 'Proof Attached' : 'Attach Proof of Payment'}</AppText>
          </Pressable>
        </View>
      )}

      <AppText style={styles.sectionTitle}>Shipping Address</AppText>
      <View style={styles.addressCard}>
        <AppText style={styles.addressTitle}>Home</AppText>
        <AppText style={styles.addressText}>482 Fitness Way, Apt 4B, Austin TX</AppText>
      </View>

      <View style={styles.totalCard}>
        <View style={styles.totalRow}><AppText style={styles.totalLabel}>Subtotal</AppText><AppText style={styles.totalValue}>${Number(plan?.weekly_price || 0).toFixed(2)}</AppText></View>
        <View style={styles.totalRow}><AppText style={styles.totalLabel}>Delivery Fee</AppText><AppText style={[styles.totalValue, styles.freeLabel]}>FREE</AppText></View>
        <View style={styles.divider} />
        <View style={styles.totalRow}><AppText style={styles.totalTitle}>Total</AppText><AppText style={styles.totalTitle}>${Number(plan?.weekly_price || 0).toFixed(2)}</AppText></View>
      </View>

      {!preorderEligibility.canPreorder && (
        <View style={styles.checkoutNotice}>
          <AppText style={styles.checkoutNoticeText}>{preorderEligibility.reason}</AppText>
        </View>
      )}

      <Pressable style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]} onPress={handleConfirm} disabled={!canConfirm}>
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <AppText style={[styles.confirmLabel, !canConfirm && styles.confirmLabelDisabled]}>{canConfirm ? 'Confirm & Pay →' : 'Preorder Locked'}</AppText>
        }
      </Pressable>
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  planBadge: {
    backgroundColor: COLORS.highlight,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  planBadgeText: {
    color: COLORS.brand,
    fontWeight: '700',
    fontSize: 11,
  },
  summaryMeals: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 18,
  },
  recipeRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  recipeImage: {
    width: 84,
    height: 84,
    backgroundColor: '#d6ebc1',
    borderRadius: 20,
    marginRight: 14,
  },
  recipeItems: {
    flex: 1,
    justifyContent: 'center',
  },
  recipeText: {
    color: COLORS.brand,
    fontSize: 13,
    marginBottom: 6,
  },
  planNote: {
    backgroundColor: '#f3f7e7',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planNoteIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#d6ebc1',
    marginRight: 10,
    color: COLORS.brand,
    fontWeight: '700',
  },
  planNoteText: {
    flex: 1,
    color: COLORS.textSecondary,
  },
  planEdit: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 14,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  timeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    marginRight: 12,
  },
  timeOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.highlightSubtle,
  },
  timeIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 4,
  },
  timeLabelActive: {
    color: COLORS.brand,
  },
  timeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    marginRight: 12,
    alignItems: 'center',
  },
  paymentOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.highlightSubtle,
  },
  paymentLabel: {
    color: COLORS.brand,
    fontWeight: '700',
    textAlign: 'center',
  },
  paymentLabelActive: {
    color: COLORS.brand,
  },
  onlineCard: {
    backgroundColor: '#f7f7f0',
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    backgroundColor: '#e3e8d5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrLabel: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  attachButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  attachText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },
  addressTitle: {
    color: COLORS.brand,
    fontWeight: '800',
    marginBottom: 8,
  },
  addressText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  totalCard: {
    backgroundColor: '#f4f7ee',
    borderRadius: 26,
    padding: 20,
    marginBottom: 22,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  freeLabel: {
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.brand,
  },
  confirmButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e2e6d9',
  },
  confirmLabel: {
    color: COLORS.surface,
    fontWeight: '800',
    fontSize: 16,
  },
  confirmLabelDisabled: {
    color: COLORS.muted,
  },
  checkoutNotice: {
    backgroundColor: '#eef3e4',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  checkoutNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
