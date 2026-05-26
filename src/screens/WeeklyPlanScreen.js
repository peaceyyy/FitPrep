import AppText from '../components/AppText';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { usePlans } from '../context/PlansContext';
import { useTheme } from '../context/useTheme';
import { DAY_ORDER, PLAN_CATEGORIES, normalizeDayLabel } from '../services/plansService';

const CATEGORY_LABELS = {
  Cutting: 'Cut',
  Bulking: 'Bulk',
  Maintenance: 'Maintain',
};

function formatMacros(meal) {
  return `${meal.calories || 0} kcal | P ${meal.protein_g || 0}g | C ${meal.carbs_g || 0}g | F ${meal.fats_g || 0}g`;
}

export default function WeeklyPlanScreen({ onBack, onPreorder, initialDay }) {
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
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const [selectedDay, setSelectedDay] = useState(initialDay || 'Mon');
  const [selectedMealDetails, setSelectedMealDetails] = useState(null);

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

          {mealsLoading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />}

          {!mealsLoading && dayMeals.length === 0 && (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyStateText}>
                No {selectedDay} meals are scheduled for this plan yet.
              </AppText>
            </View>
          )}

          {sortedDayMeals.map((meal) => {
            const description = meal.description || 'Details for this meal are being finalized.';

            return (
              <Pressable
                key={meal.id}
                accessibilityRole="button"
                accessibilityHint="Opens meal details"
                style={({ pressed }) => [styles.mealCard, pressed && styles.mealCardPressed]}
                onPress={() => setSelectedMealDetails(meal)}
              >
                <View style={styles.mealImagePlaceholder}>
                  <Ionicons name="image-outline" size={24} color={colors.accent} />
                </View>

                <View style={styles.mealContent}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealBadgeRow}>
                      <View style={styles.mealDayBadge}>
                        <AppText style={styles.mealDayText}>{selectedDay}</AppText>
                      </View>
                      <View style={[styles.mealDayBadge, styles.mealTypeBadge]}>
                        <AppText style={[styles.mealDayText, { color: colors.brand }]}>
                          {meal.meal_type || 'Lunch'}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.mealRightMeta}>
                      <AppText style={styles.mealCalories}>{meal.calories || 0} kcal</AppText>
                    </View>
                  </View>

                  <AppText style={styles.mealTitle} numberOfLines={2}>{meal.meal_name}</AppText>
                  <AppText style={styles.nutritionText} numberOfLines={1}>{formatMacros(meal)}</AppText>
                  <AppText
                    style={styles.mealDescription}
                    numberOfLines={2}
                  >
                    {description}
                  </AppText>
                  <View style={styles.nutritionTrack}>
                    <View style={[styles.nutritionFill, { width: `${Math.min(100, ((meal.protein_g || 0) / 60) * 100)}%` }]} />
                  </View>
                </View>
              </Pressable>
            );
          })}

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

      <Modal
        visible={!!selectedMealDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMealDetails(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedMealDetails(null)}
        >
          <Pressable
            style={styles.detailSheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color={colors.accent} />
              </View>
              <View style={styles.modalTitleBlock}>
                <AppText style={styles.modalMealType}>
                  {selectedMealDetails?.meal_type || 'Meal'}
                </AppText>
                <AppText style={styles.modalTitle}>
                  {selectedMealDetails?.meal_name || 'Meal details'}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.modalCloseButton, pressed && { opacity: 0.75 }]}
                onPress={() => setSelectedMealDetails(null)}
              >
                <Ionicons name="close" size={20} color={colors.brand} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <AppText style={styles.modalSectionTitle}>Description</AppText>
              <AppText style={styles.modalDescription}>
                {selectedMealDetails?.description || 'Details for this meal are being finalized.'}
              </AppText>

              <AppText style={styles.modalSectionTitle}>Macro Breakdown</AppText>
              <View style={styles.macroGrid}>
                {[
                  ['Calories', `${selectedMealDetails?.calories || 0} kcal`],
                  ['Protein', `${selectedMealDetails?.protein_g || 0}g`],
                  ['Carbs', `${selectedMealDetails?.carbs_g || 0}g`],
                  ['Fats', `${selectedMealDetails?.fats_g || 0}g`],
                ].map(([label, value]) => (
                  <View key={label} style={styles.macroTile}>
                    <AppText style={styles.macroTileLabel}>{label}</AppText>
                    <AppText style={styles.macroTileValue}>{value}</AppText>
                  </View>
                ))}
              </View>

              <AppText style={styles.modalSectionTitle}>Ingredients and Prep Notes</AppText>
              <View style={styles.notesPlaceholder}>
                <Ionicons name="restaurant-outline" size={18} color={colors.muted} />
                <AppText style={styles.notesPlaceholderText}>
                  No ingredient or preparation notes have been added yet.
                </AppText>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  weekHeader: {
    backgroundColor: colors.highlightSubtle,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.highlight,
    padding: 16,
    marginBottom: 14,
  },
  weekKicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weekTitle: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900',
  },
  subscriptionNotice: {
    backgroundColor: colors.surfaceGreen,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.highlight,
    padding: 14,
    marginBottom: 14,
  },
  subscriptionTitle: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  subscriptionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTabTextActive: {
    color: colors.surface,
  },
  planSummary: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  planCategory: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  planTitle: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  planDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  daysRow: {
    marginBottom: 18,
  },
  dayButton: {
    minWidth: 54,
    minHeight: 46,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  dayLabel: {
    color: colors.textSecondary,
    fontWeight: '900',
    fontSize: 12,
  },
  dayLabelActive: {
    color: colors.surface,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.brand,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 14,
    padding: 12,
    minHeight: 168,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealCardPressed: {
    opacity: 0.82,
  },
  mealImagePlaceholder: {
    width: 84,
    minHeight: 112,
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: colors.highlightSubtle,
    borderWidth: 1,
    borderColor: colors.highlight,
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
    backgroundColor: colors.highlightSubtle,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  mealTypeBadge: {
    backgroundColor: colors.highlight,
  },
  mealDayText: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '900',
  },
  mealCalories: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  mealRightMeta: {
    alignItems: 'flex-end',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.brand,
    lineHeight: 21,
    marginBottom: 6,
  },
  mealDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  nutritionText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '800',
    marginBottom: 7,
  },
  nutritionTrack: {
    height: 6,
    backgroundColor: colors.highlightSubtle,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  preorderButton: {
    backgroundColor: colors.brand,
    borderRadius: 20,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  preorderButtonDisabled: {
    backgroundColor: colors.surfaceGreen,
  },
  preorderLabel: {
    color: colors.surface,
    fontWeight: '900',
    fontSize: 16,
  },
  preorderLabelDisabled: {
    color: colors.muted,
  },
  preorderReason: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 16,
  },
  detailSheet: {
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlightSubtle,
    borderWidth: 1,
    borderColor: colors.highlight,
    marginRight: 12,
  },
  modalTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  modalMealType: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  modalTitle: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlightSubtle,
  },
  modalBody: {
    maxHeight: 430,
  },
  modalSectionTitle: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  macroTile: {
    width: '48%',
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: colors.highlightSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  macroTileLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  macroTileValue: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '900',
  },
  notesPlaceholder: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notesPlaceholderText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
