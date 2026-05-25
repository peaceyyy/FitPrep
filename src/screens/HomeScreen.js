import AppText from '../components/AppText';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import {
  DAY_ORDER,
  getDaySortIndex,
  getTodayDayLabel,
  normalizeDayLabel,
  normalizeCategory,
} from '../services/plansService';

const DAY_FULL_LABELS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function groupMealsByDay(meals) {
  return DAY_ORDER.map((day) => ({
    day,
    meals: meals
      .filter((meal) => normalizeDayLabel(meal.day_of_week) === day)
      .sort((a, b) => getDaySortIndex(a.day_of_week) - getDaySortIndex(b.day_of_week)),
  }));
}

function sumMacros(meals) {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fats: acc.fats + (meal.fats_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}

export default function HomeScreen({ user, onOpenWeeklyPlan, onBack }) {
  const {
    browsingWeekStartDate,
    currentWeekStartDate,
    loading,
    mealsLoading,
    selectedPlanMeals,
    subscriptionForWeek,
    setSelectedCategory,
    showCurrentWeek,
  } = usePlans();

  const isCurrentWeek = browsingWeekStartDate === currentWeekStartDate;
  const todayLabel = getTodayDayLabel();
  const subscriptionPlan = subscriptionForWeek?.published_weekly_plans;

  useEffect(() => {
    showCurrentWeek();
    if (subscriptionPlan?.category) {
      setSelectedCategory(normalizeCategory(subscriptionPlan.category));
    }
  }, [showCurrentWeek, setSelectedCategory, subscriptionPlan?.category]);

  const mealsByDay = useMemo(() => groupMealsByDay(selectedPlanMeals), [selectedPlanMeals]);
  const todayMeals = useMemo(
    () => mealsByDay.find((group) => group.day === todayLabel)?.meals || [],
    [mealsByDay, todayLabel],
  );
  const todayMacros = useMemo(() => sumMacros(todayMeals), [todayMeals]);

  // Upcoming meals = remaining days after today
  const todayIndex = DAY_ORDER.indexOf(todayLabel);
  const upcomingGroups = useMemo(
    () => mealsByDay.filter((g) => DAY_ORDER.indexOf(g.day) > todayIndex && g.meals.length > 0),
    [mealsByDay, todayIndex],
  );

  const isSubscribed = !!subscriptionForWeek;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar
        title="Today"
        
        onBack={onBack}
      />

      {/* Greeting */}
      <View style={styles.hero}>
        <AppText style={styles.greeting}>Hi, {user?.name || 'there'} 👋</AppText>
        <AppText style={styles.dayLabel}>{DAY_FULL_LABELS[todayLabel] || todayLabel}</AppText>
        {isSubscribed && subscriptionPlan && (
          <View style={styles.planBadge}>
            <View style={styles.planBadgeDot} />
            <AppText style={styles.planBadgeText}>{subscriptionPlan.name}</AppText>
          </View>
        )}
      </View>

      {loading && <ActivityIndicator color={COLORS.accent} style={styles.loader} />}

      {/* Not subscribed state */}
      {!loading && !isSubscribed && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>Hold your gains. 💪</AppText>
          <AppText style={styles.emptyText}>
            You're not on a plan yet. Head to the Plans tab to preorder once the next menu is published.
          </AppText>
        </View>
      )}

      {/* Today's Meals */}
      {!loading && isSubscribed && (
        <>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Today's Meals</AppText>
            <AppText style={styles.sectionMeta}>{todayLabel}</AppText>
          </View>

          {mealsLoading && <ActivityIndicator color={COLORS.accent} style={styles.loaderSmall} />}

          {!mealsLoading && isCurrentWeek && todayMeals.length > 0 && (
            <View style={styles.todayList}>
              {todayMeals.map((meal) => (
                <View key={meal.id} style={styles.todayMealCard}>
                  <AppText style={styles.todayMealTitle}>{meal.meal_name}</AppText>
                  <AppText style={styles.todayMealMeta}>
                    {meal.calories || 0} kcal · P {meal.protein_g || 0}g · C {meal.carbs_g || 0}g · F {meal.fats_g || 0}g
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {!mealsLoading && isCurrentWeek && todayMeals.length === 0 && (
            <View style={styles.softNotice}>
              <AppText style={styles.softNoticeText}>No meals uploaded for today yet. Check back soon.</AppText>
            </View>
          )}

          {!mealsLoading && !isCurrentWeek && (
            <View style={styles.softNotice}>
              <AppText style={styles.softNoticeText}>Today's meals appear when you're viewing the current week.</AppText>
            </View>
          )}

          {/* Macro Summary Strip */}
          {!mealsLoading && todayMeals.length > 0 && (
            <View style={styles.macroStrip}>
              <View style={styles.macroItem}>
                <AppText style={styles.macroValue}>{todayMacros.calories}</AppText>
                <AppText style={styles.macroLabel}>kcal</AppText>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <AppText style={styles.macroValue}>{todayMacros.protein}g</AppText>
                <AppText style={styles.macroLabel}>Protein</AppText>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <AppText style={styles.macroValue}>{todayMacros.carbs}g</AppText>
                <AppText style={styles.macroLabel}>Carbs</AppText>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <AppText style={styles.macroValue}>{todayMacros.fats}g</AppText>
                <AppText style={styles.macroLabel}>Fats</AppText>
              </View>
            </View>
          )}

          {/* Upcoming Meals Preview */}
          {!mealsLoading && upcomingGroups.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Coming Up</AppText>
              </View>
              <View style={styles.weekPreview}>
                {upcomingGroups.map((group) => (
                  <View key={group.day} style={styles.dayRow}>
                    <View style={styles.dayBadge}>
                      <AppText style={styles.dayBadgeText}>{group.day}</AppText>
                    </View>
                    <View style={styles.dayMeals}>
                      {group.meals.slice(0, 2).map((meal) => (
                        <AppText key={meal.id} style={styles.dayMealText} numberOfLines={1}>
                          {meal.meal_name}
                        </AppText>
                      ))}
                      {group.meals.length > 2 && (
                        <AppText style={styles.moreMeals}>+{group.meals.length - 2} more</AppText>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Week Summary CTA */}
          <Pressable
            accessibilityRole="button"
            style={styles.weekSummaryButton}
            onPress={() => onOpenWeeklyPlan && onOpenWeeklyPlan()}
          >
            <AppText style={styles.weekSummaryButtonText}>View Full Week Menu →</AppText>
          </Pressable>
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
  hero: {
    marginBottom: 22,
  },
  greeting: {
    color: COLORS.brand,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0fadf',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#c5e88a',
  },
  planBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginRight: 7,
  },
  planBadgeText: {
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: '800',
  },
  loader: {
    marginVertical: 26,
  },
  loaderSmall: {
    marginVertical: 14,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.brand,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  todayList: {
    marginBottom: 16,
  },
  todayMealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  todayMealTitle: {
    color: COLORS.brand,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  todayMealMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  softNotice: {
    backgroundColor: '#eef3e4',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },
  softNoticeText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  macroStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  macroLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  macroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  weekPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    minHeight: 56,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0e6',
    paddingVertical: 8,
  },
  dayBadge: {
    width: 46,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf7d7',
    marginRight: 12,
  },
  dayBadgeText: {
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: '900',
  },
  dayMeals: {
    flex: 1,
  },
  dayMealText: {
    color: COLORS.brand,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  moreMeals: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  weekSummaryButton: {
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  weekSummaryButtonText: {
    color: COLORS.brand,
    fontSize: 15,
    fontWeight: '900',
  },
});
