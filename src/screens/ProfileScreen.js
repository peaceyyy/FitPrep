import AppText from '../components/AppText';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';

function getActiveDays(createdAt) {
  if (!createdAt) return 0;
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return 0;

  const elapsedMs = Date.now() - createdDate.getTime();
  if (elapsedMs < 0) return 0;
  return Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));
}

function getOrderPlan(order) {
  return order?.plan_snapshot || order?.published_weekly_plans || {};
}

function formatMacro(value, suffix = 'g') {
  const amount = Math.round(Number(value || 0));
  return `${amount}${suffix}`;
}

export default function ProfileScreen({ user, onLogout, onEditProfile, onBack }) {
  const { orders, selectedPlanMeals } = usePlans();

  const stats = useMemo(() => {
    const orderCount = Array.isArray(orders) ? orders.length : 0;

    return [
      { label: 'Active Days', value: `${getActiveDays(user.created_at)}` },
      { label: 'Ordered Meals', value: `${orderCount * 21}` },
    ];
  }, [orders, user.created_at]);

  const macros = useMemo(() => {
    const meals = Array.isArray(selectedPlanMeals) ? selectedPlanMeals : [];
    const totals = meals.reduce((sum, meal) => ({
      calories: sum.calories + Number(meal.calories || 0),
      protein: sum.protein + Number(meal.protein_g || 0),
      carbs: sum.carbs + Number(meal.carbs_g || 0),
      fats: sum.fats + Number(meal.fats_g || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const mealCount = meals.length;
    const average = mealCount
      ? {
          calories: totals.calories / mealCount,
          protein: totals.protein / mealCount,
          carbs: totals.carbs / mealCount,
          fats: totals.fats / mealCount,
        }
      : totals;

    return { mealCount, totals, average };
  }, [selectedPlanMeals]);

  const recentPlanNames = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    return orders
      .slice(0, 2)
      .map((order) => getOrderPlan(order).name)
      .filter(Boolean);
  }, [orders]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Profile" onBack={onBack} />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <AppText style={styles.avatarInitial}>
                {(user.name || '?')[0].toUpperCase()}
              </AppText>
            )}
          </View>
        </View>
        <AppText style={styles.userName}>{user.name}</AppText>
        <AppText style={styles.userEmail}>{user.email}</AppText>
        <AppText style={styles.userRole}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</AppText>
        <Pressable style={styles.editButton} onPress={() => onEditProfile('Personal Information')}>
          <AppText style={styles.editButtonText}>Edit Profile</AppText>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statItem}>
            <AppText style={styles.statLabel}>{item.label.toUpperCase()}</AppText>
            <AppText style={styles.statValue}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <AppText style={styles.sectionTitle}>Account Details</AppText>
          <Pressable style={styles.iconButton} onPress={() => onEditProfile('Personal Information')}>
            <AppText style={styles.iconButtonText}>✎</AppText>
          </Pressable>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Email</AppText>
          <AppText style={styles.infoValue}>{user.email || 'Not provided'}</AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>GCash Number</AppText>
          <AppText style={styles.infoValue}>{user.contactNumber || 'Not provided'}</AppText>
        </View>
        <View style={styles.infoRowLast}>
          <AppText style={styles.infoLabel}>Delivery Address</AppText>
          <AppText style={styles.infoValue}>{user.address || 'No delivery address yet'}</AppText>
        </View>
      </View>

      <View style={styles.macroCard}>
        <View style={styles.infoHeader}>
          <AppText style={styles.sectionTitle}>Meal Macros Summary</AppText>
          <AppText style={styles.planHint}>{macros.mealCount || 0} meals</AppText>
        </View>
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <AppText style={styles.macroLabel}>Weekly Calories</AppText>
            <AppText style={styles.macroValue}>{formatMacro(macros.totals.calories, '')}</AppText>
          </View>
          <View style={styles.macroItem}>
            <AppText style={styles.macroLabel}>Avg / Meal</AppText>
            <AppText style={styles.macroValue}>{formatMacro(macros.average.calories, '')}</AppText>
          </View>
          <View style={styles.macroItem}>
            <AppText style={styles.macroLabel}>Protein</AppText>
            <AppText style={styles.macroValue}>{formatMacro(macros.totals.protein)}</AppText>
          </View>
          <View style={styles.macroItem}>
            <AppText style={styles.macroLabel}>Carbs / Fats</AppText>
            <AppText style={styles.macroValue}>{formatMacro(macros.totals.carbs)} / {formatMacro(macros.totals.fats)}</AppText>
          </View>
        </View>
        {recentPlanNames.length > 0 && (
          <AppText style={styles.planSummary}>Recent orders: {recentPlanNames.join(', ')}</AppText>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <AppText style={styles.logoutText}>LOGOUT</AppText>
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 999,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.brand,
  },
  avatarEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    color: COLORS.surface,
    fontSize: 16,
  },
  userName: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  userEmail: {
    color: COLORS.muted,
    marginBottom: 6,
  },
  userRole: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
  },
  editButton: {
    backgroundColor: COLORS.highlight,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  editButtonText: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  macroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.brand,
    fontSize: 17,
    fontWeight: '800',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.highlightSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: COLORS.brand,
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  infoRowLast: {
    paddingTop: 12,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: COLORS.brand,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    backgroundColor: '#f8faf4',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e8edde',
  },
  macroLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  macroValue: {
    color: COLORS.brand,
    fontSize: 19,
    fontWeight: '800',
  },
  planHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  planSummary: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 15,
  },
});
