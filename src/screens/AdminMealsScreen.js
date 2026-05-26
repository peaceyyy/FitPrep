import AppText from "../components/AppText";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import HeaderBar from "../components/HeaderBar";
import { useTheme } from "../context/useTheme";
import { usePlans } from "../context/PlansContext";
import {
  DAY_ORDER,
  PLAN_CATEGORIES,
  fetchMealsForPlan,
  formatWeekRange,
  getCurrentWeekStartDate,
  getNextWeekStartDate,
  getPreviousWeekStartDate,
  normalizeDayLabel,
} from "../services/plansService";

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "Cutting", label: "Cut" },
  { key: "Bulking", label: "Bulk" },
  { key: "Maintenance", label: "Maintain" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
];

const currentWeekStartDate = getCurrentWeekStartDate();
const maxFutureWeekStartDate = Array.from({ length: 4 }).reduce(
  (weekStartDate) => getNextWeekStartDate(weekStartDate),
  currentWeekStartDate,
);

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return "₱--";
  return `₱${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatWeekStart(date) {
  if (!date) return "Week not set";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getReadiness(meals = []) {
  const readyDays = new Set(
    meals.map((meal) => normalizeDayLabel(meal.day_of_week)),
  );
  const readyCount = DAY_ORDER.filter((day) => readyDays.has(day)).length;
  const missingDays = DAY_ORDER.filter((day) => !readyDays.has(day));
  return {
    readyCount,
    missingDays,
    isReady: readyCount === DAY_ORDER.length,
    label: `${readyCount}/${DAY_ORDER.length} days ready`,
  };
}

function getEffectivePublished(plan, meals) {
  if (!Array.isArray(meals)) return Boolean(plan.is_published);
  return Boolean(plan.is_published) && getReadiness(meals).isReady;
}

export default function AdminMealsScreen({
  onCreateMeal,
  onCreatePlan,
  onEditPlan,
  onBack,
}) {
  const { plans, loading, error, source, removePlan } = usePlans();
  const { colors, isDark, setTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [adminWeekStartDate, setAdminWeekStartDate] =
    useState(currentWeekStartDate);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [mealSnapshots, setMealSnapshots] = useState({});

  const weekPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.week_start_date === adminWeekStartDate)
        .sort(
          (a, b) =>
            PLAN_CATEGORIES.indexOf(a.category) -
            PLAN_CATEGORIES.indexOf(b.category),
        ),
    [adminWeekStartDate, plans],
  );

  const filteredPlans = useMemo(
    () =>
      weekPlans.filter((plan) => {
        const matchesCategory =
          selectedCategory === "all" || plan.category === selectedCategory;
        const effectivePublished = getEffectivePublished(plan, mealSnapshots[plan.id]);
        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "published" && effectivePublished) ||
          (selectedStatus === "draft" && !effectivePublished);
        return matchesCategory && matchesStatus;
      }),
    [mealSnapshots, selectedCategory, selectedStatus, weekPlans],
  );

  const weekReadiness = useMemo(() => {
    if (weekPlans.length === 0) {
      return { readyPlans: 0, totalPlans: 0 };
    }

    return weekPlans.reduce(
      (summary, plan) => {
        const readiness = getReadiness(mealSnapshots[plan.id]);
        return {
          readyPlans: summary.readyPlans + (readiness.isReady ? 1 : 0),
          totalPlans: summary.totalPlans + 1,
        };
      },
      { readyPlans: 0, totalPlans: 0 },
    );
  }, [mealSnapshots, weekPlans]);

  const canShowNextWeek = adminWeekStartDate < maxFutureWeekStartDate;
  const isCurrentWeek = adminWeekStartDate === currentWeekStartDate;
  const selectedCategoryLabel =
    CATEGORY_FILTERS.find((category) => category.key === selectedCategory)
      ?.label || "All";
  const selectedStatusLabel =
    STATUS_FILTERS.find((status) => status.key === selectedStatus)?.label ||
    "All";
  const activeFilterCount = [
    selectedCategory !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

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

  const showPreviousWeek = () => {
    setAdminWeekStartDate((weekStartDate) =>
      getPreviousWeekStartDate(weekStartDate),
    );
  };

  const showNextWeek = () => {
    if (!canShowNextWeek) return;
    setAdminWeekStartDate((weekStartDate) =>
      getNextWeekStartDate(weekStartDate),
    );
  };

  const handleCreatePlan = (category = "Cutting") => {
    onCreatePlan({
      week_start_date: adminWeekStartDate,
      category,
    });
  };

  const handleDeletePlan = (plan) => {
    Alert.alert(
      "Delete plan?",
      `This will delete "${plan.name}" and its meals.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await removePlan(plan.id);
            if (deleteError) {
              Alert.alert("Delete Failed", deleteError.message);
            }
          },
        },
      ],
    );
  };

  const renderPlanCard = ({ item: plan }) => {
    const planMeals = mealSnapshots[plan.id];
    const mealsChecked = Array.isArray(planMeals);
    const readiness = mealsChecked
      ? getReadiness(planMeals)
      : { readyCount: 0, missingDays: [], isReady: false, label: "Checking meals..." };
    const effectivePublished = getEffectivePublished(plan, planMeals);

    return (
      <View style={styles.planCard}>
        <View style={styles.planTop}>
          <View style={styles.categoryMark}>
            <AppText style={styles.categoryMarkText}>
              {plan.category?.slice(0, 1) || "P"}
            </AppText>
          </View>
          <View style={styles.planTitleGroup}>
            <AppText style={styles.planTitle}>{plan.name}</AppText>
            <AppText style={styles.planCategory}>
              {plan.category} | Week of {formatWeekStart(plan.week_start_date)}
            </AppText>
          </View>
          <View
            style={[
              styles.statusChip,
              !effectivePublished && styles.statusChipMuted,
            ]}
          >
            <AppText style={styles.statusText}>
              {effectivePublished ? "Published" : "Draft"}
            </AppText>
          </View>
        </View>

        <AppText style={styles.planSubtitle}>
          {plan.description || "No description yet."}
        </AppText>

        <View style={styles.metaRow}>
          <AppText
            style={[
              styles.readinessText,
              readiness.isReady
                ? styles.readinessReady
                : styles.readinessMissing,
            ]}
          >
            {readiness.label}
          </AppText>
          {mealsChecked && !readiness.isReady && (
            <View style={styles.missingDaysRow}>
              {readiness.missingDays.map((day) => (
                <View key={day} style={styles.missingDayChip}>
                  <View style={styles.missingDayDot} />
                  <AppText style={styles.missingDayText}>{day}</AppText>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Fill missing meals for ${plan.name}`}
                style={({ pressed }) => [styles.fillMissingPill, pressed && styles.pressed]}
                onPress={() => onCreateMeal(plan, readiness.missingDays[0])}
              >
                <Feather name="plus-circle" size={13} color={colors.danger} />
                <AppText style={styles.fillMissingText}>Add meals</AppText>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          <AppText style={styles.planPrice}>
            {formatPrice(plan.weekly_price)}
          </AppText>
          <View style={styles.controlsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Manage meals for ${plan.name}`}
              style={({ pressed }) => [
                styles.iconActionButton,
                pressed && styles.pressed,
              ]}
              onPress={() => onCreateMeal(plan)}
            >
              <Feather name="list" size={18} color={colors.brand} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${plan.name}`}
              style={({ pressed }) => [
                styles.iconActionButton,
                pressed && styles.pressed,
              ]}
              onPress={() => onEditPlan(plan)}
            >
              <Feather name="edit-2" size={17} color={colors.brand} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${plan.name}`}
              style={({ pressed }) => [
                styles.iconDeleteButton,
                pressed && styles.pressed,
              ]}
              onPress={() => handleDeletePlan(plan)}
            >
              <Feather name="trash-2" size={17} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <>
      <HeaderBar 
        title="Manage Plans" 
        onBack={onBack} 
        leftAction={{
          icon: isDark ? "moon" : "sun",
          onPress: () => setTheme(isDark ? "light" : "dark"),
          label: "Toggle Theme",
        }}
      />
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <AppText style={styles.title}>Weekly Plans</AppText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
          ]}
          onPress={() => handleCreatePlan()}
        >
          <Feather name="plus" size={16} color={colors.surface} />
          <AppText style={styles.createButtonText}>Plan</AppText>
        </Pressable>
      </View>

      <View style={styles.weekNavigator}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show previous week"
          style={styles.weekArrow}
          onPress={showPreviousWeek}
        >
          <Feather name="chevron-left" size={22} color={colors.brand} />
        </Pressable>
        <View style={styles.weekRange}>
          <AppText style={styles.weekRangeText}>
            {formatWeekRange(adminWeekStartDate)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show next week"
          disabled={!canShowNextWeek}
          style={[
            styles.weekArrow,
            !canShowNextWeek && styles.weekArrowDisabled,
          ]}
          onPress={showNextWeek}
        >
          <Feather name="chevron-right" size={22} color={canShowNextWeek ? colors.brand : colors.muted} />
        </Pressable>
      </View>

      <View style={styles.sectionTitleRow}>
        <View>
          <AppText style={styles.sectionTitle}>Plans This Week</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open plan filters"
          style={({ pressed }) => [
            styles.smallFilterButton,
            pressed && styles.pressed,
          ]}
          onPress={() => setFilterSheetVisible(true)}
        >
          <Feather name="filter" size={16} color={colors.brand} />
          {activeFilterCount > 0 && <View style={styles.smallFilterBadge} />}
        </Pressable>
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        style={styles.root}
        contentContainerStyle={styles.content}
        data={filteredPlans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {!!error ? (
              <>
                <AppText style={styles.emptyTitle}>
                  Could not load plans
                </AppText>
                <AppText style={styles.emptyText}>{error}</AppText>
              </>
            ) : weekPlans.length === 0 ? (
              <>
                <AppText style={styles.emptyTitle}>
                  No plans for this week yet.
                </AppText>
                <AppText style={styles.emptyText}>
                  Start the week quickly by choosing a plan category.
                </AppText>
                <View style={styles.quickActions}>
                  {PLAN_CATEGORIES.map((category) => (
                    <Pressable
                      key={category}
                      style={styles.quickAction}
                      onPress={() => handleCreatePlan(category)}
                    >
                      <AppText style={styles.quickActionText}>
                        Create {category}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <AppText style={styles.emptyTitle}>
                  No plans match these filters.
                </AppText>
                <AppText style={styles.emptyText}>
                  Try another category or status filter.
                </AppText>
              </>
            )}
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent
        visible={filterSheetVisible}
        onRequestClose={() => setFilterSheetVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFilterSheetVisible(false)}
        >
          <Pressable style={styles.filterSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <AppText style={styles.sheetTitle}>Plan Filters</AppText>
                <AppText style={styles.sheetMeta}>
                  {formatWeekRange(adminWeekStartDate)}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close plan filters"
                style={({ pressed }) => [
                  styles.sheetCloseButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setFilterSheetVisible(false)}
              >
                <Feather name="x" size={20} color={colors.brand} />
              </Pressable>
            </View>

            <AppText style={styles.sheetSectionLabel}>Category</AppText>
            <View style={styles.sheetOptions}>
              {CATEGORY_FILTERS.map((category) => {
                const isActive = selectedCategory === category.key;
                return (
                  <Pressable
                    key={category.key}
                    style={({ pressed }) => [
                      styles.sheetOption,
                      isActive && styles.sheetOptionActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setSelectedCategory(category.key)}
                  >
                    <AppText
                      style={[
                        styles.sheetOptionText,
                        isActive && styles.sheetOptionTextActive,
                      ]}
                    >
                      {category.label}
                    </AppText>
                    {isActive && (
                      <Feather name="check" size={18} color={colors.brand} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <AppText style={styles.sheetSectionLabel}>Status</AppText>
            <View style={styles.sheetOptions}>
              {STATUS_FILTERS.map((status) => {
                const isActive = selectedStatus === status.key;
                return (
                  <Pressable
                    key={status.key}
                    style={({ pressed }) => [
                      styles.sheetOption,
                      isActive && styles.sheetOptionActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setSelectedStatus(status.key)}
                  >
                    <AppText
                      style={[
                        styles.sheetOptionText,
                        isActive && styles.sheetOptionTextActive,
                      ]}
                    >
                      {status.label}
                    </AppText>
                    {isActive && (
                      <Feather name="check" size={18} color={colors.brand} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetSecondaryAction,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
              >
                <AppText style={styles.sheetSecondaryText}>Reset</AppText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetPrimaryAction,
                  pressed && styles.pressed,
                ]}
                onPress={() => setFilterSheetVisible(false)}
              >
                <AppText style={styles.sheetPrimaryText}>Done</AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 140 },
  subHeading: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleCopy: { flex: 1, paddingRight: 12 },
  title: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  titleMeta: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  createButton: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: colors.brand,
  },
  createButtonText: {
    color: colors.surface,
    fontWeight: "900",
    fontSize: 12,
    textAlign: "center",
    marginLeft: 5,
  },
  weekNavigator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  weekArrow: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekArrowDisabled: { opacity: 0.45 },
  weekRange: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekRangeText: { color: colors.brand, fontSize: 17, fontWeight: "900", textAlign: "center" },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { color: colors.brand, fontSize: 18, fontWeight: "900" },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  smallFilterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallFilterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  planTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  categoryMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryMarkText: { color: colors.brand, fontSize: 24, fontWeight: "900" },
  planTitleGroup: { flex: 1, paddingRight: 8 },
  planTitle: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  planCategory: { color: colors.accent, fontSize: 12, fontWeight: "900" },
  statusChip: {
    backgroundColor: colors.highlightSubtle,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  statusChipMuted: { backgroundColor: colors.border },
  statusText: { color: colors.brand, fontSize: 11, fontWeight: "800" },
  planSubtitle: {
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: { marginBottom: 14 },
  readinessText: { fontSize: 12, fontWeight: "900" },
  readinessReady: { color: colors.success },
  readinessMissing: { color: colors.danger },
  missingDaysRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 9 },
  missingDayChip: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.dangerSubtle,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  missingDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
    marginRight: 5,
  },
  missingDayText: { color: colors.danger, fontSize: 11, fontWeight: "900" },
  fillMissingPill: {
    minHeight: 26,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSubtle,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
  },
  fillMissingText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planPrice: { color: colors.accent, fontSize: 17, fontWeight: "900" },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    flex: 1,
  },
  iconActionButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surfaceGreen,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDeleteButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.dangerSubtle,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  quickActions: { width: "100%" },
  quickAction: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: colors.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: { color: colors.brand, fontWeight: "900" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  filterSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sheetTitle: {
    color: colors.brand,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  sheetMeta: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  sheetCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetSectionLabel: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 6,
  },
  sheetOptions: { marginBottom: 10 },
  sheetOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  sheetOptionActive: { backgroundColor: colors.surfaceGreen, borderColor: colors.border },
  sheetOptionText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  sheetOptionTextActive: { color: colors.brand },
  sheetActions: { flexDirection: "row", marginTop: 8 },
  sheetSecondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  sheetSecondaryText: { color: colors.brand, fontWeight: "900" },
  sheetPrimaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  sheetPrimaryText: { color: colors.surface, fontWeight: "900" },
  pressed: { opacity: 0.7 },
});
