import AppText from '../components/AppText';
import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { MOCK_PAYMENT_METHOD, normalizeDeliveryTime, placeOrder } from '../services/ordersService';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { usePlans } from '../context/PlansContext';
import { getPreorderEligibility } from '../services/plansService';
import { Ionicons } from '@expo/vector-icons';

const timeOptions = [
  { label: '6:00 AM', subtitle: 'Early Morning' },
  { label: '10:00 AM', subtitle: 'Standard Window' },
];

export default function CheckoutScreen({ plan, user, onBack, onConfirm }) {
  const [selectedTime, setSelectedTime] = useState('6:00 AM');
  const [loading, setLoading] = useState(false);
  const [paymentMarked, setPaymentMarked] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  
  const {
    browsingWeekStartDate,
    currentWeekStartDate,
    loadOrders,
    subscriptionForWeek,
    selectedPlanMeals,
  } = usePlans();

  const preorderEligibility = getPreorderEligibility({
    browsingWeekStartDate,
    currentWeekStartDate,
    selectedPlan: plan,
    subscriptionForWeek,
  });

  const canConfirm = preorderEligibility.canPreorder && !loading;

  // Group meals by day of week and sort by meal type
  const mealsByDay = useMemo(() => {
    const grouped = {};
    const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    DAYS_ORDER.forEach(day => {
      grouped[day] = { Breakfast: null, Lunch: null, Dinner: null };
    });

    if (Array.isArray(selectedPlanMeals)) {
      selectedPlanMeals.forEach(meal => {
        const day = meal.day_of_week;
        const type = meal.meal_type || 'Lunch';
        if (grouped[day]) {
          grouped[day][type] = meal;
        }
      });
    }

    return grouped;
  }, [selectedPlanMeals]);

  const scheduleDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const visibleScheduleDays = showFullSchedule ? scheduleDays : scheduleDays.slice(0, 2);
  const remainingScheduleDays = Math.max(scheduleDays.length - visibleScheduleDays.length, 0);

  const handleConfirm = async () => {
    if (!preorderEligibility.canPreorder) {
      Alert.alert('Preorder Locked', preorderEligibility.reason);
      return;
    }

    const deliveryTime = normalizeDeliveryTime(selectedTime);
    if (!deliveryTime) {
      Alert.alert('Delivery Time Required', 'Choose either 6:00 AM or 10:00 AM before placing your preorder.');
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
      const { error } = await placeOrder(userId, plan, { deliveryTime });
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
          <AppText style={styles.summaryMeals}>{selectedPlanMeals?.length || 21} Total Meals</AppText>
        </View>
        <AppText style={styles.summaryTitle}>{plan?.name || 'Selected Plan'}</AppText>
        
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleHeader}>
            <View>
              <AppText style={styles.scheduleTitle}>Meal Schedule</AppText>
              <AppText style={styles.scheduleSubtitle}>
                {showFullSchedule ? 'Full week shown' : 'Previewing the first two delivery days'}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.scheduleToggle, pressed && { opacity: 0.75 }]}
              onPress={() => setShowFullSchedule((current) => !current)}
            >
              <Ionicons
                name={showFullSchedule ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.brand}
              />
            </Pressable>
          </View>

          {visibleScheduleDays.map((day) => {
            const dayMeals = mealsByDay[day] || { Breakfast: null, Lunch: null, Dinner: null };
            return (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <AppText style={styles.dayName}>{day}</AppText>
                </View>
                <View style={styles.mealsGrid}>
                  <View style={styles.mealRow}>
                    <Ionicons name="sunny-outline" size={14} color="#d4a373" style={styles.mealIcon} />
                    <View style={styles.mealTextContainer}>
                      <AppText style={styles.mealTypeLabel}>Breakfast: </AppText>
                      <AppText style={styles.mealNameText}>{dayMeals.Breakfast?.meal_name || 'No breakfast scheduled'}</AppText>
                    </View>
                  </View>
                  <View style={styles.mealRow}>
                    <Ionicons name="sunny" size={14} color="#e76f51" style={styles.mealIcon} />
                    <View style={styles.mealTextContainer}>
                      <AppText style={styles.mealTypeLabel}>Lunch: </AppText>
                      <AppText style={styles.mealNameText}>{dayMeals.Lunch?.meal_name || 'No lunch scheduled'}</AppText>
                    </View>
                  </View>
                  <View style={styles.mealRow}>
                    <Ionicons name="moon-outline" size={14} color="#264653" style={styles.mealIcon} />
                    <View style={styles.mealTextContainer}>
                      <AppText style={styles.mealTypeLabel}>Dinner: </AppText>
                      <AppText style={styles.mealNameText}>{dayMeals.Dinner?.meal_name || 'No dinner scheduled'}</AppText>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          {!showFullSchedule && remainingScheduleDays > 0 && (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.scheduleMoreButton, pressed && { opacity: 0.75 }]}
              onPress={() => setShowFullSchedule(true)}
            >
              <AppText style={styles.scheduleMoreText}>
                Show {remainingScheduleDays} more days
              </AppText>
            </Pressable>
          )}
        </View>

        <View style={styles.planNote}>
          <AppText style={styles.planNoteIcon}>i</AppText>
          <AppText style={styles.planNoteText}>
            Nutritional Focus: {plan?.category === 'Cutting' ? 'Low Carb / High Protein' : plan?.category === 'Bulking' ? 'High Calorie / High Protein' : 'Balanced Macros'}
          </AppText>
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Delivery Time</AppText>
      <View style={styles.timeRow}>
        {timeOptions.map((option) => (
          <Pressable
            key={option.label}
            style={({ pressed }) => [
              styles.timeOption, 
              selectedTime === option.label && styles.timeOptionActive,
              pressed && { opacity: 0.75 }
            ]}
            onPress={() => setSelectedTime(option.label)}
          >
            <Ionicons 
              name={option.label === '6:00 AM' ? 'partly-sunny-outline' : 'sunny-outline'} 
              size={24} 
              color={selectedTime === option.label ? COLORS.brand : COLORS.textSecondary} 
              style={{ marginBottom: 6 }}
            />
            <AppText style={[styles.timeLabel, selectedTime === option.label && styles.timeLabelActive]}>{option.label}</AppText>
            <AppText style={styles.timeSubtitle}>{option.subtitle}</AppText>
          </Pressable>
        ))}
      </View>

      <AppText style={styles.sectionTitle}>Payment Method</AppText>
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Ionicons name="card-outline" size={20} color={COLORS.brand} style={{ marginRight: 8 }} />
          <AppText style={styles.paymentCardTitle}>{MOCK_PAYMENT_METHOD} Demo Payment</AppText>
        </View>
        
        <View style={styles.onlineCardContent}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={48} color={COLORS.brand} style={{ marginBottom: 6 }} />
            <AppText style={styles.qrLabel}>GCASH DEMO QR</AppText>
            <AppText style={styles.qrSubText}>Shown for the MVP walkthrough only</AppText>
          </View>
          
          <View style={styles.paymentDetails}>
            <AppText style={styles.detailsLabel}>Payment Receiver:</AppText>
            <AppText style={styles.detailsValue}>PrepMate Food Services</AppText>
            <AppText style={styles.detailsLabel}>Customer GCash:</AppText>
            <AppText style={styles.detailsValue}>{user?.contactNumber || 'Not provided'}</AppText>
            <AppText style={styles.detailsLabel}>Payment Status:</AppText>
            <AppText style={styles.detailsValue}>Mock paid on preorder</AppText>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.attachButton, 
              paymentMarked && styles.attachButtonSuccess,
              pressed && { opacity: 0.75 }
            ]} 
            onPress={() => setPaymentMarked(!paymentMarked)}
          >
            <Ionicons name={paymentMarked ? "checkmark-circle" : "wallet-outline"} size={18} color="#fff" style={{ marginRight: 8 }} />
            <AppText style={styles.attachText}>
              {paymentMarked ? 'Demo Payment Marked' : 'Mark Demo Payment'}
            </AppText>
          </Pressable>
        </View>
      </View>

      <AppText style={styles.sectionTitle}>Delivery Address</AppText>
      <View style={styles.addressCard}>
        <AppText style={styles.addressTitle}>{user?.name || 'Customer'}</AppText>
        <AppText style={styles.addressText}>{user?.address || 'No delivery address saved yet.'}</AppText>
      </View>

      <View style={styles.totalCard}>
        <View style={styles.totalRow}><AppText style={styles.totalLabel}>Subtotal</AppText><AppText style={styles.totalValue}>₱{Number(plan?.weekly_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</AppText></View>
        <View style={styles.totalRow}><AppText style={styles.totalLabel}>Delivery Fee</AppText><AppText style={[styles.totalValue, styles.freeLabel]}>FREE</AppText></View>
        <View style={styles.divider} />
        <View style={styles.totalRow}><AppText style={styles.totalTitle}>Total</AppText><AppText style={styles.totalTitle}>₱{Number(plan?.weekly_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</AppText></View>
      </View>

      {!preorderEligibility.canPreorder && (
        <View style={styles.checkoutNotice}>
          <AppText style={styles.checkoutNoticeText}>{preorderEligibility.reason}</AppText>
        </View>
      )}

      <Pressable 
        style={({ pressed }) => [
          styles.confirmButton, 
          !canConfirm && styles.confirmButtonDisabled,
          pressed && canConfirm && { opacity: 0.75 }
        ]} 
        onPress={handleConfirm} 
        disabled={!canConfirm}
      >
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <AppText style={[styles.confirmLabel, !canConfirm && styles.confirmLabelDisabled]}>{canConfirm ? 'Place Preorder →' : 'Preorder Locked'}</AppText>
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
  planNote: {
    backgroundColor: '#f3f7e7',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
    fontSize: 13,
  },
  scheduleContainer: {
    marginTop: 6,
    marginBottom: 14,
  },
  scheduleHeader: {
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  scheduleToggle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.highlightSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayCard: {
    backgroundColor: '#f9fbf7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eaf0e3',
  },
  dayHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf2e8',
    paddingBottom: 6,
    marginBottom: 8,
  },
  dayName: {
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 13,
  },
  mealsGrid: {
    gap: 8,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    marginRight: 8,
    width: 16,
    textAlign: 'center',
  },
  mealTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeLabel: {
    fontWeight: '700',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mealNameText: {
    fontSize: 12,
    color: COLORS.brand,
    fontWeight: '500',
    flex: 1,
  },
  scheduleMoreButton: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.highlightSubtle,
  },
  scheduleMoreText: {
    color: COLORS.brand,
    fontSize: 13,
    fontWeight: '800',
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
    alignItems: 'center',
  },
  timeOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.highlightSubtle,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 4,
  },
  timeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.highlightSubtle,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  paymentCardTitle: {
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 15,
  },
  onlineCardContent: {
    width: '100%',
  },
  qrPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    backgroundColor: '#edf2e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  qrLabel: {
    color: COLORS.brand,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  qrSubText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  paymentDetails: {
    backgroundColor: '#f9fbf7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaf0e3',
  },
  detailsLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsValue: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  attachButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  attachButtonSuccess: {
    backgroundColor: '#2a9d8f',
  },
  attachText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 14,
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

