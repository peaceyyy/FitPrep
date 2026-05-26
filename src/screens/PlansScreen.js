import AppText from '../components/AppText';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { usePlans } from '../context/PlansContext';
import { useTheme } from '../context/useTheme';
import { TYPOGRAPHY } from '../theme';
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
    canShowPreviousWeek,
    currentWeekStartDate,
    customerPlans,
    error,
    loading,
    preorderEligibility,
    refreshCustomerData,
    selectedCategory,
    selectedPlan,
    setSelectedCategory,
    showNextWeek,
    showPreviousWeek,
    subscriptionForWeek,
    weekRangeLabel,
  } = usePlans();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);

  const isCurrentWeek = browsingWeekStartDate === currentWeekStartDate;
  const subscriptionPlan = subscriptionForWeek?.published_weekly_plans;
  const hasPlansThisWeek = customerPlans.length > 0;
  const canPreorder = preorderEligibility.canPreorder;
  const planWeekCopy = subscriptionForWeek
    ? `${subscriptionPlan?.name || 'Your plan'} is already locked for ${weekRangeLabel}.`
    : 'Browse published weekly menus and preorder before the delivery week starts.';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCustomerData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshCustomerData]);

  useEffect(() => {
    if (subscriptionPlan?.category) {
      setSelectedCategory(normalizeCategory(subscriptionPlan.category));
    } else if (!subscriptionForWeek) {
      setSelectedCategory(normalizeCategory(user?.goal));
    }
  }, [browsingWeekStartDate, setSelectedCategory, subscriptionPlan?.category, subscriptionForWeek, user?.goal]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      )}
    >
      <HeaderBar
        title="Plans"
        
        onBack={onBack}
      />

      <View style={styles.hero}>
        <AppText style={styles.greeting}>Your Meal Plans</AppText>
        <AppText style={styles.description}>
          {planWeekCopy}
        </AppText>
      </View>

      {/* Week Navigator */}
      <View style={styles.weekNavigator}>
        <Pressable
          accessibilityRole="button"
          disabled={!canShowPreviousWeek}
          style={[styles.weekArrow, !canShowPreviousWeek && styles.weekArrowDisabled]}
          onPress={showPreviousWeek}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canShowPreviousWeek ? colors.brand : colors.muted}
          />
        </Pressable>

        <View style={styles.weekRange}>
          <AppText style={styles.weekKicker}>{isCurrentWeek ? 'This week' : 'Meal week'}</AppText>
          <AppText style={styles.weekRangeText}>{weekRangeLabel}</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canShowNextWeek}
          style={[styles.weekArrow, !canShowNextWeek && styles.weekArrowDisabled]}
          onPress={showNextWeek}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={canShowNextWeek ? colors.brand : colors.muted}
          />
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

      {loading && <ActivityIndicator color={colors.accent} style={styles.loader} />}
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}

      {!loading && !hasPlansThisWeek && !error && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>No menu published yet</AppText>
          <AppText style={styles.emptyText}>
            {weekRangeLabel} is not open for preorder yet. Sunday is the usual planning checkpoint, but menus appear here as soon as admin publishes them.
          </AppText>
        </View>
      )}

      {!loading && hasPlansThisWeek && !selectedPlan && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>{CATEGORY_LABELS[selectedCategory]} not published</AppText>
          <AppText style={styles.emptyText}>
            This goal does not have a menu for {weekRangeLabel} yet. Try another goal above or check back once admin finishes this batch.
          </AppText>
        </View>
      )}

      {!loading && selectedPlan && (
        <View style={styles.planPanel}>
          <View style={styles.planTopRow}>
            <View style={{ flex: 1, flexShrink: 1, paddingRight: 12 }}>
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
            style={({ pressed }) => [
              styles.viewMenuButton,
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => onOpenWeeklyPlan && onOpenWeeklyPlan()}
          >
            <AppText style={styles.viewMenuButtonText}>View Full Menu</AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!canPreorder}
            style={({ pressed }) => [
              styles.preorderButton,
              !canPreorder && styles.preorderButtonDisabled,
              pressed && canPreorder && { opacity: 0.8 },
            ]}
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

const getStyles = (colors) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  hero: {
    marginBottom: 18,
  },
  greeting: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 6,
  },
  description: {
    color: colors.textSecondary,
    fontSize: TYPOGRAPHY.sm,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekArrowDisabled: {
    opacity: 0.45,
  },
  weekRange: {
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.surfaceGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekKicker: {
    color: colors.accent,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  weekRangeText: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  navHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: colors.surfaceGreen,
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
    backgroundColor: colors.brand,
  },
  categoryTabText: {
    color: colors.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  categoryTabTextActive: {
    color: colors.surface,
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
    backgroundColor: colors.accent,
    marginLeft: 6,
  },
  subscribedDotActive: {
    backgroundColor: colors.surface,
  },
  loader: {
    marginVertical: 26,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: TYPOGRAPHY.sm,
  },
  planPanel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planCategory: {
    color: colors.accent,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.extrabold,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planTitle: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  planPrice: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  planDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  viewMenuButton: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand,
    marginBottom: 10,
  },
  viewMenuButtonText: {
    color: colors.brand,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  preorderButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  preorderButtonDisabled: {
    backgroundColor: colors.surfaceGreen,
  },
  preorderButtonText: {
    color: colors.surface,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  preorderButtonTextDisabled: {
    color: colors.muted,
  },
  preorderReason: {
    color: colors.textSecondary,
    fontSize: TYPOGRAPHY.xs,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
});
