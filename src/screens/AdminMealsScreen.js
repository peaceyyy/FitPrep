import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { fetchMealsForPlan, normalizeDayLabel } from '../services/plansService';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'Cutting', label: 'Cutting' },
  { key: 'Bulking', label: 'Bulking' },
  { key: 'Maintenance', label: 'Maintenance' },
];

function createEmptyForm(weekStartDate) {
  return {
    week_start_date: weekStartDate,
    name: '',
    category: 'Cutting',
    description: '',
    weekly_price: '',
    is_published: false,
  };
}

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return '$--';
  return `$${value.toFixed(2)}/wk`;
}

function formatWeekStart(date) {
  if (!date) return 'Week not set';
  return `Week of ${new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export default function AdminMealsScreen({ onCreateMeal, onBack }) {
  const { currentWeekStartDate, plans, loading, error, source, removePlan, savePlan } = usePlans();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [form, setForm] = useState(() => createEmptyForm(currentWeekStartDate));
  const [saving, setSaving] = useState(false);
  const [mealSnapshots, setMealSnapshots] = useState({});

  const filteredPlans = useMemo(() => {
    if (selectedCategory === 'all') return plans;
    return plans.filter((plan) => plan.category === selectedCategory);
  }, [plans, selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadMealSnapshots() {
      const entries = await Promise.all(
        plans.map(async (plan) => {
          const { data } = await fetchMealsForPlan(plan.id);
          return [plan.id, data || []];
        }),
      );

      if (!cancelled) {
        setMealSnapshots(Object.fromEntries(entries));
      }
    }

    if (plans.length > 0) {
      loadMealSnapshots();
    } else {
      setMealSnapshots({});
    }

    return () => {
      cancelled = true;
    };
  }, [plans]);

  const isPlanPublishReady = (planId) => {
    const meals = mealSnapshots[planId] || [];
    const weekdays = new Set(meals.map((meal) => normalizeDayLabel(meal.day_of_week)));
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every((day) => weekdays.has(day));
  };

  const canPublishCurrentForm = editingPlanId ? isPlanPublishReady(editingPlanId) : false;

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingPlanId(null);
    setForm(createEmptyForm(currentWeekStartDate));
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setForm({
      week_start_date: plan.week_start_date || currentWeekStartDate,
      name: plan.name || '',
      category: plan.category || 'Cutting',
      description: plan.description || '',
      weekly_price: plan.weekly_price?.toString() || '',
      is_published: Boolean(plan.is_published),
    });
  };

  const handleSavePlan = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Please enter a plan name.');
      return;
    }

    if (form.is_published && !canPublishCurrentForm) {
      Alert.alert('Publishing Not Ready', 'Add meals for Monday through Friday before publishing this plan.');
      return;
    }

    setSaving(true);
    const { error: saveError } = await savePlan({
      week_start_date: form.week_start_date.trim(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      weekly_price: Number(form.weekly_price) || 0,
      is_published: form.is_published,
    }, editingPlanId);
    setSaving(false);

    if (saveError) {
      Alert.alert('Save Failed', saveError.message);
      return;
    }

    resetForm();
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

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Meal Management" action={{ icon: 'bell', onPress: () => {} }} onBack={onBack} />

      <AppText style={styles.subHeading}>ADMINISTRATION</AppText>
      <AppText style={styles.title}>Active Meal Plans</AppText>
      <View style={styles.sourcePill}>
        <AppText style={styles.sourceText}>{source === 'supabase' ? 'Live Supabase data' : 'Mock fallback data'}</AppText>
      </View>

      <View style={styles.formCard}>
        <AppText style={styles.formTitle}>{editingPlanId ? 'Edit Weekly Plan' : 'Create Weekly Plan'}</AppText>

        <AppText style={styles.fieldLabel}>Week Start Date</AppText>
        <TextInput
          value={form.week_start_date}
          onChangeText={(value) => updateForm('week_start_date', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>Plan Name</AppText>
        <TextInput
          value={form.name}
          onChangeText={(value) => updateForm('name', value)}
          placeholder="e.g., Cut - June 1"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>Category</AppText>
        <View style={styles.inlineChips}>
          {categories.filter((category) => category.key !== 'all').map((category) => (
            <Pressable
              key={category.key}
              style={[styles.smallChip, form.category === category.key && styles.smallChipActive]}
              onPress={() => updateForm('category', category.key)}
            >
              <AppText style={[styles.smallChipText, form.category === category.key && styles.smallChipTextActive]}>
                {category.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <AppText style={styles.fieldLabel}>Description</AppText>
        <TextInput
          value={form.description}
          onChangeText={(value) => updateForm('description', value)}
          placeholder="Short customer-facing plan description"
          placeholderTextColor={COLORS.textTertiary}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <AppText style={styles.fieldLabel}>Weekly Price</AppText>
        <TextInput
          value={form.weekly_price}
          onChangeText={(value) => updateForm('weekly_price', value)}
          placeholder="149.99"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <View style={styles.publishRow}>
          <View>
            <AppText style={styles.publishLabel}>{form.is_published ? 'Published' : 'Draft'}</AppText>
            <AppText style={styles.publishHint}>{canPublishCurrentForm ? 'Ready to publish' : 'Needs Mon-Fri meals before publish'}</AppText>
          </View>
          <Pressable
            style={[styles.publishToggle, form.is_published && styles.publishToggleActive, !canPublishCurrentForm && styles.publishToggleDisabled]}
            onPress={() => {
              if (!form.is_published && !canPublishCurrentForm) {
                Alert.alert('Publishing Not Ready', 'Add meals for Monday through Friday before publishing this plan.');
                return;
              }
              updateForm('is_published', !form.is_published);
            }}
          >
            <AppText style={[styles.publishToggleText, form.is_published && styles.publishToggleTextActive]}>
              {form.is_published ? 'On' : 'Off'}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.formActions}>
          {editingPlanId && (
            <Pressable style={styles.secondaryButton} onPress={resetForm}>
              <AppText style={styles.secondaryButtonText}>Cancel</AppText>
            </Pressable>
          )}
          <Pressable style={[styles.primaryButton, saving && styles.buttonDisabled]} onPress={handleSavePlan} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#ffffff" />
              : <AppText style={styles.primaryButtonText}>{editingPlanId ? 'Save Changes' : 'Create Plan'}</AppText>
            }
          </Pressable>
        </View>
      </View>

      <View style={styles.tabRow}>
        {categories.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.tabChip, selectedCategory === c.key && styles.tabChipActive]}
            onPress={() => setSelectedCategory(c.key)}
          >
            <AppText style={[styles.tabLabel, selectedCategory === c.key && styles.tabLabelActive]}>{c.label}</AppText>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator color={COLORS.accent} style={styles.loader} />}
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}

      {!loading && filteredPlans.length === 0 && !error && (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyTitle}>No plans found</AppText>
          <AppText style={styles.emptyText}>Published weekly plans will appear here after they are available.</AppText>
        </View>
      )}

      {!loading && filteredPlans.map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <View style={styles.planImage}>
            <AppText style={styles.planImageText}>{plan.category?.slice(0, 1) || 'P'}</AppText>
          </View>
          <View style={styles.planBody}>
            <View style={styles.planHeader}>
              <View style={styles.planTitleGroup}>
                <AppText style={styles.planTitle}>{plan.name}</AppText>
                <AppText style={styles.planCategory}>{plan.category}</AppText>
              </View>
              <View style={[styles.statusChip, !plan.is_published && styles.statusChipMuted]}>
                <AppText style={styles.statusText}>{plan.is_published ? 'Published' : 'Draft'}</AppText>
              </View>
            </View>
            <AppText style={styles.planSubtitle}>{plan.description || 'No description yet.'}</AppText>
            <AppText style={styles.planWeek}>{formatWeekStart(plan.week_start_date)}</AppText>
            <AppText style={[styles.readinessText, isPlanPublishReady(plan.id) ? styles.readinessReady : styles.readinessMissing]}>
              {isPlanPublishReady(plan.id) ? 'Publishing ready' : 'Needs weekday meals before publish'}
            </AppText>
            <View style={styles.footerRow}>
              <AppText style={styles.planPrice}>{formatPrice(plan.weekly_price)}</AppText>
              <View style={styles.controlsRow}>
                <Pressable style={styles.actionButton} onPress={() => onCreateMeal(plan)}>
                  <AppText style={styles.actionText}>Add Meal</AppText>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => handleEditPlan(plan)}>
                  <AppText style={styles.actionText}>Edit</AppText>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.deleteAction]} onPress={() => handleDeletePlan(plan)}>
                  <AppText style={[styles.actionText, styles.deleteActionText]}>Delete</AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ))}

      <Pressable style={styles.addFab} onPress={() => onCreateMeal()}>
        <AppText style={styles.addFabText}>＋</AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 140 },
  subHeading: { color: COLORS.accent, fontSize: 12, letterSpacing: 1.2, marginBottom: 6 },
  title: { color: COLORS.brand, fontSize: 28, fontWeight: '900', marginBottom: 10 },
  sourcePill: { alignSelf: 'flex-start', backgroundColor: '#eef4dd', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, marginBottom: 16 },
  sourceText: { color: COLORS.brand, fontSize: 12, fontWeight: '700' },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18 },
  formTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 12 },
  fieldLabel: { color: COLORS.brand, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 14, color: COLORS.brand },
  textarea: { minHeight: 78, textAlignVertical: 'top' },
  inlineChips: { flexDirection: 'row', flexWrap: 'wrap' },
  smallChip: { backgroundColor: '#f4f7ef', borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 9, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  smallChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  smallChipText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },
  smallChipTextActive: { color: COLORS.surface },
  publishRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  publishLabel: { color: COLORS.brand, fontWeight: '800' },
  publishHint: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  publishToggle: { backgroundColor: '#f0f1ea', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  publishToggleActive: { backgroundColor: '#dff4da' },
  publishToggleDisabled: { opacity: 0.55 },
  publishToggleText: { color: COLORS.muted, fontWeight: '900' },
  publishToggleTextActive: { color: COLORS.brand },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 },
  primaryButton: { backgroundColor: COLORS.brand, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center' },
  primaryButtonText: { color: COLORS.surface, fontWeight: '900' },
  secondaryButton: { borderRadius: 18, paddingVertical: 13, paddingHorizontal: 18, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  secondaryButtonText: { color: COLORS.brand, fontWeight: '900' },
  buttonDisabled: { opacity: 0.65 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  tabChip: { backgroundColor: COLORS.surface, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, marginBottom: 10 },
  tabChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  tabLabel: { color: COLORS.brand, fontWeight: '700' },
  tabLabelActive: { color: COLORS.surface },
  planCard: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18, overflow: 'hidden' },
  planImage: { width: '100%', height: 100, backgroundColor: '#e8ecdf', alignItems: 'center', justifyContent: 'center' },
  planImageText: { color: COLORS.brand, fontSize: 32, fontWeight: '900' },
  planBody: { padding: 18 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  planTitleGroup: { flex: 1, paddingRight: 10 },
  planTitle: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  planCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
  planSubtitle: { color: COLORS.textSecondary, marginBottom: 12 },
  planWeek: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 14 },
  readinessText: { fontSize: 12, fontWeight: '800', marginBottom: 14 },
  readinessReady: { color: COLORS.success },
  readinessMissing: { color: COLORS.danger },
  statusChip: { backgroundColor: '#dff4da', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 },
  statusChipMuted: { backgroundColor: '#f0f1ea' },
  statusText: { color: COLORS.brand, fontSize: 11, fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planPrice: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
  actionButton: { backgroundColor: '#edf7d7', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8 },
  actionText: { color: COLORS.brand, fontWeight: '800' },
  deleteAction: { backgroundColor: '#fff6f6' },
  deleteActionText: { color: COLORS.danger },
  loader: { marginVertical: 24 },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '700', marginBottom: 16 },
  emptyState: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { color: COLORS.brand, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  addFab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  addFabText: { color: COLORS.surface, fontSize: 32, fontWeight: '900' },
});
