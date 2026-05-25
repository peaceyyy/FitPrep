import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import {
  DAY_ORDER,
  PLAN_CATEGORIES,
  fetchMealsForPlan,
  formatWeekRange,
  getCurrentWeekStartDate,
  getNextWeekStartDate,
  getPreviousWeekStartDate,
  getTodayDayLabel,
  normalizeDayLabel,
} from '../services/plansService';
import { fetchAllOrders } from '../services/ordersService';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cutting', label: 'Cut' },
  { key: 'Bulking', label: 'Bulk' },
  { key: 'Maintenance', label: 'Maintain' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
];

const currentWeekStartDate = getCurrentWeekStartDate();
const maxFutureWeekStartDate = Array.from({ length: 4 }).reduce(
  (weekStartDate) => getNextWeekStartDate(weekStartDate),
  currentWeekStartDate,
);

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return '$--';
  return `$${value.toFixed(2)}/wk`;
}

function formatWeekStart(date) {
  if (!date) return 'Week not set';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getReadiness(meals = []) {
  const readyDays = new Set(meals.map((meal) => normalizeDayLabel(meal.day_of_week)));
  const readyCount = DAY_ORDER.filter((day) => readyDays.has(day)).length;
  return {
    readyCount,
    isReady: readyCount === DAY_ORDER.length,
    label: `${readyCount}/${DAY_ORDER.length} days ready`,
  };
}

function orderWeekStart(order) {
  return order?.published_weekly_plans?.week_start_date || '';
}

export default function AdminMealsScreen({ onCreateMeal, onCreatePlan, onEditPlan, onBack }) {
  const { plans, loading, error, source, removePlan } = usePlans();
  const [adminWeekStartDate, setAdminWeekStartDate] = useState(currentWeekStartDate);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mealSnapshots, setMealSnapshots] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const weekPlans = useMemo(() => (
    plans
      .filter((plan) => plan.week_start_date === adminWeekStartDate)
      .sort((a, b) => PLAN_CATEGORIES.indexOf(a.category) - PLAN_CATEGORIES.indexOf(b.category))
  ), [adminWeekStartDate, plans]);

  const filteredPlans = useMemo(() => (
    weekPlans.filter((plan) => {
      const matchesCategory = selectedCategory === 'all' || plan.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all'
        || (selectedStatus === 'published' && plan.is_published)
        || (selectedStatus === 'draft' && !plan.is_published);
      return matchesCategory && matchesStatus;
    })
  ), [selectedCategory, selectedStatus, weekPlans]);

  const weekOrders = useMemo(() => (
    orders.filter((order) => orderWeekStart(order) === adminWeekStartDate)
  ), [adminWeekStartDate, orders]);

  const weekReadiness = useMemo(() => {
    if (weekPlans.length === 0) {
      return { readyPlans: 0, totalPlans: 0 };
    }

    return weekPlans.reduce((summary, plan) => {
      const readiness = getReadiness(mealSnapshots[plan.id]);
      return {
        readyPlans: summary.readyPlans + (readiness.isReady ? 1 : 0),
        totalPlans: summary.totalPlans + 1,
      };
    }, { readyPlans: 0, totalPlans: 0 });
  }, [mealSnapshots, weekPlans]);

  const todayLabel = getTodayDayLabel();
  const todayMeals = useMemo(() => (
    weekPlans.flatMap((plan) => (
      (mealSnapshots[plan.id] || [])
        .filter((meal) => normalizeDayLabel(meal.day_of_week) === todayLabel)
        .map((meal) => ({ ...meal, planName: plan.name, category: plan.category }))
    ))
  ), [mealSnapshots, todayLabel, weekPlans]);

  const canShowNextWeek = adminWeekStartDate < maxFutureWeekStartDate;
  const isCurrentWeek = adminWeekStartDate === currentWeekStartDate;

  useEffect(() => {
    let cancelled = false;

    async function loadMealSnapshots() {
      const entries = await Promise.all(
        weekPlans.map(async (plan) => {
          const { data } = await fetchMealsForPlan(plan.id);
          return [plan.id, data || []];
        }),
      );

      if (!cancelled) {
        setMealSnapshots(Object.fromEntries(entries));
      }
    }

    if (weekPlans.length > 0) {
      loadMealSnapshots();
    } else {
      setMealSnapshots({});
    }

    return () => {
      cancelled = true;
    };
  }, [weekPlans]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setOrdersLoading(true);
      const { data } = await fetchAllOrders();
      if (!cancelled) {
        setOrders(data || []);
        setOrdersLoading(false);
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const showPreviousWeek = () => {
    setAdminWeekStartDate((weekStartDate) => getPreviousWeekStartDate(weekStartDate));
  };

  const showNextWeek = () => {
    if (!canShowNextWeek) return;
    setAdminWeekStartDate((weekStartDate) => getNextWeekStartDate(weekStartDate));
  };

  const handleCreatePlan = (category = 'Cutting') => {
    onCreatePlan({
      week_start_date: adminWeekStartDate,
      category,
    });
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      'Delete plan?',
      `This will delete "${plan.name}" and its meals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await removePlan(plan.id);
            if (deleteError) {
              Alert.alert('Delete Failed', deleteError.message);
            }
          },
        },
      ],
    );
  };

  const renderPlanCard = ({ item: plan }) => {
    const readiness = getReadiness(mealSnapshots[plan.id]);

    return (
      <View style={styles.planCard}>
        <View style={styles.planTop}>
          <View style={styles.categoryMark}>
            <AppText style={styles.categoryMarkText}>{plan.category?.slice(0, 1) || 'P'}</AppText>
          </View>
          <View style={styles.planTitleGroup}>
            <AppText style={styles.planTitle}>{plan.name}</AppText>
            <AppText style={styles.planCategory}>{plan.category}</AppText>
          </View>
          <View style={[styles.statusChip, !plan.is_published && styles.statusChipMuted]}>
            <AppText style={styles.statusText}>{plan.is_published ? 'Published' : 'Draft'}</AppText>
          </View>
        </View>

        <AppText style={styles.planSubtitle}>{plan.description || 'No description yet.'}</AppText>

        <View style={styles.metaRow}>
          <AppText style={styles.planWeek}>Week of {formatWeekStart(plan.week_start_date)}</AppText>
          <AppText style={[styles.readinessText, readiness.isReady ? styles.readinessReady : styles.readinessMissing]}>
            {readiness.label}
          </AppText>
        </View>

        <View style={styles.footerRow}>
          <AppText style={styles.planPrice}>{formatPrice(plan.weekly_price)}</AppText>
          <View style={styles.controlsRow}>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => onCreateMeal(plan)}>
              <AppText style={styles.actionText}>Meals</AppText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => onEditPlan(plan)}>
              <AppText style={styles.actionText}>Edit</AppText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]} onPress={() => handleDeletePlan(plan)}>
              <AppText style={styles.deleteActionText}>Delete</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <>
      <HeaderBar title="Manage Meals" action={{ icon: 'bell', onPress: () => {} }} onBack={onBack} />

      <AppText style={styles.subHeading}>ADMINISTRATION</AppText>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <AppText style={styles.title}>Weekly Plans</AppText>
          <AppText style={styles.titleMeta}>{source === 'supabase' ? 'Live Supabase data' : 'Mock fallback data'}</AppText>
        </View>
        <Pressable style={({ pressed }) => [styles.createButton, pressed && styles.pressed]} onPress={() => handleCreatePlan()}>
          <AppText style={styles.createButtonText}>Create</AppText>
        </Pressable>
      </View>

      <View style={styles.weekNavigator}>
        <Pressable accessibilityRole="button" style={styles.weekArrow} onPress={showPreviousWeek}>
          <AppText style={styles.weekArrowText}>{'<'}</AppText>
        </Pressable>
        <View style={styles.weekRange}>
          <AppText style={styles.weekKicker}>{isCurrentWeek ? 'Current admin week' : 'Planning week'}</AppText>
          <AppText style={styles.weekRangeText}>{formatWeekRange(adminWeekStartDate)}</AppText>
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
      {!canShowNextWeek && (
        <AppText style={styles.navHint}>Future planning is capped at the next 4 weeks for this admin view.</AppText>
      )}

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <AppText style={styles.summaryValue}>{weekPlans.length}</AppText>
          <AppText style={styles.summaryLabel}>Plans</AppText>
        </View>
        <View style={styles.summaryCard}>
          <AppText style={styles.summaryValue}>{weekReadiness.readyPlans}/{weekReadiness.totalPlans}</AppText>
          <AppText style={styles.summaryLabel}>Ready</AppText>
        </View>
        <View style={styles.summaryCard}>
          <AppText style={styles.summaryValue}>{ordersLoading ? '...' : weekOrders.length}</AppText>
          <AppText style={styles.summaryLabel}>Orders</AppText>
        </View>
      </View>

      <View style={styles.todayPanel}>
        <View style={styles.todayHeader}>
          <View>
            <AppText style={styles.todayTitle}>Today</AppText>
            <AppText style={styles.todayMeta}>{todayLabel} meals for the selected week</AppText>
          </View>
          <View style={styles.phaseChip}>
            <AppText style={styles.phaseChipText}>Delivery in Phase 4</AppText>
          </View>
        </View>
        {todayMeals.length === 0 ? (
          <AppText style={styles.todayEmpty}>No meals uploaded for {todayLabel} yet.</AppText>
        ) : (
          todayMeals.slice(0, 4).map((meal) => (
            <View key={`${meal.planName}-${meal.id}`} style={styles.todayMealRow}>
              <View style={styles.todayMealCopy}>
                <AppText style={styles.todayMealTitle}>{meal.meal_name}</AppText>
                <AppText style={styles.todayMealMeta}>{meal.category} | {meal.planName}</AppText>
              </View>
              <AppText style={styles.todayMealCalories}>{meal.calories || 0} kcal</AppText>
            </View>
          ))
        )}
      </View>

      <AppText style={styles.filterLabel}>Category</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller}>
        {CATEGORY_FILTERS.map((category) => (
          <Pressable
            key={category.key}
            style={({ pressed }) => [styles.filterChip, selectedCategory === category.key && styles.filterChipActive, pressed && styles.pressed]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <AppText style={[styles.filterChipText, selectedCategory === category.key && styles.filterChipTextActive]}>{category.label}</AppText>
          </Pressable>
        ))}
      </ScrollView>

      <AppText style={styles.filterLabel}>Status</AppText>
      <View style={styles.statusFilters}>
        {STATUS_FILTERS.map((status) => (
          <Pressable
            key={status.key}
            style={({ pressed }) => [styles.statusFilterChip, selectedStatus === status.key && styles.statusFilterActive, pressed && styles.pressed]}
            onPress={() => setSelectedStatus(status.key)}
          >
            <AppText style={[styles.statusFilterText, selectedStatus === status.key && styles.statusFilterTextActive]}>{status.label}</AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionTitleRow}>
        <AppText style={styles.sectionTitle}>Plans This Week</AppText>
        <AppText style={styles.sectionMeta}>{filteredPlans.length} shown</AppText>
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={filteredPlans}
      keyExtractor={(item) => item.id}
      renderItem={renderPlanCard}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={(
        <View style={styles.emptyState}>
          {!!error ? (
            <>
              <AppText style={styles.emptyTitle}>Could not load plans</AppText>
              <AppText style={styles.emptyText}>{error}</AppText>
            </>
          ) : weekPlans.length === 0 ? (
            <>
              <AppText style={styles.emptyTitle}>No plans for this week yet.</AppText>
              <AppText style={styles.emptyText}>Start the week quickly by choosing a plan category.</AppText>
              <View style={styles.quickActions}>
                {PLAN_CATEGORIES.map((category) => (
                  <Pressable key={category} style={styles.quickAction} onPress={() => handleCreatePlan(category)}>
                    <AppText style={styles.quickActionText}>Create {category}</AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <AppText style={styles.emptyTitle}>No plans match these filters.</AppText>
              <AppText style={styles.emptyText}>Try another category or status filter.</AppText>
            </>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 140 },
  subHeading: { color: COLORS.accent, fontSize: 12, letterSpacing: 1.2, marginBottom: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titleCopy: { flex: 1, paddingRight: 12 },
  title: { color: COLORS.brand, fontSize: 28, fontWeight: '900', marginBottom: 6 },
  titleMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  createButton: { minHeight: 48, borderRadius: 18, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.brand },
  createButtonText: { color: COLORS.surface, fontWeight: '900' },
  weekNavigator: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  weekArrow: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  weekArrowDisabled: { opacity: 0.45 },
  weekArrowText: { color: COLORS.brand, fontSize: 24, fontWeight: '900' },
  weekArrowTextDisabled: { color: COLORS.muted },
  weekRange: { flex: 1, minHeight: 56, justifyContent: 'center', marginHorizontal: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#edf7d7', borderWidth: 1, borderColor: '#d9ebaf' },
  weekKicker: { color: COLORS.accent, fontSize: 11, fontWeight: '900', marginBottom: 2, textTransform: 'uppercase' },
  weekRangeText: { color: COLORS.brand, fontSize: 18, fontWeight: '900' },
  navHint: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginBottom: 14 },
  summaryGrid: { flexDirection: 'row', marginBottom: 14 },
  summaryCard: { flex: 1, minHeight: 76, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginRight: 10 },
  summaryValue: { color: COLORS.brand, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '800' },
  todayPanel: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  todayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  todayTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  todayMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  phaseChip: { backgroundColor: '#eef3e4', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 },
  phaseChipText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800' },
  todayEmpty: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  todayMealRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f4f7ef', borderRadius: 16, padding: 12, marginBottom: 8 },
  todayMealCopy: { flex: 1, paddingRight: 10 },
  todayMealTitle: { color: COLORS.brand, fontSize: 14, fontWeight: '900', marginBottom: 4 },
  todayMealMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  todayMealCalories: { color: COLORS.accent, fontSize: 12, fontWeight: '900' },
  filterLabel: { color: COLORS.brand, fontWeight: '900', marginBottom: 8, marginTop: 6 },
  filterScroller: { marginBottom: 12 },
  filterChip: { minHeight: 44, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  filterChipText: { color: COLORS.brand, fontWeight: '800' },
  filterChipTextActive: { color: COLORS.surface },
  statusFilters: { flexDirection: 'row', marginBottom: 18 },
  statusFilterChip: { flex: 1, minHeight: 44, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  statusFilterActive: { backgroundColor: '#edf7d7', borderColor: '#d9ebaf' },
  statusFilterText: { color: COLORS.textSecondary, fontWeight: '800', fontSize: 12 },
  statusFilterTextActive: { color: COLORS.brand },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: COLORS.muted, fontSize: 12, fontWeight: '800' },
  planCard: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 14 },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  categoryMark: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#e8ecdf', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  categoryMarkText: { color: COLORS.brand, fontSize: 24, fontWeight: '900' },
  planTitleGroup: { flex: 1, paddingRight: 8 },
  planTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  planCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '900' },
  statusChip: { backgroundColor: '#dff4da', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 },
  statusChipMuted: { backgroundColor: '#f0f1ea' },
  statusText: { color: COLORS.brand, fontSize: 11, fontWeight: '800' },
  planSubtitle: { color: COLORS.textSecondary, lineHeight: 19, marginBottom: 12 },
  metaRow: { marginBottom: 14 },
  planWeek: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 5 },
  readinessText: { fontSize: 12, fontWeight: '900' },
  readinessReady: { color: COLORS.success },
  readinessMissing: { color: COLORS.danger },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planPrice: { color: COLORS.accent, fontSize: 17, fontWeight: '900' },
  controlsRow: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', flex: 1 },
  actionButton: { minHeight: 40, backgroundColor: '#edf7d7', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: COLORS.brand, fontWeight: '900', fontSize: 12 },
  deleteButton: { minHeight: 40, backgroundColor: COLORS.dangerSubtle, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  deleteActionText: { color: COLORS.danger, fontWeight: '900', fontSize: 12 },
  emptyState: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  quickActions: { width: '100%' },
  quickAction: { minHeight: 46, borderRadius: 16, backgroundColor: '#edf7d7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionText: { color: COLORS.brand, fontWeight: '900' },
  pressed: { opacity: 0.75 },
});
