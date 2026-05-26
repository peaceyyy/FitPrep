import AppText from "../components/AppText";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../components/HeaderBar";
import { useTheme } from "../context/useTheme";
import { usePlans } from "../context/PlansContext";
import { TYPOGRAPHY } from "../theme";
import {
  DAY_ORDER,
  formatWeekRange,
  getDaySortIndex,
  getNextWeekStartDate,
  getTodayDayLabel,
  normalizeDayLabel,
  normalizeCategory,
} from "../services/plansService";

const DAY_FULL_LABELS = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const GREETING_MAP = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETING_MAP.morning;
  if (hour < 18) return GREETING_MAP.afternoon;
  return GREETING_MAP.evening;
}

function groupMealsByDay(meals) {
  return DAY_ORDER.map((day) => ({
    day,
    meals: meals
      .filter((meal) => normalizeDayLabel(meal.day_of_week) === day)
      .sort(
        (a, b) =>
          getDaySortIndex(a.day_of_week) - getDaySortIndex(b.day_of_week),
      ),
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

function getOrderPlan(order) {
  if (!order) return {};
  return order.plan_snapshot || order.published_weekly_plans || {};
}

function getOrderWeekStart(order) {
  if (!order) return "";
  return getOrderPlan(order).week_start_date || "";
}

// ─── Macro Ring Component ────────────────────────────────────────────────────
// Uses react-native-svg for a real animated progress arc (strokeDashoffset technique)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function MacroRing({ value, max, label, unit, color }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors, false), [colors]);
  const animProgress = useRef(new Animated.Value(0)).current;

  const SIZE = 82;
  const STROKE = 7;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(value / safeMax, 1);

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: ratio,
      duration: 900,
      useNativeDriver: false, // SVG props require JS driver
    }).start();
  }, [ratio]);

  // Maps 0→1 progress to full circumference → 0 offset (full arc)
  const strokeDashoffset = animProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.macroRingWrapper}>
      {/* SVG ring — track + animated progress arc */}
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.border}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc — rotated -90° so it starts from 12 o'clock */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        {/* Center content absolutely positioned over the SVG */}
        <View style={styles.macroRingCenter}>
          <AppText style={[styles.macroRingValue, { color: colors.brand }]}>
            {value}
          </AppText>
          <AppText style={styles.macroRingUnit}>{unit}</AppText>
        </View>
      </View>
      <AppText style={styles.macroRingLabel}>{label}</AppText>
    </View>
  );
}

// ─── Streak Badge ────────────────────────────────────────────────────────────
// TODO: Wire `streak` to real user session data before re-enabling this badge.
// Currently hidden because the hardcoded value (5) would mislead users.
function StreakBadge({ streak = 0 }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse 3 times then settle — prevents permanent visual noise
    let count = 0;
    const step = Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
    ]);
    const loop = Animated.loop(step, { iterations: 3 });
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.streakBadge, { transform: [{ scale: pulse }] }]}
      accessibilityLabel={`${streak}-day streak`}
    >
      <Ionicons name="flame" size={15} color="#f5c842" style={{ marginRight: 5 }} />
      <AppText style={styles.streakText}>{streak}-day streak</AppText>
    </Animated.View>
  );
}

// ─── Empty / Unsubscribed State ──────────────────────────────────────────────
function UnsubscribedHero({
  onNavigateToPlans,
  onNavigateToOrders,
  upcomingPreorder,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const upcomingPlan = getOrderPlan(upcomingPreorder);
  const upcomingWeekStart = getOrderWeekStart(upcomingPreorder);
  const hasUpcomingPreorder = Boolean(upcomingPreorder);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.unsubHero,
        { opacity: fadeIn, transform: [{ translateY: slideUp }] },
      ]}
    >
      {/* Decorative gradient-like top stripe */}
      <View style={styles.unsubStripe} />

      <View style={styles.unsubBody}>
        <AppText style={styles.unsubEyebrow}>
          {hasUpcomingPreorder
            ? "NEXT PREORDER LOCKED"
            : "NO ACTIVE PLAN THIS WEEK"}
        </AppText>
        <AppText style={styles.unsubHeadline}>
          {hasUpcomingPreorder
            ? `You're set for\n${formatWeekRange(upcomingWeekStart)}.`
            : "Choose next\nweek's plan."}
        </AppText>
        <AppText style={styles.unsubSubtitle}>
          {hasUpcomingPreorder
            ? `${upcomingPlan.name || "Your weekly plan"} is confirmed. Daily deliveries will appear in Orders when that meal week starts.`
            : "Browse the published weekly menu and preorder for the next delivery week."}
        </AppText>

        <Pressable
          style={({ pressed }) => [
            styles.unsubCTA,
            pressed && styles.unsubCTAPressed,
          ]}
          onPress={hasUpcomingPreorder ? onNavigateToOrders : onNavigateToPlans}
          accessibilityRole="button"
          accessibilityLabel={hasUpcomingPreorder ? "View orders" : "Browse meal plans"}
        >
          <AppText style={styles.unsubCTAText}>
            {hasUpcomingPreorder ? "View Orders" : "Browse Plans"}
          </AppText>
          <Ionicons name="arrow-forward" size={16} color={colors.surface} />
        </Pressable>

        <View style={styles.unsubFeatures}>
          {[
            "Weekly menus",
            "Macro-tracked",
            "Delivered fresh",
            "Not boring food",
          ].map((feat) => (
            <View key={feat} style={styles.unsubFeatureChip}>
              <View style={styles.unsubFeatureDot} />
              <AppText style={styles.unsubFeatureText}>{feat}</AppText>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen({
  user,
  onOpenWeeklyPlan,
  onBack,
  onNavigateToPlans,
  onNavigateToOrders,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const {
    browsingWeekStartDate,
    currentWeekStartDate,
    loading,
    mealsLoading,
    orders,
    ordersLoading,
    selectedPlanMeals,
    refreshCustomerData,
    subscriptionForWeek,
    setBrowsingWeek,
    setSelectedCategory,
    showCurrentWeek,
  } = usePlans();
  const [refreshing, setRefreshing] = useState(false);

  const handleBrowsePlans = () => {
    setBrowsingWeek(getNextWeekStartDate(currentWeekStartDate));
    if (onNavigateToPlans) onNavigateToPlans();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCustomerData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshCustomerData]);

  const isCurrentWeek = browsingWeekStartDate === currentWeekStartDate;
  const todayLabel = getTodayDayLabel();
  const subscriptionPlan = subscriptionForWeek?.published_weekly_plans;

  useEffect(() => {
    showCurrentWeek();
    if (subscriptionPlan?.category) {
      setSelectedCategory(normalizeCategory(subscriptionPlan.category));
    }
  }, [showCurrentWeek, setSelectedCategory, subscriptionPlan?.category]);

  const mealsByDay = useMemo(
    () => groupMealsByDay(selectedPlanMeals),
    [selectedPlanMeals],
  );
  const todayMeals = useMemo(
    () => mealsByDay.find((group) => group.day === todayLabel)?.meals || [],
    [mealsByDay, todayLabel],
  );
  const todayMacros = useMemo(() => sumMacros(todayMeals), [todayMeals]);

  const todayIndex = DAY_ORDER.indexOf(todayLabel);
  const upcomingGroups = useMemo(
    () =>
      mealsByDay.filter(
        (g) => DAY_ORDER.indexOf(g.day) > todayIndex && g.meals.length > 0,
      ),
    [mealsByDay, todayIndex],
  );

  const isSubscribed = !!subscriptionForWeek;
  const greeting = getGreeting();

  const upcomingPreorder = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return null;

    return (
      orders
        .filter((order) => getOrderWeekStart(order) > currentWeekStartDate)
        .sort((a, b) =>
          getOrderWeekStart(a).localeCompare(getOrderWeekStart(b)),
        )[0] || null
    );
  }, [currentWeekStartDate, orders]);

  // Hero fade-in
  const heroFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
      showsVerticalScrollIndicator={false}
    >
      <HeaderBar title="Today" onBack={onBack} />

      {/* ── Hero Greeting ── */}
      <Animated.View style={[styles.hero, { opacity: heroFade }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroTextBlock}>
            <AppText style={styles.greetingSmall}>{greeting}</AppText>
            <AppText style={styles.greeting}>
              {user?.name?.split(" ")[0] || "there"} 👋
            </AppText>
            <AppText style={styles.dayLabel}>
              {DAY_FULL_LABELS[todayLabel] || todayLabel}
            </AppText>
          </View>

          {/* TODO: Re-enable when streak data is wired to real backend */}
          {/* {isSubscribed && <StreakBadge streak={5} />} */}
        </View>

        {isSubscribed && subscriptionPlan && (
          <View style={styles.planBadge}>
            <View style={styles.planBadgeDot} />
            <AppText style={styles.planBadgeText}>
              {subscriptionPlan.name}
            </AppText>
          </View>
        )}
      </Animated.View>

      {loading && (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      )}

      {/* ── Unsubscribed State ── */}
      {!loading && !isSubscribed && (
        <UnsubscribedHero
          onNavigateToPlans={handleBrowsePlans}
          onNavigateToOrders={onNavigateToOrders}
          upcomingPreorder={ordersLoading ? null : upcomingPreorder}
        />
      )}

      {/* ── Subscribed Content ── */}
      {!loading && isSubscribed && (
        <>
          {/* Macro Rings */}
          {!mealsLoading && todayMeals.length > 0 && (
            <View style={styles.macroSection}>
              <AppText style={styles.macroSectionTitle}>
                Today's Nutrition
              </AppText>
              <View style={styles.macroRingsRow}>
                <MacroRing
                  value={todayMacros.calories}
                  max={2200}
                  label="Calories"
                  unit="kcal"
                  color={colors.accent}
                />
                <MacroRing
                  value={todayMacros.protein}
                  max={180}
                  label="Protein"
                  unit="g"
                  color={colors.success}
                />
                <MacroRing
                  value={todayMacros.carbs}
                  max={250}
                  label="Carbs"
                  unit="g"
                  color={colors.brand}
                />
                <MacroRing
                  value={todayMacros.fats}
                  max={80}
                  label="Fats"
                  unit="g"
                  color={colors.muted}
                />
              </View>
            </View>
          )}

          {/* Today's Meals Section */}
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Today's Meals</AppText>
            <View style={styles.sectionMetaBadge}>
              <AppText style={styles.sectionMeta}>{todayLabel}</AppText>
            </View>
          </View>

          {mealsLoading && (
            <ActivityIndicator
              color={colors.accent}
              style={styles.loaderSmall}
            />
          )}

          {!mealsLoading && isCurrentWeek && todayMeals.length > 0 && (
            <View style={styles.todayList}>
              {todayMeals.map((meal, index) => (
                <MealCard key={meal.id} meal={meal} index={index} />
              ))}
            </View>
          )}

          {!mealsLoading && isCurrentWeek && todayMeals.length === 0 && (
            <View style={styles.softNotice}>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.muted}
                style={{ marginBottom: 6 }}
              />
              <AppText style={styles.softNoticeText}>
                No meals uploaded for today yet. Check back soon.
              </AppText>
            </View>
          )}

          {!mealsLoading && !isCurrentWeek && (
            <View style={styles.softNotice}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.muted}
                style={{ marginBottom: 6 }}
              />
              <AppText style={styles.softNoticeText}>
                Today's meals appear when you're viewing the current week.
              </AppText>
            </View>
          )}

          {/* Coming Up */}
          {!mealsLoading && upcomingGroups.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Coming Up</AppText>
              </View>
              <View style={styles.weekPreview}>
                {upcomingGroups.map((group, idx) => (
                  <View
                    key={group.day}
                    style={[
                      styles.dayRow,
                      idx === upcomingGroups.length - 1 && styles.dayRowLast,
                    ]}
                  >
                    <View style={styles.dayBadge}>
                      <AppText style={styles.dayBadgeText}>{group.day}</AppText>
                    </View>
                    <View style={styles.dayMeals}>
                      {group.meals.slice(0, 2).map((meal) => (
                        <AppText
                          key={meal.id}
                          style={styles.dayMealText}
                          numberOfLines={1}
                        >
                          {meal.meal_name}
                        </AppText>
                      ))}
                      {group.meals.length > 2 && (
                        <AppText style={styles.moreMeals}>
                          +{group.meals.length - 2} more
                        </AppText>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.border}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Week CTA */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View full week menu"
            style={({ pressed }) => [
              styles.weekSummaryButton,
              pressed && styles.weekSummaryButtonPressed,
            ]}
            onPress={() => onOpenWeeklyPlan && onOpenWeeklyPlan()}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={colors.accent}
              style={{ marginRight: 8 }}
            />
            <AppText style={styles.weekSummaryButtonText}>
              View Full Week Menu
            </AppText>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.brand}
              style={{ marginLeft: "auto" }}
            />
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ meal, index }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.todayMealCard,
        { opacity: fadeIn, transform: [{ translateY: slideIn }] },
      ]}
    >
      <View style={styles.mealCardAccent} />
      <View style={styles.mealCardBody}>
        <AppText style={styles.todayMealTitle}>{meal.meal_name}</AppText>
        <View style={styles.mealMacroRow}>
          <MacroPill iconName="flame-outline"    value={`${meal.calories || 0}`}  label="kcal" />
          <MacroPill iconName="barbell-outline"  value={`${meal.protein_g || 0}g`} label="P" />
          <MacroPill iconName="leaf-outline"     value={`${meal.carbs_g || 0}g`}  label="C" />
          <MacroPill iconName="water-outline"    value={`${meal.fats_g || 0}g`}   label="F" />
        </View>
      </View>
    </Animated.View>
  );
}

// MacroPill — displays a single macro stat with an icon + value + label
function MacroPill({ iconName, value, label }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.macroPill} accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={iconName} size={11} color={colors.accent} />
      <AppText style={styles.macroPillValue}>{value}</AppText>
      <AppText style={styles.macroPillLabel}>{label}</AppText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 120,
    },

    // ── Hero ──
    hero: {
      marginBottom: 24,
      marginTop: 4,
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    heroTextBlock: {
      flex: 1,
    },
    greetingSmall: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.semibold,
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    greeting: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.hero,    // hero moment — black weight is justified here
      fontWeight: TYPOGRAPHY.black,
      marginBottom: 2,
      lineHeight: 36,
    },
    dayLabel: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.sm,
      fontWeight: TYPOGRAPHY.semibold,
      marginBottom: 10,
    },
    planBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.highlightSubtle,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.highlight,
      marginTop: 4,
    },
    planBadgeDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: colors.accent,
      marginRight: 7,
    },
    planBadgeText: {
      color: colors.brand,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.extrabold,
    },

    // ── Streak Badge ──
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#3d2b00" : "#fff8e6",
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1.5,
      borderColor: "#f5c842",
      shadowColor: "#f5c842",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    streakFire: {
      fontSize: 16,
      marginRight: 5,
    },
    streakText: {
      color: isDark ? "#f5c842" : "#a07800",
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.extrabold,
    },

    // ── Loader ──
    loader: {
      marginVertical: 26,
    },
    loaderSmall: {
      marginVertical: 14,
    },

    // ── Unsubscribed Hero ──
    unsubHero: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: isDark ? colors.surfaceGreen : colors.brand,
      marginBottom: 20,
      shadowColor: isDark ? "#000" : colors.brand,
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    unsubStripe: {
      height: 5,
      backgroundColor: colors.accent,
    },
    unsubBody: {
      padding: 28,
    },
    unsubEyebrow: {
      color: isDark ? colors.brand : colors.accent,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 2,
      marginBottom: 10,
      textTransform: "uppercase",
    },
    unsubHeadline: {
      color: "#ffffff",
      fontSize: 32,
      fontWeight: "900",
      lineHeight: 38,
      marginBottom: 14,
    },
    unsubSubtitle: {
      color: "rgba(255,255,255,0.65)",
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "500",
      marginBottom: 24,
    },
    unsubCTA: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 28,
      // Full-width CTA feels more intentional than a narrow pill
      alignSelf: "stretch",
      gap: 8,
      marginBottom: 24,
      shadowColor: colors.accent,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    unsubCTAPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.97 }],
    },
    unsubCTAText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "900",
    },
    unsubFeatures: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    unsubFeatureChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 11,
      gap: 6,
    },
    unsubFeatureDot: {
      width: 5,
      height: 5,
      borderRadius: 999,
      backgroundColor: isDark ? colors.brand : colors.accent,
    },
    unsubFeatureText: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 11,
      fontWeight: "700",
    },

    // ── Macro Rings ──
    macroSection: {
      marginBottom: 24,
    },
    macroSectionTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.md,
      fontWeight: TYPOGRAPHY.extrabold,
      marginBottom: 14,
    },
    macroRingsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    macroRingWrapper: {
      alignItems: "center",
      gap: 8,
    },
    macroRingCenter: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    macroRingValue: {
      fontSize: TYPOGRAPHY.base,
      fontWeight: TYPOGRAPHY.extrabold,
    },
    macroRingUnit: {
      color: colors.muted,
      fontSize: TYPOGRAPHY.xs - 2,  // intentionally small unit label
      fontWeight: TYPOGRAPHY.bold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    macroRingLabel: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.bold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // ── Section Headers ──
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.md,
      fontWeight: TYPOGRAPHY.extrabold,
    },
    sectionMetaBadge: {
      backgroundColor: colors.highlightSubtle,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 10,
    },
    sectionMeta: {
      color: colors.accent,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.bold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // ── Meal Cards ──
    todayList: {
      marginBottom: 16,
      gap: 10,
    },
    todayMealCard: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    mealCardAccent: {
      width: 4,
      backgroundColor: colors.accent,
    },
    mealCardBody: {
      flex: 1,
      padding: 14,
    },
    todayMealTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.base,
      fontWeight: TYPOGRAPHY.extrabold,
      marginBottom: 8,
    },
    mealMacroRow: {
      flexDirection: "row",
      gap: 6,
      flexWrap: "wrap",
    },
    macroPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 9,
      gap: 4,
    },
    macroPillValue: {
      color: colors.brand,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.extrabold,
    },
    macroPillLabel: {
      color: colors.muted,
      fontSize: TYPOGRAPHY.xs - 1,
      fontWeight: TYPOGRAPHY.semibold,
    },

    // ── Soft Notice ──
    softNotice: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 20,
      alignItems: "center",
      borderWidth: 1,
      // Solid border — dashed can render inconsistently on Android
      borderColor: colors.border,
      opacity: 0.85,
    },
    softNoticeText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },

    // ── Coming Up ──
    weekPreview: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    dayRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dayRowLast: {
      borderBottomWidth: 0,
    },
    dayBadge: {
      width: 44,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.highlightSubtle,
      marginRight: 12,
    },
    dayBadgeText: {
      color: colors.brand,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.extrabold,
    },
    dayMeals: {
      flex: 1,
    },
    dayMealText: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.sm,
      fontWeight: TYPOGRAPHY.bold,
      marginBottom: 2,
    },
    moreMeals: {
      color: colors.accent,
      fontSize: TYPOGRAPHY.xs,
      fontWeight: TYPOGRAPHY.extrabold,
    },

    // ── Week CTA ──
    weekSummaryButton: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 20,
      marginTop: 4,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    weekSummaryButtonPressed: {
      backgroundColor: colors.background,
      opacity: 0.85,
    },
    weekSummaryButtonText: {
      color: colors.brand,
      fontSize: TYPOGRAPHY.base,
      fontWeight: TYPOGRAPHY.extrabold,
    },
  });
