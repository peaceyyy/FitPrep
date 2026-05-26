import AppText from '../components/AppText';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { DAY_ORDER, PLAN_CATEGORIES, normalizeDayLabel } from '../services/plansService';

const CATEGORY_LABELS = {
  Cutting: 'Cut',
  Bulking: 'Bulk',
  Maintenance: 'Maintain',
};

function formatMacros(meal) {
  return `${meal.calories || 0} kcal | P ${meal.protein_g || 0}g | C ${meal.carbs_g || 0}g | F ${meal.fats_g || 0}g`;
}

export default function WeeklyPlanScreen({ onBack, onPreorder }) {
  const {
    browsingWeekStartDate,
    currentWeekStartDate,
    mealsLoading,
    preorderEligibility,
    selectedCategory,
    selectedPlan,
    selectedPlanMeals,
    setSelectedCategory,
    subscriptionForWeek,
    weekRangeLabel,
  } = usePlans();
  const [selectedDay, setSelectedDay] = useState('Mon');

  const dayMeals = useMemo(() => (
    selectedPlanMeals.filter((meal) => normalizeDayLabel(meal.day_of_week) === selectedDay)
  ), [selectedDay, selectedPlanMeals]);

  const sortedDayMeals = useMemo(() => {
    const mealTypeOrder = { 'Breakfast': 0, 'Lunch': 1, 'Dinner': 2 };
    return [...dayMeals].sort((a, b) => {
      const indexA = mealTypeOrder[a.meal_type] !== undefined ? mealTypeOrder[a.meal_type] : 9;
      const indexB = mealTypeOrder[b.meal_type] !== undefined ? mealTypeOrder[b.meal_type] : 9;
      return indexA - indexB;
    });
  }, [dayMeals]);

  const isCurrentWeek = browsingWeekStartDate === currentWeekStartDate;
  const canPreorder = preorderEligibility.canPreorder;
  const subscriptionPlanName = subscriptionForWeek?.published_weekly_plans?.name;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar
        title={selectedPlan ? selectedPlan.name : 'Weekly Plan'}
        onBack={onBack}
      />

      <View style={styles.weekHeader}>
        <AppText style={styles.weekKicker}>{isCurrentWeek ? 'This week' : 'Meal week'}</AppText>
        <AppText style={styles.weekTitle}>{weekRangeLabel}</AppText>
      </View>

      {subscriptionForWeek && (
        <View style={styles.subscriptionNotice}>
          <AppText style={styles.subscriptionTitle}>Preorder confirmed</AppText>
          <AppText style={styles.subscriptionText}>
            {subscriptionPlanName || 'Your plan'} is already locked for {weekRangeLabel}.
          </AppText>
        </View>
      )}

      <View style={styles.categoryTabs}>
        {PLAN_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              style={[styles.categoryTab, active && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <AppText style={[styles.categoryTabText, active && styles.categoryTabTextActive]}>
                {CATEGORY_LABELS[category]}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {!selectedPlan && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>{CATEGORY_LABELS[selectedCategory]} not published</AppText>
          <AppText style={styles.emptyStateText}>
            This goal does not have a menu for {weekRangeLabel} yet. Switch goals or check back once this batch is complete.
          </AppText>
        </View>
      )}

      {selectedPlan && (
        <>
          <View style={styles.planSummary}>
            <AppText style={styles.planCategory}>{selectedPlan.category}</AppText>
            <AppText style={styles.planTitle}>{selectedPlan.name}</AppText>
            <AppText style={styles.planDescription}>{selectedPlan.description || 'Meals are being finalized.'}</AppText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
            {DAY_ORDER.map((day) => (
              <Pressable
                key={day}
                accessibilityRole="button"
                style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
                onPress={() => setSelectedDay(day)}
              >
                <AppText style={[styles.dayLabel, selectedDay === day && styles.dayLabelActive]}>
                  {day.toUpperCase()}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>

          {mealsLoading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />}

          {!mealsLoading && dayMeals.length === 0 && (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyStateText}>
                No {selectedDay} meals are scheduled for this plan yet.
              </AppText>
            </View>
          )}

          {sortedDayMeals.map((meal) => (
            <View
              key={meal.id}
              style={styles.mealCard}
            >
              <View style={styles.mealImagePlaceholder}>
                <Ionicons name="image-outline" size={24} color={COLORS.accent} />
              </View>

              <View style={styles.mealContent}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealBadgeRow}>
                    <View style={styles.mealDayBadge}>
                      <AppText style={styles.mealDayText}>{selectedDay}</AppText>
                    </View>
                    <View style={[styles.mealDayBadge, styles.mealTypeBadge]}>
                      <AppText style={[styles.mealDayText, { color: COLORS.brand }]}>
                        {meal.meal_type || 'Lunch'}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.mealRightMeta}>
                    <AppText style={styles.mealCalories}>{meal.calories || 0} kcal</AppText>
                  </View>
                </View>

                <AppText style={styles.mealTitle}>{meal.meal_name}</AppText>
                <AppText style={styles.nutritionText}>{formatMacros(meal)}</AppText>
                <AppText style={styles.mealDescription}>
                  {meal.description || 'Details for this meal are being finalized.'}
                </AppText>
                <View style={styles.nutritionTrack}>
                  <View style={[styles.nutritionFill, { width: `${Math.min(100, ((meal.protein_g || 0) / 60) * 100)}%` }]} />
                </View>
              </View>
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            style={[styles.preorderButton, !canPreorder && styles.preorderButtonDisabled]}
            onPress={() => canPreorder && onPreorder(selectedPlan)}
            disabled={!canPreorder}
          >
            <AppText style={[styles.preorderLabel, !canPreorder && styles.preorderLabelDisabled]}>
              {canPreorder ? 'Preorder This Plan' : 'Preorder Locked'}
            </AppText>
          </Pressable>
          <AppText style={styles.preorderReason}>{preorderEligibility.reason}</AppText>
        </>
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
  weekHeader: {
    backgroundColor: '#edf7d7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9ebaf',
    padding: 16,
    marginBottom: 14,
  },
  weekKicker: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekTitle: {
    color: COLORS.brand,
    fontSize: 22,
    fontWeight: '900',
  },
  subscriptionNotice: {
    backgroundColor: '#f4fbeb',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#a9d56b',
    padding: 14,
    marginBottom: 14,
  },
  subscriptionTitle: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  subscriptionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
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
  planSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 18,
  },
  planCategory: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  planTitle: {
    color: COLORS.brand,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  planDescription: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  daysRow: {
    marginBottom: 18,
  },
  dayButton: {
    minWidth: 54,
    minHeight: 46,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontWeight: '900',
    fontSize: 12,
  },
  dayLabelActive: {
    color: COLORS.surface,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.brand,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealImagePlaceholder: {
    width: 74,
    minHeight: 98,
    borderRadius: 16,
    backgroundColor: '#edf7d7',
    borderWidth: 1,
    borderColor: '#d9ebaf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
    minWidth: 0,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  mealDayBadge: {
    backgroundColor: '#edf7d7',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  mealTypeBadge: {
    backgroundColor: COLORS.highlight,
  },
  mealDayText: {
    color: COLORS.brand,
    fontSize: 10,
    fontWeight: '900',
  },
  mealCalories: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  mealRightMeta: {
    alignItems: 'flex-end',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.brand,
    lineHeight: 21,
    marginBottom: 6,
  },
  mealDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  nutritionText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '800',
    marginBottom: 7,
  },
  nutritionTrack: {
    height: 6,
    backgroundColor: '#e8f2d6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  preorderButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  preorderButtonDisabled: {
    backgroundColor: '#e2e6d9',
  },
  preorderLabel: {
    color: COLORS.surface,
    fontWeight: '900',
    fontSize: 16,
  },
  preorderLabelDisabled: {
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
