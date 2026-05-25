import AppText from '../components/AppText';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import {
  PLAN_CATEGORIES,
  normalizeCategory,
} from '../services/plansService';

const CATEGORY_LABELS = {
  Cutting: 'Cut',
  Bulking: 'Bulk',
  Maintenance: 'Maintain',
};

function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? '₱--' : `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function PlansScreen({ user, onOpenCheckout, onOpenWeeklyPlan, onBack }) {
  const {
    browsingWeekStartDate,
    canShowNextWeek,
    currentWeekStartDate,
    customerPlans,
    error,
    loading,
    preorderEligibility,
    selectedCategory,
    selectedPlan,
    setSelectedCategory,
    showNextWeek,
    showPreviousWeek,
    subscriptionForWeek,
    weekRangeLabel,
  } = usePlans();

  const isCurrentWeek = browsingWeekStartDate === currentWeekStartDate;
  const subscriptionPlan = subscriptionForWeek?.published_weekly_plans;
  const hasPlansThisWeek = customerPlans.length > 0;
  const canPreorder = preorderEligibility.canPreorder;

  useEffect(() => {
    if (subscriptionPlan?.category) {
      setSelectedCategory(normalizeCategory(subscriptionPlan.category));
    } else if (!subscriptionForWeek) {
      setSelectedCategory(normalizeCategory(user?.goal));
    }
  }, [browsingWeekStartDate, setSelectedCategory, subscriptionPlan?.category, subscriptionForWeek, user?.goal]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar
        title="Plans"
        
        onBack={onBack}
      />

      <View style={styles.hero}>
        <AppText style={styles.greeting}>Your Meal Plans</AppText>
        <AppText style={styles.description}>
          {subscriptionForWeek
            ? `You're on ${subscriptionPlan?.name || 'a plan'} this week.`
            : 'Browse plans below. Preorders open when next week plans are published.'}
        </AppText>
      </View>

      {/* Week Navigator */}
      <View style={styles.weekNavigator}>
        <Pressable
          accessibilityRole="button"
          style={styles.weekArrow}
          onPress={showPreviousWeek}
        >
          <AppText style={styles.weekArrowText}>{'<'}</AppText>
        </Pressable>

        <View style={styles.weekRange}>
          <AppText style={styles.weekKicker}>{isCurrentWeek ? 'Current week plan' : 'Browsing meal week'}</AppText>
          <AppText style={styles.weekRangeText}>{weekRangeLabel}</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canShowNextWeek}
          style={[styles.weekArrow, !canShowNextWeek && styles.weekArrowDisabled]}
          onPress={showNextWeek}
        >
          <AppText style={[styles.weekArrowText, !canShowNextWeek && styles.weekArrowTextDisabled]}>{'>'}</AppText>
        </Pressable>
      </View>

      {!canShowNextWeek && isCurrentWeek && (
        <AppText style={styles.navHint}>Next week opens for customers once the menu is published.</AppText>
      )}

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {PLAN_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          const isSubscribed = subscriptionPlan && normalizeCategory(subscriptionPlan.category) === category;
          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              style={[styles.categoryTab, active && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <View style={styles.tabContentWrapper}>
                <AppText style={[styles.categoryTabText, active && styles.categoryTabTextActive]}>
                  {CATEGORY_LABELS[category]}
                </AppText>
                {isSubscribed && (
                  <View style={[styles.subscribedDot, active && styles.subscribedDotActive]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {loading && <ActivityIndicator color={COLORS.accent} style={styles.loader} />}
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}

      {!loading && !hasPlansThisWeek && !error && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>Hold your gains.</AppText>
          <AppText style={styles.emptyText}>No menu has been published for this week yet. Check back on Saturday — that's when new plans drop.</AppText>
        </View>
      )}

      {!loading && hasPlansThisWeek && !selectedPlan && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>Hold your gains.</AppText>
          <AppText style={styles.emptyText}>The {CATEGORY_LABELS[selectedCategory]} menu is still being prepared. Check back soon.</AppText>
        </View>
      )}

      {!loading && selectedPlan && (
        <View style={styles.planPanel}>
          <View style={styles.planTopRow}>
            <View>
              <AppText style={styles.planCategory}>{selectedPlan.category}</AppText>
              <AppText style={styles.planTitle}>{selectedPlan.name}</AppText>
            </View>
            <AppText style={styles.planPrice}>{formatPrice(selectedPlan.weekly_price)}</AppText>
          </View>
          <AppText style={styles.planDescription}>
            {selectedPlan.description || 'A balanced weekly menu built for your training goals.'}
          </AppText>

          <Pressable
            accessibilityRole="button"
            style={styles.viewMenuButton}
            onPress={() => onOpenWeeklyPlan && onOpenWeeklyPlan()}
          >
            <AppText style={styles.viewMenuButtonText}>View Full Menu</AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!canPreorder}
            style={[styles.preorderButton, !canPreorder && styles.preorderButtonDisabled]}
            onPress={() => canPreorder && onOpenCheckout(selectedPlan)}
          >
            <AppText style={[styles.preorderButtonText, !canPreorder && styles.preorderButtonTextDisabled]}>
              {canPreorder ? 'Preorder This Plan' : 'Preorder Locked'}
            </AppText>
          </Pressable>
          <AppText style={styles.preorderReason}>{preorderEligibility.reason}</AppText>
        </View>
      )}
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
  hero: {
    marginBottom: 18,
  },
  greeting: {
    color: COLORS.brand,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekArrow: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weekArrowDisabled: {
    opacity: 0.45,
  },
  weekArrowText: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '900',
  },
  weekArrowTextDisabled: {
    color: COLORS.muted,
  },
  weekRange: {
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#edf7d7',
    borderWidth: 1,
    borderColor: '#d9ebaf',
  },
  weekKicker: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  weekRangeText: {
    color: COLORS.brand,
    fontSize: 18,
    fontWeight: '900',
  },
  navHint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#e8edde',
    borderRadius: 18,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: COLORS.brand,
  },
  categoryTabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTabTextActive: {
    color: COLORS.surface,
  },
  tabContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginLeft: 6,
  },
  subscribedDotActive: {
    backgroundColor: COLORS.surface,
  },
  loader: {
    marginVertical: 26,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  emptyTitle: {
    color: COLORS.brand,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  planPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planCategory: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: COLORS.brand,
    fontSize: 22,
    fontWeight: '900',
    paddingRight: 12,
  },
  planPrice: {
    color: COLORS.brand,
    fontSize: 16,
    fontWeight: '900',
  },
  planDescription: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  viewMenuButton: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.brand,
    marginBottom: 10,
  },
  viewMenuButtonText: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: '900',
  },
  preorderButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand,
  },
  preorderButtonDisabled: {
    backgroundColor: '#e2e6d9',
  },
  preorderButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  preorderButtonTextDisabled: {
    color: COLORS.muted,
  },
  preorderReason: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
});
